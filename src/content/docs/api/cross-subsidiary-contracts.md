---
title: "Cross-Subsidiary API Contracts"
description: "API contracts governing data exchange between Acme Corporation subsidiaries"
---

<!-- title: Cross-Subsidiary API Contracts | last-updated: 2025-03-15 | owner: Acme Tech — Integration Engineering | status: current -->

# Cross-Subsidiary API Contracts

## Overview

This document defines the API contracts that govern cross-subsidiary communication at Acme Corp. These contracts are enforceable agreements between producing and consuming subsidiaries — they specify exactly what data flows between systems, under what SLAs, and with what guarantees. All cross-subsidiary API contracts route through Azure APIM and authenticate via Entra ID OAuth 2.0 tokens.

For the integration topology and communication patterns that underpin these contracts, see the [Integration Architecture Overview](../architecture/integration-overview.md).

## API Contract Catalog

The following table lists all active cross-subsidiary API contracts. Each contract has an identified producer (API provider), consumer(s), authentication method, and SLA commitments.

| Source | Target | API Name | Pattern | Auth Method | SLA (Availability) | SLA (Latency p95) |
|---|---|---|---|---|---|---|
| Retail | Distribution | Fulfillment Orders API | REST + async events | OAuth 2.0 (Entra ID) | 99.95% | < 500ms |
| Retail | Financial Services | Payment Gateway API | REST (PCI-DSS) | OAuth 2.0 + mTLS | 99.99% | < 300ms |
| Financial Services | Insurance | Customer Data Sync | Kafka events + batch | Service principal | 99.9% | N/A (async) |
| Telco | Financial Services | Mobile Payments API | REST | OAuth 2.0 | 99.95% | < 400ms |
| Media | Retail | Content Commerce API | REST | OAuth 2.0 | 99.9% | < 600ms |
| Distribution | Telco | IoT SIM Management API | REST | OAuth 2.0 | 99.9% | < 800ms |
| All | Acme Tech | Identity API (Entra ID) | OIDC / SAML | Federated | 99.99% | < 200ms |
| All | Acme Tech | API Gateway (APIM) | REST proxy | OAuth 2.0 | 99.99% | < 100ms overhead |
| All | Acme Tech | Observability (Datadog) | Agent push | API key | 99.95% | N/A (async) |
| All | Acme Tech | Data Platform (Snowflake) | ETL / data share | Service principal | 99.9% | Batch SLAs vary |

For deep-dive contract specifications on the two highest-traffic integrations, see:
- [Retail ↔ Distribution Integration](./retail-distribution-integration.md) — Order fulfillment pipeline (~50,000 orders/day)
- [Retail ↔ Financial Services Integration](./retail-fsi-integration.md) — Payment processing (PCI-DSS compliant)

## Contract Ownership Rules

Clear ownership is essential for maintaining reliable cross-subsidiary integrations. The following rules govern API contract ownership:

1. **The producer (API provider) owns the contract definition** and is responsible for maintaining backward compatibility. The producer publishes the OpenAPI 3.0 specification and registers it in the APIM developer portal.
2. **The consumer provides requirements** via an API proposal document reviewed by both parties and Acme Tech's integration governance team. The proposal specifies required endpoints, expected SLAs, data formats, and error handling requirements.
3. **Changes to contract schemas require approval from all registered consumers.** The producer must notify consumers of proposed changes, collect approvals, and coordinate migration timelines before deploying breaking changes.
4. **Contract ownership is tracked in Acme Tech's API registry** within the APIM developer portal. Each API entry includes the producing subsidiary, consuming subsidiaries, contract owner (individual), and escalation path.
5. **Cross-subsidiary API contracts are reviewed quarterly** in the Architecture Review Board meeting. SLA compliance, consumer satisfaction, and proposed changes are discussed.

## Versioning Policy

All cross-subsidiary APIs follow semantic versioning (MAJOR.MINOR.PATCH):

### Breaking Changes (MAJOR Version Bump)

Breaking changes include removing endpoints, renaming fields, changing field types, or altering authentication requirements. The versioning policy requires:

- **Minimum 12-month deprecation period** — Both old and new versions run in parallel during the deprecation window.
- **Consumer migration tracking** — Each consumer's migration progress is tracked in quarterly architecture reviews.
- **Deprecation headers** — Deprecated API versions return `Sunset` and `Deprecation` HTTP headers indicating the shutdown date.
- **Final shutdown** — Only after all registered consumers have migrated. Emergency shutdown (security vulnerability) follows accelerated process with 30-day notice.

### Non-Breaking Additions (MINOR Version Bump)

Non-breaking changes include adding new optional fields, new endpoints, or new query parameters. These are deployed without consumer coordination. Consumers are notified via the APIM developer portal changelog.

### Bug Fixes (PATCH Version Bump)

Bug fixes have no contract impact and are deployed independently. No consumer notification required unless the fix changes observable behavior.

### Version Negotiation

Version negotiation uses URL path segments: `/api/v1/`, `/api/v2/`. Header-based versioning (e.g., `Accept-Version`) is not used across the group for simplicity and consistency.

## Contract Testing Requirements

Contract testing is mandatory for all cross-subsidiary APIs. Acme Tech manages the Pact Broker infrastructure; subsidiaries own their test implementations.

### Pact-Based Contract Testing Workflow

1. **Consumer team** writes consumer pact tests that define expected API interactions (request/response pairs).
2. **Consumer CI pipeline** runs pact generation and publishes the consumer pact to the Pact Broker (managed by Acme Tech, hosted on AKS).
3. **Producer CI pipeline** runs provider verification against all registered consumer pacts. The producer's test suite replays the expected interactions against the real API and verifies responses match the pact.
4. **Contract test failures block deployment** — Neither producer nor consumer can deploy to production if contract tests fail.
5. **Can-i-deploy check** — Before deploying to production, both producer and consumer run `pact-broker can-i-deploy` to verify contract compatibility with the currently deployed version of the counterpart.

### Integration Test Environments

Each subsidiary maintains dev, staging, and production environments. Cross-subsidiary integration testing uses the staging environment:

- **APIM staging instance** — Mirrors production configuration with staging-specific API subscriptions.
- **Staging connectivity** — All subsidiary staging environments are connected via the APIM staging instance, enabling end-to-end integration testing.
- **Test data management** — Each subsidiary manages its own staging test data. Cross-subsidiary test scenarios use pre-agreed test fixtures (e.g., specific test customer IDs, test SKUs).

## Monitoring and SLO Tracking

Cross-subsidiary API SLOs are tracked and enforced through Datadog:

### Monitoring Infrastructure

- **Synthetic monitors** — Scheduled API health checks from multiple regions. Run every 60 seconds for critical APIs (Identity, Payment Gateway), every 5 minutes for others.
- **Real-traffic metrics** — APIM request logs streamed to Datadog. Metrics include: request count, latency percentiles (p50, p95, p99), error rates (4xx, 5xx), and throughput.
- **Distributed tracing** — Datadog APM traces requests from APIM through producer services, enabling end-to-end latency analysis.

### Alerting Thresholds

| SLO Target | Warning Threshold | Critical Threshold | Notification Channel |
|---|---|---|---|
| 99.99% availability | < 99.5% (15-min window) | < 99.0% (15-min window) | PagerDuty → on-call |
| 99.95% availability | < 99.5% (15-min window) | < 99.0% (15-min window) | Slack + PagerDuty |
| 99.9% availability | < 99.0% (1-hour window) | < 98.0% (1-hour window) | Slack + email |
| Latency p95 | > 150% of target | > 200% of target | Slack |

### SLO Reporting and Error Budgets

- **Monthly SLO reports** are published to subsidiary tech leads and Acme Tech's integration governance team. Reports include: SLO compliance percentage, error budget remaining, top error categories, latency trends.
- **Error budget policy** — If a subsidiary exhausts its error budget for a given API contract, non-critical changes (feature additions, refactoring) are frozen until the SLO recovers. Only reliability improvements and bug fixes may be deployed during an error budget freeze.
- **Quarterly SLO review** — Part of the Architecture Review Board meeting. SLO targets are reviewed and adjusted based on business requirements and historical performance.

## Related Documentation

- [Retail ↔ Distribution Integration](./retail-distribution-integration.md) — Detailed contract for order fulfillment
- [Retail ↔ Financial Services Integration](./retail-fsi-integration.md) — Detailed contract for payment processing
- [Integration Architecture Overview](../architecture/integration-overview.md) — Enterprise integration topology
- [Integration Patterns](../architecture/integration-patterns.md) — Patterns used across integrations
- [Acme Tech API Standards](../../acme-tech/api/api-standards.md) — API design standards
- [Acme Retail API Overview](../../acme-retail/api/overview.md) — Retail API catalog
- [Acme Financial Services API Overview](../../acme-financial-services/api/overview.md) — FSI API catalog
