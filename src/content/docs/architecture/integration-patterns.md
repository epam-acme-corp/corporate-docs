---
title: "Enterprise Integration Patterns"
description: "Catalog of integration patterns used across Acme Corp subsidiaries"
---

<!-- title: Enterprise Integration Patterns | last-updated: 2025-03-15 | owner: Acme Tech — Enterprise Architecture | status: current -->

# Enterprise Integration Patterns

This document catalogs the integration patterns used across Acme Corp's seven subsidiaries. Each pattern is documented with its definition, where it is applied, trade-offs, and a concrete example drawn from the group's integration landscape. For the overall integration topology and communication standards, see the [Integration Architecture Overview](./integration-overview.md).

## API Gateway Pattern

**What it is:** A single entry point that sits between API consumers and backend services, providing cross-cutting concerns such as authentication, rate limiting, request routing, monitoring, and protocol translation.

**Where it is used at Acme Corp:** Azure API Management (APIM) is the mandatory gateway for all cross-subsidiary and external API traffic. Every subsidiary publishes its external APIs through APIM. Acme Tech's Platform Engineering team manages the APIM infrastructure; subsidiaries own their API definitions.

**Pros:**
- Centralized authentication and authorization (Entra ID token validation at the gateway level)
- Consistent monitoring and alerting across all cross-subsidiary traffic
- API versioning, rate limiting, and throttling without application code changes
- Self-service developer portal for API discovery

**Cons:**
- Single point of failure (mitigated by Premium tier multi-region deployment)
- Added latency (~50–100ms overhead per request)
- Gateway configuration complexity increases with API count

**Example:** Acme Retail's BookStore application calls the Distribution Inventory API to check stock availability. The request flows: BookStore → APIM (validates OAuth 2.0 token, applies rate limit of 5,000 requests/minute, injects correlation ID) → Distribution Flask adapter → SAP WMS. APIM logs the request to Datadog with latency metrics and error codes.

## Event-Driven Pattern

**What it is:** Services communicate by producing and consuming events asynchronously through a message broker. Producers publish events without knowledge of consumers. Consumers subscribe to event topics and process events independently.

**Where it is used at Acme Corp:** Kafka in Financial Services for transaction events and risk score updates. RabbitMQ in Retail for order lifecycle events and inventory updates. RabbitMQ in Media for content publication and streaming session events. Acme Tech's event bridge routes events between Kafka and RabbitMQ for cross-subsidiary flows.

**Pros:**
- Loose coupling between producer and consumer services
- High throughput for transaction-heavy workloads (FSI processes over 100,000 events/minute)
- Event replay capability (Kafka retention) supports audit and debugging
- Natural fit for eventual consistency patterns

**Cons:**
- Increased operational complexity (broker management, schema evolution, dead-letter handling)
- Eventual consistency requires careful UX design (e.g., order status may lag payment confirmation by seconds)
- No unified event backbone — Kafka and RabbitMQ are independent, requiring bridge infrastructure

**Example:** When Financial Services processes a payment capture, it publishes a `payment.captured` event to Kafka topic `payments.captured`. The event bridge translates and forwards to Retail's RabbitMQ exchange. Retail's Order Service consumes the event and updates the order status to "payment confirmed." Event schema is defined in [FSI Event Schemas](../../acme-financial-services/api/event-schemas.md).

## Request-Reply Pattern

**What it is:** A synchronous interaction where a consumer sends a request and waits for a response within a defined timeout. The standard pattern for operations requiring immediate feedback.

**Where it is used at Acme Corp:** Inventory availability checks (Retail → Distribution, p95 < 200ms), payment authorization (Retail → Financial Services, p95 < 300ms), identity verification and token issuance (All → Acme Tech Entra ID, p95 < 200ms), mobile payment processing (Telco → Financial Services, p95 < 400ms).

**Pros:**
- Simple programming model — caller gets an immediate result
- Easy to reason about error handling and timeouts
- Natural fit for user-facing operations requiring real-time feedback

**Cons:**
- Tight temporal coupling — caller is blocked waiting for response
- Cascading failures if downstream service is slow or unavailable
- Requires circuit breaker and retry logic for resilience

**Example:** Before confirming an order, Retail's BookStore sends `GET /api/v1/inventory/availability?skus=ISBN-978-0-13-468599-1` to Distribution through APIM. Distribution's Flask adapter queries SAP WMS and returns availability within 200ms. The response is cached at APIM for 60 seconds. See [Retail–Distribution Integration](../api/retail-distribution-integration.md) for the full contract specification.

## Saga Pattern

**What it is:** A sequence of local transactions across multiple services that together achieve a business outcome. If any step fails, compensating transactions undo the previous steps. Used in place of distributed ACID transactions.

**Where it is used at Acme Corp:** Retail's order fulfillment flow is the primary saga implementation. The sequence: (1) create order in Retail, (2) reserve inventory in Distribution, (3) authorize payment in Financial Services, (4) confirm order in Retail. If payment authorization fails, a compensating step releases the inventory reservation in Distribution.

**Pros:**
- Avoids distributed transactions and two-phase commit across subsidiaries
- Each service maintains its own data consistency independently
- Failed sagas are recoverable through compensation

**Cons:**
- Complex failure handling — every forward step needs a corresponding compensation step
- Eventual consistency during saga execution (order may appear "pending" to the customer)
- Debugging multi-step sagas requires distributed tracing (Datadog APM)

**Example:** A customer places an order on the BookStore. Retail creates the order (`PENDING`), publishes `order.created` to RabbitMQ, which triggers inventory reservation at Distribution. Distribution confirms via webhook. Retail then calls Financial Services `POST /api/v1/payments/authorize`. On success, the order transitions to `CONFIRMED`. If payment fails, Retail publishes `order.cancelled` to RabbitMQ, and Distribution releases the reserved inventory. See [Retail Order Fulfillment](../../acme-retail/technical/order-fulfillment.md).

## Anti-Corruption Layer Pattern

**What it is:** A translation layer that isolates a modern system from a legacy system's data model and protocols. The layer converts between the legacy interface and the modern API contract, preventing legacy concepts from leaking into newer systems.

**Where it is used at Acme Corp:** Distribution's Python Flask adapter services are the primary anti-corruption layers. They translate between SAP's IDoc/BAPI/RFC interfaces and the REST APIs exposed through APIM. This ensures that SAP-specific data models (material numbers, plant codes, storage locations) are translated to domain-neutral concepts (SKUs, warehouse IDs, availability status) before crossing subsidiary boundaries.

**Pros:**
- Modern consumers interact with clean, domain-appropriate APIs regardless of legacy backend
- Legacy systems can evolve independently without impacting consumers
- Enables incremental modernization (wrap first, replace later)

**Cons:**
- Additional latency from translation layer
- Adapter logic can become complex, especially for bidirectional translation
- Risk of the adapter becoming a new monolith if not properly decomposed

**Example:** Retail calls `GET /api/v1/inventory/availability?skus=ISBN-978-0-13-468599-1` through APIM. Distribution's Flask adapter receives the REST request, translates it to an SAP BAPI call (`BAPI_MATERIAL_AVAILABILITY`), maps the SAP response (material number, plant, available quantity) to the REST response format (SKU, warehouse ID, quantity, availability boolean), and returns the JSON response. See [Acme Distribution Architecture](../../acme-distribution/architecture/overview.md).

## Batch Integration Pattern

**What it is:** Data is exchanged between systems through scheduled file transfers rather than real-time API calls. Files are produced on a schedule, staged in shared storage, and consumed by downstream processes.

**Where it is used at Acme Corp:** Insurance's mainframe integrations (daily batch files for claims, policies, and regulatory data via SFTP to Azure Blob Storage). Settlement reconciliation between Financial Services and Retail (daily CSV files). SAP data extracts from Distribution (IDoc exports processed by Azure Data Factory).

**Pros:**
- Compatible with legacy systems that have no API capability (Insurance COBOL/z/OS)
- Efficient for large data volumes (millions of records transferred as bulk files)
- Mainframe job scheduling (JCL) is well-understood and reliable

**Cons:**
- High latency (T+1 minimum, often longer for Insurance)
- Error handling is file-level, not record-level (one corrupt record can fail the entire batch)
- Schema evolution requires coordinated file format changes between producer and consumer

**Example:** Insurance's mainframe generates a daily claims data extract at 23:00 UTC. The COBOL batch program produces a fixed-width file following the CLAIMS-EXTRACT-V3 copybook layout. The file is transferred via SFTP to Azure Blob Storage (`insurance-claims-raw` container). Azure Data Factory picks up the file at 00:30 UTC, validates the format, transforms to Parquet, and loads into Snowflake `INSURANCE_DW.RAW_CLAIMS`. See [Enterprise Data Flows](./data-flows.md).

## Event Sourcing Pattern

**What it is:** Instead of storing only the current state, every state change is captured as an immutable event in an append-only event store. The current state is derived by replaying the sequence of events.

**Where it is used at Acme Corp:** Financial Services' transaction processing platform. Every financial transaction (authorization, capture, refund, chargeback) is stored as an immutable event in the event store (Kafka topics with long retention + PostgreSQL event tables). Current account balances and transaction states are materialized views derived from the event stream. This provides a complete audit trail required for regulatory compliance (MiFID II, SOX, Basel III).

**Pros:**
- Complete audit trail — every state change is recorded with timestamp and actor
- Enables event replay for debugging, reconciliation, and regulatory investigation
- Natural fit for financial workloads where auditability is a regulatory requirement

**Cons:**
- Event store grows continuously — requires retention policies and archival strategies
- Rebuilding state from events can be slow without snapshots
- Schema evolution of events requires careful versioning

**Example:** When a payment is authorized, Financial Services appends a `PaymentAuthorized` event to the `payments` Kafka topic and the `payment_events` PostgreSQL table. When the payment is later captured, a `PaymentCaptured` event is appended. The current payment status is derived by reading the latest event for that payment ID. Regulators can request the complete event history for any transaction. See [FSI Core Banking](../../acme-financial-services/technical/core-banking.md).

## CQRS (Command Query Responsibility Segregation)

**What it is:** Separate the data model used for write operations (commands) from the data model used for read operations (queries). Each model is optimized for its specific access pattern.

**Where it is used at Acme Corp:** Financial Services uses CQRS for transaction processing — writes go to Oracle/PostgreSQL (optimized for transactional integrity with ACID guarantees), reads are served from optimized read replicas and materialized views (optimized for query performance and reporting). Retail uses CQRS for the product catalog — writes go to PostgreSQL (source of truth for product data), reads are served from Elasticsearch (optimized for full-text search, faceted filtering, and autocomplete).

**Pros:**
- Read and write models independently optimized for their access patterns
- Read-heavy workloads scale independently from write workloads
- Enables specialized storage technology per access pattern (e.g., Elasticsearch for search)

**Cons:**
- Increased system complexity — two data models to maintain and keep synchronized
- Eventual consistency between write and read models (milliseconds to seconds lag)
- More complex deployment and monitoring

**Example:** When a Retail merchandiser updates a book's price in the Product Catalog, the write goes to PostgreSQL. A change-data-capture (CDC) process publishes the update event to RabbitMQ. The search indexer consumes the event and updates the Elasticsearch index. Customer-facing search queries are served from Elasticsearch with sub-100ms response times. The PostgreSQL write and Elasticsearch read are typically synchronized within 2–3 seconds. See [Retail Product Catalogue](../../acme-retail/technical/product-catalogue.md).

## Related Documentation

- [Integration Architecture Overview](./integration-overview.md) — Enterprise integration topology and communication standards
- [Cross-Subsidiary API Contracts](../api/cross-subsidiary-contracts.md) — Active API contracts and SLAs
- [Acme Retail Architecture](../../acme-retail/architecture/overview.md)
- [Acme Financial Services Architecture](../../acme-financial-services/architecture/overview.md)
- [Acme Distribution Architecture](../../acme-distribution/architecture/overview.md)
- [Acme Insurance Architecture](../../acme-insurance/architecture/overview.md)
