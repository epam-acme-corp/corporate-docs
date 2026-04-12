---
title: "Enterprise Analytics Platform"
description: "Architecture and design of the Snowflake-based enterprise analytics platform"
---

<!-- title: Enterprise Analytics Platform | last-updated: 2025-03-15 | owner: Acme Tech — Data Platform | status: current -->

# Enterprise Analytics Platform

## Snowflake Analytics Platform Overview

The enterprise analytics platform is built on Snowflake Enterprise Edition on Azure (primary region: East US 2, failover region: West US 2). Managed by Acme Tech's Data Platform team, Snowflake serves as the consolidated analytics layer for all seven subsidiaries, providing a single source of truth for enterprise reporting, cross-subsidiary analytics, and regulatory compliance.

### Virtual Warehouse Configuration

Snowflake virtual warehouses are sized per use case to balance performance and cost:

| Warehouse Size | Use Case | Auto-Suspend | Scaling Policy |
|---|---|---|---|
| X-Small (XS) | Ad-hoc analyst queries, data exploration | 5 minutes | Single cluster |
| Small (S) | BI dashboard refresh (Tableau, Looker) | 5 minutes | 1–3 clusters (auto-scale) |
| Medium (M) | dbt transformation runs, scheduled reports | 5 minutes | 1–2 clusters |
| Large (L) | Data science workloads, ML model training | 5 minutes | Single cluster |
| X-Large (XL) | Quarterly/annual consolidated reporting, regulatory reports | Immediate after completion | Single cluster, scheduled |

Auto-suspend after 5 minutes of inactivity is enforced across all warehouses to manage costs. Auto-resume ensures warehouses start automatically when queries arrive, with typical resume time under 5 seconds.

### Database Architecture

Each subsidiary has a dedicated Snowflake database:

| Database | Owner | Key Schemas | Update Frequency |
|---|---|---|---|
| `RETAIL_DW` | Retail Data Engineering | `raw`, `staging`, `marts` | Daily (T+1) |
| `FSI_DW` | FSI Data Engineering | `raw`, `staging`, `marts` | Near-real-time |
| `INSURANCE_DW` | Insurance Data Engineering | `raw`, `staging`, `marts` | Daily (T+1) |
| `DISTRIBUTION_DW` | Distribution Data Engineering | `raw`, `staging`, `marts` | Daily (T+1) |
| `TELCO_DW` | Telco Data Engineering | `raw`, `staging`, `marts` | Hourly |
| `MEDIA_DW` | Media Data Engineering | `raw`, `staging`, `marts` | Near-real-time |
| `PLATFORM_DW` | Acme Tech Data Platform | `raw`, `staging`, `marts` | Daily (T+1) |
| `ENTERPRISE_SHARED` | Acme Tech Data Platform | `cross_subsidiary`, `reporting` | After upstream refreshes |

## Cross-Subsidiary Analytics Use Cases

### Consolidated Revenue Reporting

Aggregates revenue data across all subsidiaries for quarterly earnings reports and board presentations. Data sources include Financial Services (transaction revenue, interest income, fees), Retail (product sales, marketplace commission), Insurance (premium income, claims payouts — net), Telco (subscription revenue, usage-based charges), Media (advertising revenue, streaming subscriptions), and Distribution (logistics service fees, warehousing charges).

The dbt model `cross_subsidiary.fct_consolidated_revenue` joins revenue data from all subsidiary marts. Revenue recognition rules vary by subsidiary — the model applies standardized accounting treatments defined by the Group CFO's office.

### Customer Lifetime Value (CLV) Across Products

Links customers across subsidiaries where `shared_customer_id` exists to calculate total group CLV. This enables identifying high-value customers who use multiple Acme Corp products (e.g., a customer with a financial account, a BookStore account, and a Telco subscription).

Current limitation: only approximately 35% of cross-subsidiary customers are linked via `shared_customer_id`. CLV calculations for unlinked customers are subsidiary-specific only. The MDM initiative (see [Enterprise Data Flows](./data-flows.md)) aims to increase linkage to 80%+.

### Operational Efficiency Benchmarking

Compares operational metrics across subsidiaries to identify best practices and areas for improvement:

- **Deployment frequency** — Average deployments per week per service. Source: GitHub Actions pipeline data in `PLATFORM_DW`.
- **Incident rates** — P1/P2 incidents per month. Source: Datadog incident data in `PLATFORM_DW`.
- **Time-to-resolution** — Mean time to resolve incidents. Source: PagerDuty/Datadog integration data.
- **SLO compliance** — Percentage of SLOs met per subsidiary. Source: Datadog SLO data.

These metrics feed Acme Tech's quarterly Architecture Review Board reports.

### Regulatory Consolidated Reporting

For Financial Services and Insurance, Snowflake produces consolidated reports required by regulators:

- **Solvency ratios and capital adequacy** (Insurance + FSI) — Quarterly consolidated reports joining FSI's capital position with Insurance's reserve adequacy.
- **Transaction monitoring reports** (FSI) — Suspicious activity reporting, large transaction tracking.
- **Claims and loss ratios** (Insurance) — State-level regulatory filings.

Regulatory reports are generated by dedicated dbt models in the `cross_subsidiary.regulatory` schema with strict access controls and audit logging.

## dbt Transformation Layer

dbt (data build tool) manages all data transformations in Snowflake. The dbt project is maintained by Acme Tech's Data Platform team with contributions from subsidiary data engineers.

### Model Structure

| Layer | Purpose | Naming Convention | Example |
|---|---|---|---|
| `staging/` | Per-subsidiary staging models — 1:1 mapping from raw ETL tables with light cleaning (type casting, null handling, column renaming) | `stg_{subsidiary}_{entity}` | `stg_retail_orders` |
| `intermediate/` | Business logic transformations — joins, calculations, deduplication, business rule application | `int_{domain}_{description}` | `int_payments_with_orders` |
| `marts/` | Final analytical models consumed by BI tools — star schema with fact and dimension tables | `fct_{entity}` / `dim_{entity}` | `fct_daily_sales`, `dim_customers` |
| `cross_subsidiary/` | Models that join data across subsidiaries for enterprise-level analytics | `fct_{description}` / `dim_{description}` | `fct_consolidated_revenue`, `dim_shared_customers` |

### Orchestration

dbt runs are orchestrated by Azure Data Factory on the following schedule:

- **Daily full refresh** — All staging and mart models rebuild at 04:00 UTC after ETL pipelines complete.
- **Hourly incremental** — FSI and Media incremental models run hourly for near-real-time analytics.
- **Cross-subsidiary models** — Run after all upstream subsidiary models complete (typically by 06:00 UTC).

dbt tests validate data quality after each run. Test failures trigger Datadog alerts and block downstream model execution.

## BI and Visualization Tools

### Tableau — Executive Reporting

Tableau Server is managed by Acme Tech's BI team for executive dashboards:

- **Audience:** C-suite, board members, subsidiary GMs.
- **Content:** Consolidated revenue dashboards, operational KPIs, strategic initiative progress.
- **Access model:** View-only for executives, edit permissions for BI analysts. SSO via Entra ID.
- **Refresh:** Daily, aligned with dbt model refresh schedule.

### Looker — Operational Dashboards

Looker provides self-service analytics for subsidiary teams:

- **Audience:** Subsidiary tech leads, business analysts, product managers.
- **Content:** Each subsidiary has its own Looker space with subsidiary-specific dashboards. Shared enterprise-level dashboards are in the "Acme Corp Enterprise" space.
- **Access model:** SSO via Entra ID. Row-level security respects Snowflake RBAC — analysts see only data for their subsidiary unless granted enterprise-level access.
- **LookML models:** Maintained by Acme Tech BI team (enterprise models) and subsidiary data teams (subsidiary-specific models).

### Jupyter Notebooks — Data Science

JupyterHub is hosted on AKS (managed by Acme Tech) and connected to Snowflake via `snowflake-connector-python`:

- **Financial Services** — Risk model development, fraud detection model training, credit scoring.
- **Retail** — Recommendation engine development, customer segmentation, demand forecasting.
- **Media** — Content recommendation ML, ad targeting models, audience analytics.

Data scientists access Snowflake through their subsidiary's Snowflake role, ensuring RBAC enforcement. GPU-enabled nodes are available for ML model training workloads.

## Data Freshness SLOs

| Dashboard / Use Case | Target Freshness | Current Status |
|---|---|---|
| Executive Revenue Dashboards | T+1 (by 06:00 UTC) | Met |
| Operational Dashboards | Near-real-time (< 1 hour) | Met for FSI/Media, T+1 for others |
| Regulatory Reports | T+1 (by 08:00 UTC) | Met |
| Data Science Models | T+1 for training data | Met |
| Ad-hoc Queries | Depends on source freshness | N/A |

## Cost Management

Snowflake costs are managed through a combination of technical controls and organizational governance:

### Technical Controls

- **Auto-suspend** — All warehouses suspend after 5 minutes of inactivity.
- **Auto-resume** — Warehouses resume on demand with sub-5-second startup.
- **Scaling policies** — Multi-cluster warehouses scale out during peak query loads and scale in during quiet periods.
- **Resource monitors** — Alerts at 80% and 100% of quarterly credit budget per subsidiary.

### Organizational Governance

- **Quarterly credit budgets** — Each subsidiary has an allocated Snowflake credit budget based on historical usage and planned growth.
- **Monthly cost reports** — Acme Tech publishes detailed cost breakdowns per subsidiary, per warehouse, and per query category using Snowflake's `ACCOUNT_USAGE` views.
- **Cost optimization reviews** — Quarterly reviews identify expensive queries, oversized warehouses, and opportunities for materialized views or caching.

## Related Documentation

- [Enterprise Data Flows](./data-flows.md) — ETL pipelines and data flow map
- [Integration Architecture Overview](./integration-overview.md) — Enterprise integration topology
- [Acme Tech Data Platform](../../acme-tech/data/platform-overview.md) — Platform architecture
- [Acme Retail Data Architecture](../../acme-retail/data/architecture.md) — Retail data systems
- [Acme Financial Services Data Architecture](../../acme-financial-services/data/architecture.md) — FSI data systems
