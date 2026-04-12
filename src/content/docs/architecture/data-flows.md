---
title: "Enterprise Data Flows"
description: "Data flow architecture across Acme Corporation subsidiaries"
---

<!-- title: Enterprise Data Flows | last-updated: 2025-03-15 | owner: Acme Tech — Data Platform | status: current -->

# Enterprise Data Flows

## Overview

Data flows across Acme Corp's seven subsidiaries through a combination of real-time event streams, scheduled ETL pipelines, batch file transfers, and REST API integrations. Acme Tech's Data Platform team manages the centralized Snowflake analytics platform that consolidates data from all subsidiaries for enterprise reporting, cross-subsidiary analytics, and regulatory compliance.

This document maps the enterprise data flows, documents ETL pipelines per subsidiary, describes the Snowflake data sharing model, and captures the current state of master data management — including known gaps and planned improvements.

For the integration topology that these data flows traverse, see the [Integration Architecture Overview](./integration-overview.md).

## Enterprise Data Flow Map

```
  ┌──────────────────────────────────────────────────────────────────────┐
  │                    SNOWFLAKE (Acme Tech)                             │
  │                                                                      │
  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
  │  │RETAIL_DW │ │ FSI_DW   │ │INSUR_DW  │ │DISTRI_DW │ │ TELCO_DW │  │
  │  └────▲─────┘ └────▲─────┘ └────▲─────┘ └────▲─────┘ └────▲─────┘  │
  │       │            │            │            │            │          │
  │  ┌────┼────┐  ┌────┼────┐ ┌────┼────┐  ┌────┼────┐ ┌────┼────┐    │
  │  │MEDIA_DW │  │PLAT_DW  │ │ ENTERPRISE_SHARED  │  │  dbt      │    │
  │  └────▲────┘  └────▲────┘ │ (cross-sub views)  │  │(transform)│    │
  │       │            │      └─────────────────────┘  └───────────┘    │
  └───────┼────────────┼────────────────────────────────────────────────┘
          │            │
  ┌───────┼────────────┼──────────────────────────────────────┐
  │       │   Azure Data Factory (Orchestration)               │
  │       │            │                                        │
  └───────┼────────────┼──────────────────────────────────────┘
          │            │
    ──────┼────────────┼──────────────────────────────────
          │            │
  ┌───────┴──┐   ┌────┴─────┐   ┌───────────┐   ┌────────────┐
  │  Media   │   │Acme Tech │   │   Retail   │   │    FSI     │
  │ClickHse │   │ Datadog  │   │ SQL Server │   │   Oracle   │
  │ MongoDB  │   │ GitHub   │   │ PostgreSQL │   │ PostgreSQL │
  └──────────┘   └──────────┘   │Elasticsearch│   │   Kafka    │
                                └──────┬──────┘   └─────┬──────┘
                                       │                │
    ┌────────────┐   ┌──────────┐     │     ┌──────────┴──────────┐
    │ Insurance  │   │  Distri  │     │     │  Cross-Subsidiary   │
    │    DB2     │   │ SAP HANA │     │     │   Event Flows:      │
    │ SQL Svr   │   │ InfluxDB │     │     │   Kafka → Bridge    │
    │  (SFTP)   │   │          │     │     │    → RabbitMQ       │
    └────────────┘   └──────────┘     │     └─────────────────────┘
                                      │
                               ┌──────┴──────┐
                               │   Telco     │
                               │   Oracle    │
                               │ TimescaleDB │
                               └─────────────┘
```

### Key Data Flows

**Subsidiary → Snowflake (Analytics):**
- Retail → Snowflake: Sales transactions, customer activity, inventory levels (daily ETL via Azure Data Factory)
- Financial Services → Snowflake: Transaction volumes, revenue, risk metrics (near-real-time via Kafka Connect Snowflake connector)
- Insurance → Snowflake: Claims data, policy data, actuarial summaries (daily batch via SFTP → Azure Blob → Data Factory)
- Distribution → Snowflake: Warehouse operations, shipping metrics, inventory levels (daily ETL from SAP via Data Factory)
- Telco → Snowflake: Subscriber metrics, network KPIs, usage data (hourly ETL from Oracle/TimescaleDB)
- Media → Snowflake: Streaming metrics, content performance, ad revenue (near-real-time from ClickHouse via custom Go ETL)
- Acme Tech → Snowflake: Platform metrics, CI/CD pipeline data, security events (daily ETL from Datadog/GitHub)

**Cross-Subsidiary Data Flows:**
- FSI ↔ Insurance: Shared customer data (event-driven via Kafka + daily batch reconciliation)
- FSI → Retail: Settlement data (daily batch CSV via Azure Blob Storage)
- Retail ↔ Distribution: Order and inventory data (REST APIs + RabbitMQ events)

## ETL Pipelines per Subsidiary

| Subsidiary | Source Systems | Data Extracted | Frequency | Format | Pipeline Tool | Destination |
|---|---|---|---|---|---|---|
| Retail | SQL Server, PostgreSQL, Elasticsearch | Sales, customers, inventory, search analytics | Daily (T+1) | Parquet | Azure Data Factory | Snowflake `RETAIL_DW` |
| Financial Services | Oracle, PostgreSQL, Kafka | Transactions, accounts, risk scores | Near-real-time | Avro → Parquet | Kafka Connect + Snowpipe | Snowflake `FSI_DW` |
| Insurance | DB2, SQL Server 2012 | Claims, policies, actuarial data | Daily (T+1) | CSV / fixed-width | SFTP → Blob → Data Factory | Snowflake `INSURANCE_DW` |
| Distribution | SAP HANA, InfluxDB | Warehouse ops, shipping, IoT metrics | Daily (T+1) | IDoc → CSV → Parquet | SAP Data Services → Data Factory | Snowflake `DISTRIBUTION_DW` |
| Telco | Oracle, TimescaleDB | Subscribers, usage, network KPIs | Hourly | Parquet | Azure Data Factory | Snowflake `TELCO_DW` |
| Media | MongoDB, ClickHouse | Content performance, streaming, ad revenue | Near-real-time | JSON → Parquet | Custom Go ETL + Snowpipe | Snowflake `MEDIA_DW` |
| Acme Tech | Datadog, GitHub API | Platform metrics, pipeline data, security events | Daily (T+1) | JSON → Parquet | Azure Data Factory | Snowflake `PLATFORM_DW` |

### Pipeline Monitoring

All ETL pipelines are monitored through Datadog with the following alerting:
- **Pipeline failure** — Immediate alert to the owning subsidiary's data engineering team via PagerDuty.
- **Pipeline delay** — Warning alert if a pipeline misses its SLA window by more than 30 minutes.
- **Data volume anomaly** — Alert if extracted row count deviates by more than 20% from the 7-day rolling average (potential data quality issue or source system problem).

## Snowflake Data Sharing Model

Each subsidiary has its own Snowflake database within the Acme Corp Snowflake account:

- `RETAIL_DW` — Sales transactions, customer profiles, product catalog, inventory snapshots
- `FSI_DW` — Financial transactions, accounts, risk scores, compliance data
- `INSURANCE_DW` — Claims, policies, actuarial models, regulatory reports
- `DISTRIBUTION_DW` — Warehouse operations, shipping records, IoT sensor data
- `TELCO_DW` — Subscriber data, network metrics, usage records, billing
- `MEDIA_DW` — Content metadata, streaming sessions, ad impressions, revenue
- `PLATFORM_DW` — CI/CD metrics, security events, platform health data

### Cross-Subsidiary Data Sharing

Acme Tech manages cross-subsidiary data access using Snowflake Secure Data Sharing:

- **`ENTERPRISE_SHARED` database** contains curated cross-subsidiary views maintained by Acme Tech's Data Platform team. These views join data across subsidiary databases for enterprise-level analytics (e.g., `fct_consolidated_revenue`, `dim_shared_customers`).
- **Role-Based Access Control (RBAC):**
  - Subsidiary analysts can query their own database plus the `ENTERPRISE_SHARED` views.
  - Enterprise analysts (Acme Tech) can query all databases.
  - Row-level security on sensitive data: PII fields are masked for non-privileged roles. Financial details are restricted to FSI and authorized enterprise analysts.
- **Data share governance:** Each subsidiary's data engineering team approves which tables and views are shared in `ENTERPRISE_SHARED`. No direct cross-subsidiary database access is permitted — all sharing is through curated views.

## Master Data Management (MDM)

### Customer Master — Current State

No single customer 360 view exists today. Customer data is distributed across subsidiaries:

- **Financial Services** owns financial customer data — KYC-verified, regulatory-grade customer records with identity verification, credit scores, and account relationships.
- **Retail** owns consumer and shopper data — BookStore accounts, purchase history, browsing behavior, and loyalty program membership.
- **Insurance** owns policyholder data — policy records, claims history, and actuarial risk profiles. Significant overlap with FSI customers.

A `shared_customer_id` links accounts where customers have been matched across subsidiaries based on email address and name fuzzy matching. Current coverage: approximately 35% of cross-subsidiary customers are linked. The remaining 65% have accounts in multiple subsidiaries that are not yet correlated.

### Product Master — Current State

Retail owns the product catalog (books, merchandise). Distribution maintains SKU-level inventory data synchronized with Retail. No unified product master exists across all subsidiaries — products are domain-specific to each subsidiary.

### MDM Aspirational State

Acme Tech is evaluating a centralized MDM platform to create a unified customer 360 and improve cross-subsidiary customer linkage. Timeline: assessment phase in the current fiscal year, vendor selection and pilot implementation in the next fiscal year. The target is to achieve 80%+ customer linkage through a combination of deterministic matching (email, phone, government ID) and probabilistic matching (name, address similarity).

## Data Quality Standards

Each subsidiary publishes Data Quality SLOs for their data products in Snowflake:

| Quality Dimension | Target | Measurement |
|---|---|---|
| Completeness | > 99% non-null for required fields | Automated dbt tests post-ETL |
| Freshness | Within SLA per pipeline (see ETL table) | Datadog monitors on last successful load timestamp |
| Accuracy | < 0.1% variance vs. source system counts | Daily reconciliation checks comparing source and target row counts |
| Uniqueness | Zero duplicate primary keys | dbt unique tests on all primary key columns |

Data quality checks run as dbt tests after each ETL load. Failures trigger Datadog alerts to the subsidiary's data engineering team. Critical data quality issues (e.g., duplicate financial transactions) escalate to the Data Platform team and the subsidiary's tech lead.

## Event Streaming Topology

### Kafka Cluster (Financial Services)

Apache Kafka is managed by Acme Financial Services for financial event streaming. Key topics:

| Topic | Producer | Consumers | Event Rate |
|---|---|---|---|
| `payments.authorized` | Payments Gateway | Order Service (via bridge), Risk Engine | ~2,000/min |
| `payments.captured` | Payments Gateway | Retail (via bridge), Settlement Service | ~1,500/min |
| `payments.refunded` | Payments Gateway | Retail (via bridge), Finance Reporting | ~100/min |
| `transactions.completed` | Core Banking | Risk Engine, Regulatory Reporting, Snowflake (Kafka Connect) | ~5,000/min |
| `risk.score.updated` | Risk Engine | Core Banking, Compliance | ~500/min |
| `customer.kyc.verified` | KYC Service | Core Banking, Insurance (via bridge) | ~200/min |

### RabbitMQ Instances

**Retail RabbitMQ** — Order lifecycle events (`order.created`, `order.confirmed`, `order.shipped`, `order.delivered`), inventory update events, and search index update events.

**Media RabbitMQ** — Content publication events, streaming session start/end events, ad impression events, and content recommendation update events.

### No Unified Event Backbone — Current Gap

Cross-subsidiary event routing is currently handled by point-to-point integrations. For example, FSI Kafka → custom bridge → Retail webhook for payment confirmations. This approach works but has limitations: no centralized schema registry, no cross-subsidiary event replay, and limited event discoverability.

**Future direction:** Acme Tech is evaluating Confluent Cloud as a unified event platform that would provide centralized schema registry, cross-subsidiary event routing with topic-level access control, event replay capability across the group, and unified monitoring. Timeline: proof-of-concept in the next quarter, production readiness assessment in H2.

## Related Documentation

- [Analytics Platform](./analytics-platform.md) — Snowflake platform, dbt transformations, and BI tools
- [Integration Architecture Overview](./integration-overview.md) — Integration topology and communication patterns
- [Cross-Subsidiary API Contracts](../api/cross-subsidiary-contracts.md) — API contract catalog
- [Acme Tech Data Platform](../../acme-tech/data/platform-overview.md) — Data platform architecture
- [Acme Retail Data Architecture](../../acme-retail/data/architecture.md) — Retail data systems
- [Acme Financial Services Data Architecture](../../acme-financial-services/data/architecture.md) — FSI data systems
