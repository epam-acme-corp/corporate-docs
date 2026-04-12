---
title: "Enterprise Architecture Summary"
description: "Consolidated view of the enterprise architecture across all subsidiaries"
---

<!-- title: Enterprise Architecture Summary | last-updated: 2025-03-15 | owner: Acme Tech — Enterprise Architecture | status: current -->

# Enterprise Architecture Summary

## Consolidated Enterprise Architecture View

Acme Corp's technology landscape spans seven subsidiaries at different maturity levels (L0 through L4), connected through Acme Tech's central platform services and progressively modernizing toward cloud-native, API-first architecture. This document provides the consolidated enterprise architecture view — the single authoritative reference for how the group's technology works together.

The group technology strategy rests on five pillars:

1. **API-first connectivity** — All new cross-subsidiary integrations expose REST APIs with OpenAPI 3.0 specifications, published to Azure APIM.
2. **Cloud-native where practical** — New systems are designed for cloud (containers, managed services, infrastructure as code). Legacy systems modernize incrementally, not mandated to rewrite.
3. **Domain-driven design** — Each subsidiary is a bounded context owning its domain data and business logic. Cross-subsidiary communication uses well-defined contracts, never shared databases.
4. **Progressive modernization** — Strangler fig pattern for legacy migration. Wrap legacy systems with modern APIs rather than rewriting. Modernization waves planned per subsidiary based on business value and risk.
5. **Shared platform services** — Acme Tech provides identity (Entra ID), API management (APIM), observability (Datadog), data platform (Snowflake), CI/CD (GitHub Actions), and security tooling (GHAS). Subsidiaries consume these services rather than building their own.

## Architecture Principles

### API-First

All new cross-subsidiary integrations must expose REST APIs with OpenAPI 3.0 specifications, published to Azure APIM. Internal service communication may use any protocol appropriate to the subsidiary's architecture (gRPC, message queues, etc.), but external-facing interfaces must be REST. This ensures discoverability through the APIM developer portal, consistent authentication via Entra ID, and uniform monitoring through Datadog.

### Cloud-Native Where Practical

New systems should be designed for cloud — containers on AKS, managed Azure PaaS services, infrastructure defined in Terraform. However, cloud-native is not mandated for all systems. Insurance's COBOL mainframe and Distribution's SAP ecosystem continue to operate as they are, with modernization planned incrementally based on business case. The principle is pragmatic adoption, not ideological migration.

### Domain-Driven Design

Each subsidiary is a bounded context that owns its domain data and business logic. Financial Services owns financial data, Retail owns product and order data, Insurance owns policy and claims data. Cross-subsidiary communication happens through well-defined API contracts and event streams — never through shared databases or direct data access. This ensures subsidiaries can evolve their internal architecture independently.

### Progressive Modernization

Legacy migration follows the strangler fig pattern: wrap legacy systems with modern API facades, route traffic through the new interface, and gradually replace backend components. This approach has been successfully applied at Distribution (SAP → Flask REST adapters) and is planned for Insurance (mainframe → API wrappers). Big-bang rewrites are explicitly not part of the strategy.

### Shared Platform Services

Acme Tech provides centralized platform services that all subsidiaries consume:

| Service | Technology | Purpose |
|---|---|---|
| Identity | Microsoft Entra ID | SSO, service-to-service auth, conditional access |
| API Management | Azure APIM | API gateway, rate limiting, developer portal |
| Observability | Datadog | APM, logs, metrics, SLO dashboards |
| Data Platform | Snowflake + dbt | Enterprise analytics, cross-subsidiary reporting |
| CI/CD | GitHub Actions | Build, test, deploy pipelines |
| Security | GHAS | Code scanning, dependency scanning, secret detection |
| IaC | Terraform | Infrastructure provisioning and management |

## Technology Stack Summary

| Subsidiary | Presentation | Application | Data | Infrastructure | CI/CD | Maturity |
|---|---|---|---|---|---|---|
| Acme Tech (L4) | React (internal tools) | Go, Python, .NET | Snowflake, PostgreSQL | Azure (AKS, Terraform) | GitHub Actions | L4 |
| Financial Services (L3) | React (portals) | Java 17 / Spring Boot | Oracle, PostgreSQL, Kafka | Azure (AKS, Terraform) | GitHub Actions | L3 |
| Retail (L3) | React (BookStore) | .NET 6–8 | SQL Server, PostgreSQL, Elasticsearch, RabbitMQ | Azure (AKS, Terraform) | GitHub Actions | L3 |
| Telco (L2) | Angular | Java 17, C++ (Rating), Python/Django | Oracle, TimescaleDB | Azure VMs + some AKS | GitHub Actions | L2 |
| Media (L2) | React (CMS admin) | Go, Node.js, Java, Python | MongoDB, ClickHouse, RabbitMQ | Azure (AKS) | GitHub Actions | L2 |
| Distribution (L1) | jQuery (legacy), React (new) | .NET 4.6 WCF, Python/Flask, Java 11, Node.js | SAP HANA, InfluxDB | Azure VMs, SAP on Azure | GitHub Actions (partial) | L1 |
| Insurance (L0) | Classic ASP, VB6 forms | COBOL/z/OS, VB6, Classic ASP | DB2, SQL Server 2012 | On-premises mainframe + Azure (hybrid) | SVN + manual | L0 |

## Integration Architecture Summary

Acme Corp uses a hub-spoke integration model with Acme Tech as the hub. All cross-subsidiary traffic routes through Azure APIM. Key integration characteristics:

- **Synchronous REST** for real-time queries and transactions (standard for all new integrations)
- **Kafka** (Financial Services) and **RabbitMQ** (Retail, Media) for asynchronous event-driven communication
- **Batch file transfers** for Insurance integrations (SFTP + Azure Data Factory)
- **SOAP adapters** (Distribution) wrapping SAP interfaces with REST facades

Integration maturity ranges from well-integrated (Financial Services, Retail) to legacy batch-only (Insurance). Full details in [Integration Architecture Overview](./integration-overview.md).

## Common Architectural Patterns

### Microservices

Financial Services (Java/Spring Boot), Retail (.NET), Media (Go), and Acme Tech (mixed) deploy microservices on AKS with independent deployment pipelines. Each service owns its data store and communicates via APIs and events. Deployment frequency ranges from multiple times daily (Acme Tech) to several times per week (FSI, Retail).

### Modular Monolith

Telco's BSS platform is built on Java 17 as a modular monolith — internally structured into well-defined modules but deployed as a single unit. Planned decomposition into microservices over the next 2 years, starting with the customer management module.

### Legacy Monolith

Insurance's COBOL/z/OS applications and Distribution's WCF services represent legacy monoliths. Insurance's mainframe is stable and mission-critical; no decomposition is planned in the current roadmap. Distribution's WMS is being modernized incrementally — WCF services are being replaced with .NET 8 REST APIs.

### Event-Driven Architecture

Financial Services uses Kafka for transaction events with event sourcing for full audit trails. Retail uses RabbitMQ for order lifecycle events and inventory synchronization. Media uses RabbitMQ for content publication and streaming events. This pattern is applied where high throughput and eventual consistency are acceptable.

### CQRS

Financial Services separates read and write models for transaction processing (writes to Oracle/PostgreSQL, reads from optimized replicas). Retail uses CQRS for product search (writes to PostgreSQL, reads from Elasticsearch). Applied selectively where read and write access patterns differ significantly.

## Architectural Governance

### Acme Tech as Architecture Authority

Acme Tech's Enterprise Architecture team sets group-wide technology standards, reviews cross-subsidiary integration designs, and maintains the [Technology Radar](./technology-radar.md). The team provides advisory services to subsidiary tech leads and conducts quarterly architecture reviews.

### Architecture Decision Records (ADRs)

All significant architectural decisions are documented as ADRs:

- **Subsidiary ADRs** are stored in each subsidiary's repository (e.g., `acme-retail/architecture/adr/`).
- **Cross-subsidiary ADRs** are stored in the corporate knowledge base.
- ADR template is standardized across the group (see [ADR Template](../governance/templates/architecture-decision-record-template.md)).

### Technology Approval Committee

The Technology Approval Committee meets monthly to review requests to adopt new technologies not on the Adopt or Trial rings of the technology radar:

- **Membership:** Acme Tech CTO (chair), subsidiary CTOs/tech leads, Enterprise Architecture team.
- **Scope:** Approval required before introducing new languages, frameworks, databases, or cloud services into production.
- **Process:** Requester submits a technology proposal with business justification, risk assessment, and proof-of-concept results. Committee reviews and approves, requests revision, or declines.

## Related Documentation

- [Technology Radar](./technology-radar.md) — Approved, trial, assess, and hold technologies
- [Modernization Roadmap](./modernization-roadmap.md) — Per-subsidiary modernization priorities and timelines
- [Integration Architecture Overview](./integration-overview.md) — Detailed integration topology
- [Cross-Subsidiary API Contracts](../api/cross-subsidiary-contracts.md) — API contract catalog
- [Enterprise Data Flows](./data-flows.md) — Data flow map and analytics platform
- [Enterprise Security Architecture](../governance/security-architecture.md) — Security and compliance
- [Corporate Overview](../overview.md) — Acme Corp business overview
