---
title: "Enterprise Integration Architecture Overview"
description: "Enterprise integration philosophy and architecture patterns"
---

<!-- title: Enterprise Integration Architecture Overview | last-updated: 2025-03-15 | owner: Acme Tech — Enterprise Architecture | status: current -->

# Enterprise Integration Architecture Overview

## Enterprise Integration Philosophy

Acme Corp operates seven subsidiaries — Acme Tech, Acme Financial Services, Acme Retail, Acme Insurance, Acme Distribution, Acme Telco, and Acme Media — each serving distinct market segments with specialized technology stacks. The enterprise integration architecture connects these subsidiaries through a centralized, governed approach managed by Acme Tech's Enterprise Architecture team.

Three guiding principles shape all integration decisions across the group:

1. **API-first connectivity** — Every cross-subsidiary interaction must be expressed as a well-defined API contract, published through Azure API Management (APIM) with OpenAPI 3.0 specifications. No point-to-point integrations bypass the gateway.
2. **Centralized governance, decentralized execution** — Acme Tech defines integration standards, manages shared infrastructure (APIM, Entra ID, Datadog), and reviews cross-subsidiary designs. Subsidiaries own their internal architecture and implement integrations according to their own development cadence.
3. **Progressive modernization over big-bang rewrites** — Legacy systems are wrapped with modern API facades using the strangler fig pattern. Insurance's COBOL mainframe, Distribution's SAP ecosystem, and Telco's C++ Rating Engine all participate in the integration landscape through adapters rather than replacements.

This document establishes the integration topology, communication patterns, and maturity assessment that form the foundation for all cross-subsidiary integration documentation.

## Integration Topology

All cross-subsidiary traffic routes through Acme Tech's central platform services. The topology follows a hub-spoke model with Acme Tech operating the hub.

```
                          ┌───────────────────────────────────┐
                          │         ACME TECH (Hub)           │
                          │                                   │
                          │  ┌─────────┐  ┌───────────────┐  │
                          │  │Entra ID │  │  Azure APIM    │  │
                          │  │ (OIDC/  │  │  (API Gateway) │  │
                          │  │  SAML)  │  │                │  │
                          │  └─────────┘  └───────────────┘  │
                          │  ┌─────────┐  ┌───────────────┐  │
                          │  │Datadog  │  │  Snowflake     │  │
                          │  │(Observe)│  │  (Analytics)   │  │
                          │  └─────────┘  └───────────────┘  │
                          └──────────┬────────────────────────┘
                                     │
          ┌──────────────────────────┼──────────────────────────┐
          │              ┌───────────┼───────────┐              │
          │              │           │           │              │
    ┌─────┴─────┐  ┌─────┴─────┐ ┌──┴──┐ ┌─────┴─────┐ ┌─────┴─────┐
    │  Acme     │  │  Acme     │ │Acme │ │  Acme     │ │  Acme     │
    │  FSI      │  │  Retail   │ │Telco│ │  Media    │ │  Distrib. │
    │  (L3)     │  │  (L3)     │ │(L2) │ │  (L2)     │ │  (L1)     │
    └─────┬─────┘  └─────┬─────┘ └──┬──┘ └─────┬─────┘ └─────┬─────┘
          │              │           │           │              │
          │              │           │           │        ┌─────┴─────┐
          └──────────────┼───────────┼───────────┘        │  Acme     │
                         │           │                    │ Insurance │
                         │           │                    │  (L0)     │
                         └───────────┘                    └───────────┘

    Cross-Subsidiary Integration Pathways (via APIM):
    ─────────────────────────────────────────────────
    Retail ←→ Distribution    Order fulfillment (REST + RabbitMQ)
    Retail ←→ FSI             Payment processing (REST, PCI-DSS)
    FSI ←→ Insurance          Shared customer data (Kafka + batch)
    Telco → FSI               Mobile payments (REST)
    Media → Retail             Content commerce (REST)
    Distribution → Telco      IoT SIM management (REST)
```

Every subsidiary connects to four shared platform services provided by Acme Tech:

- **Identity** — Microsoft Entra ID for SSO, service-to-service OAuth 2.0, and conditional access policies.
- **API Gateway** — Azure APIM for all cross-subsidiary and external API traffic routing.
- **Observability** — Datadog for APM traces, log aggregation, infrastructure metrics, and SLO dashboards.
- **Analytics** — Snowflake for cross-subsidiary reporting and data sharing.

Direct cross-subsidiary integrations (such as Retail to Distribution for order fulfillment) also route through APIM, ensuring consistent authentication, rate limiting, and monitoring.

## Communication Patterns Used Across Acme Corp

### Synchronous REST

Synchronous REST APIs are the standard pattern for all new cross-subsidiary integrations where real-time responses are required. All REST APIs follow these conventions:

- **Payload format:** JSON exclusively. XML is not used for new integrations.
- **Authentication:** OAuth 2.0 bearer tokens issued by Microsoft Entra ID. Service-to-service calls use the `client_credentials` grant with managed identities or certificate-based service principals.
- **Versioning:** Semantic versioning with URL path-based version negotiation (e.g., `/api/v1/`, `/api/v2/`). Header-based versioning is not used for simplicity.
- **Correlation:** Every request must include an `X-Correlation-ID` header for distributed tracing. APIM injects one if not present.
- **Error format:** Standard RFC 7807 Problem Details JSON (`application/problem+json`).
- **Transport:** TLS 1.3 minimum for all cross-subsidiary traffic.

Use cases include inventory availability checks (Retail → Distribution, p95 < 200ms), payment authorization (Retail → Financial Services, p95 < 300ms), and identity verification (All → Acme Tech, p95 < 200ms).

For detailed API specifications, see [Cross-Subsidiary API Contracts](../api/cross-subsidiary-contracts.md).

### Asynchronous Messaging

Asynchronous messaging supports event-driven architectures where eventual consistency is acceptable and decoupling between producer and consumer is desirable.

**Apache Kafka** — Managed by Acme Financial Services for financial event streaming. Kafka topics carry transaction events (`payments.authorized`, `payments.captured`, `payments.refunded`), risk score updates, and KYC verification events. Kafka provides ordering guarantees, replay capability, and high throughput required for financial workloads.

**RabbitMQ** — Operated independently by Acme Retail and Acme Media. Retail's RabbitMQ cluster handles order lifecycle events (created, confirmed, shipped, delivered) and inventory update events. Media's RabbitMQ cluster handles content publication events and streaming session events.

**Cross-broker event routing** — Acme Tech provides a lightweight event bridge that translates between Kafka and RabbitMQ where cross-subsidiary event flow is required. For example, Financial Services publishes `payment.completed` to Kafka, and the event bridge forwards a translated event to Retail's RabbitMQ so the order service can update order status. This bridge is intentionally thin — it performs format translation and delivery, not business logic.

### Batch and File-Based Integration

Batch integration remains essential for subsidiaries with legacy systems that cannot support real-time APIs.

**Insurance integrations** — Acme Insurance's COBOL/z/OS mainframe generates and consumes batch files daily. Claims data, policy updates, and regulatory reports are exported as CSV or fixed-width files via SFTP to Azure Blob Storage. Azure Data Factory pipelines process these files on schedule, transforming and loading data into Snowflake for analytics and into Financial Services' systems for shared customer data reconciliation.

**Settlement reconciliation** — Financial Services generates daily settlement files (CSV) for Retail at 02:00 UTC, delivered to Azure Blob Storage. Retail's Finance module consumes these files to reconcile payment captures against order records.

**Batch pipeline infrastructure** — All batch integrations use Azure Data Factory for orchestration, Azure Blob Storage for staging, and Datadog for pipeline monitoring. Pipeline failures trigger alerts to the owning subsidiary's data engineering team.

## API Gateway as Central Integration Point

Azure API Management (Premium tier, multi-region deployment) serves as the single entry point for all cross-subsidiary and external API traffic. Acme Tech's Platform Engineering team manages the APIM infrastructure; subsidiaries publish their APIs through it.

### APIM Capabilities

| Capability | Implementation |
|---|---|
| Rate limiting | Per-subscription rate limits, burst allowances per API contract |
| Authentication | Entra ID token validation (JWT), mTLS for PCI-scoped APIs |
| Request transformation | Correlation ID injection, header normalization |
| Response transformation | Error format standardization (RFC 7807) |
| API versioning | URL path-based (`/api/v1/`, `/api/v2/`) |
| Analytics | Request/response logging to Datadog, latency percentiles, error rates |
| Developer portal | Self-service API discovery, sandbox testing, OpenAPI spec browsing |
| TLS enforcement | TLS 1.3 minimum, certificate management via Azure Key Vault |

### APIM Policy Standards

Every API published through APIM must comply with corporate policies enforced at the gateway level:

- **Correlation ID** — `X-Correlation-ID` header required on all requests. APIM generates one if absent.
- **Standard error format** — All error responses transformed to RFC 7807 Problem Details.
- **TLS minimum** — TLS 1.3 enforced; TLS 1.2 permitted only for legacy exceptions (Insurance, Distribution SAP).
- **Rate limiting** — Default 1,000 requests/minute per subscription. Custom limits defined per API contract.
- **Request size** — Maximum 1 MB request body. Larger payloads use Azure Blob Storage references.
- **Timeout** — Default 30-second timeout. Custom timeouts for long-running operations.

Each subsidiary publishes APIs with OpenAPI 3.0 specifications. The APIM developer portal serves as the canonical API catalog for the enterprise. See [Acme Tech API Gateway Overview](../../acme-tech/api/gateway-overview.md) for infrastructure details.

## Service Mesh Considerations

### Current State

A service mesh is not currently implemented at the group level. Each subsidiary manages its own service-to-service communication within its infrastructure boundary:

- **Financial Services and Retail** use internal Kubernetes load balancers and DNS-based service discovery within their AKS clusters.
- **Media** uses Kubernetes-native service discovery for its Go microservices.
- **Telco** uses a mix of Kubernetes services and traditional load balancers for its partially containerized workloads.
- **Distribution and Insurance** do not use service meshes; their architectures are not container-based.

### Future Evaluation — Istio

Acme Tech is evaluating Istio for future adoption to provide additional cross-cutting capabilities:

- **Mutual TLS (mTLS)** between services — extending zero-trust to the service level without application-level certificate management.
- **Traffic management** — canary deployments, traffic splitting, and fault injection for resilience testing.
- **Distributed tracing** — automatic span injection for cross-subsidiary request flows, complementing Datadog APM.
- **Circuit breaking and retry policies** — infrastructure-level resilience without application code changes.

Planned adoption would be phased: Acme Tech internal services first (proof-of-concept), then Financial Services and Retail (both already on AKS), then Telco and Media as their containerization matures. Distribution and Insurance are excluded from the initial roadmap due to their non-containerized architectures.

## Integration Maturity per Subsidiary

| Subsidiary | Maturity Level | Integration Profile |
|---|---|---|
| Acme Financial Services (L3) | Well-integrated | Full REST API catalog published to APIM. Kafka event streaming for transaction events. Automated Pact contract testing in CI/CD. Real-time Datadog monitoring with SLO dashboards. OpenAPI 3.0 specs for all external APIs. |
| Acme Retail (L3) | Well-integrated | REST APIs with OpenAPI 3.0 specs published to APIM. RabbitMQ for order lifecycle events. Pact contract tests for Distribution and FSI integrations. Elasticsearch powers async search. Full Datadog APM integration. |
| Acme Telco (L2) | Partially integrated | BSS platform exposes REST APIs through APIM. OSS layer has proprietary interfaces not yet exposed externally. Rating Engine uses C++ gRPC internally with REST wrapper for APIM. Network management integrations use SNMP and proprietary protocols. |
| Acme Media (L2) | Partially integrated | Event-driven internal architecture — Go streaming services publish to RabbitMQ. REST APIs for external content and ad integrations. CDN integration via specialized protocols (HLS/DASH). DRM integrations use vendor-specific APIs not routed through APIM. |
| Acme Distribution (L1) | Minimally integrated | SAP-dependent SOAP and IDoc interfaces for core WMS and ERP operations. Python Flask adapter services translate SOAP to REST for APIM publication. WCF services being progressively wrapped with REST facades. Limited automated testing. |
| Acme Insurance (L0) | Legacy integration | Batch file exchanges only — CSV and fixed-width files transferred via SFTP. COBOL copybooks define data formats. No real-time API capability. Mainframe job schedules (JCL) dictate timing. All integration is file-based and asynchronous with T+1 latency. |

See the [Modernization Roadmap](./modernization-roadmap.md) for each subsidiary's planned integration improvements.

## Related Documentation

- [Integration Patterns](./integration-patterns.md) — Detailed documentation of each integration pattern used across Acme Corp
- [Cross-Subsidiary API Contracts](../api/cross-subsidiary-contracts.md) — Catalog of all active cross-subsidiary API contracts with SLAs
- [Enterprise Data Flows](./data-flows.md) — Data flow map and ETL pipeline documentation
- [Enterprise Security Architecture](../governance/security-architecture.md) — Network security, identity management, and zero-trust model
- [Enterprise Architecture Summary](./enterprise-summary.md) — Consolidated view of the entire technology landscape
- [Acme Tech Platform Engineering](../../acme-tech/technical/platform-engineering.md) — Shared platform services documentation
- [Acme Tech API Gateway](../../acme-tech/api/gateway-overview.md) — APIM infrastructure and configuration
- [Acme Tech Identity and Access Management](../../acme-tech/security/identity-access-management.md) — Entra ID federation and SSO
- [Acme Retail Architecture](../../acme-retail/architecture/overview.md) — Retail system architecture
- [Acme Financial Services Architecture](../../acme-financial-services/architecture/overview.md) — FSI system architecture
