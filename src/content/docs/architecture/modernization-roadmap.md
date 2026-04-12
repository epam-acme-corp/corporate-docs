---
title: "Enterprise Modernization Roadmap"
description: "Technology modernization roadmap across all subsidiaries"
---

<!-- title: Enterprise Modernization Roadmap | last-updated: 2025-03-15 | owner: Acme Tech — Enterprise Architecture | status: current -->

# Enterprise Modernization Roadmap

## Current State — Maturity per Subsidiary

Each subsidiary's technology maturity is assessed using the Acme Corp Architecture Maturity Model (L0–L4):

| Level | Label | Characteristics |
|---|---|---|
| L0 | Legacy | Mainframe/monolith, manual processes, no CI/CD, limited integration |
| L1 | Foundational | Some modern tooling, basic CI/CD, API wrappers around legacy |
| L2 | Progressing | Containerized services, automated CI/CD, good security, some cloud-native |
| L3 | Advanced | Microservices, full CI/CD, comprehensive monitoring, cloud-native, API-first |
| L4 | Gold Standard | Platform services, self-service, full automation, innovation capability |

### Subsidiary Maturity Assessment

| Subsidiary | Maturity | Key Strengths | Key Gaps | Modernization Priority |
|---|---|---|---|---|
| Acme Tech (L4) | Gold Standard | Cloud-native platform, full automation, GHAS, platform services | Platform self-service maturity | Platform maturation, self-service portal |
| Financial Services (L3) | Advanced | Microservices, Kafka event streaming, strong compliance automation | Monolithic data layer (Oracle legacy portions) | Data mesh adoption, compliance automation |
| Retail (L3) | Advanced | Modern .NET stack, React frontend, robust CI/CD | Payment module needs .NET 8 completion, search performance | BookStore .NET 8 completion, payment resilience |
| Telco (L2) | Progressing | Java 17 BSS, solid security posture | C++ Rating Engine complexity, OSS modernization lag | Copilot adoption, Fault Management upgrade |
| Media (L2) | Progressing | Go streaming services, event-driven architecture | DRM fragmentation across 3 systems, ad platform legacy | Streaming optimization, DRM consolidation |
| Distribution (L1) | Early Stage | SAP domain expertise, IoT monitoring capability | .NET 4.6 WCF dependencies, limited GHAS, SOAP interfaces | GHAS enablement, WMS modernization to .NET 8 |
| Insurance (L0) | Legacy | Stable mainframe, strong regulatory compliance | COBOL, VB6, SVN, no CI/CD, batch-only integration | SCM migration (SVN → Git), GHAS enablement |

## Modernization Priorities per Subsidiary

### Insurance (L0 → L1) — 18–24 Months

**Priority 1: SCM Migration (SVN → Git/GitHub)**
This is the prerequisite for all other modernization. Migrate all source code repositories from SVN to Git hosted on GitHub Enterprise. Establish branch protection rules, pull request workflows, and code review practices. Train development team on Git workflows.

**Priority 2: GHAS Enablement**
Once on GitHub, enable GHAS for secret scanning and dependency scanning. CodeQL support for COBOL is not available; VB6 has limited support. Focus on scanning non-mainframe components and infrastructure code.

**Priority 3: Initial CI/CD Pipeline**
Build CI/CD pipelines in GitHub Actions for non-mainframe components (VB6 desktop apps, Classic ASP web applications). Mainframe deployments remain manual in the initial phase but with automated build verification.

**Priority 4: API Wrappers for Mainframe Services**
Establish REST API wrappers around key mainframe CICS transactions using a lightweight Java or .NET adapter layer. Expose these through APIM to enable basic real-time integration (replacing some batch file exchanges).

### Distribution (L1 → L2) — 12–18 Months

**Priority 1: GHAS Enablement**
Enable GHAS across all Distribution repositories. Configure CodeQL for Java, Python, and C# codebases. Deploy secret scanning with custom detectors for SAP credentials.

**Priority 2: WMS Modernization**
Migrate .NET Framework 4.6 WCF services to .NET 8 with REST APIs. Use the strangler fig pattern — new .NET 8 services run alongside existing WCF services, with traffic gradually shifted. Target: 100% WCF replacement within 12 months.

**Priority 3: SAP Integration Modernization**
Replace SOAP-based SAP adapters with modern REST adapters using the SAP Cloud Connector and OData APIs where available. Reduce dependency on IDoc and BAPI interfaces.

**Priority 4: CI/CD Standardization**
Standardize all Distribution services on GitHub Actions with automated testing, container builds, and deployment to AKS.

### Telco (L2 → L3) — 12–18 Months

**Priority 1: GitHub Copilot Adoption**
Roll out GitHub Copilot to all Telco development teams. Measure impact on code review time, PR throughput, and developer satisfaction. Target: 20% improvement in developer productivity metrics within 6 months.

**Priority 2: Fault Management System Upgrade**
The current Fault Management system is approaching end-of-life. Evaluate replacement options: commercial ITSM platform or custom build on the existing Java 17 / Angular stack. Decision by Q2, implementation by Q4.

**Priority 3: BSS Monolith Decomposition Planning**
Develop a decomposition plan for the BSS modular monolith. Identify candidate modules for extraction into independent microservices (starting with customer management). Proof-of-concept extraction by Q3.

**Priority 4: Rating Engine Assessment**
Evaluate options for the C++ Rating Engine: containerized optimization (current codebase on AKS), partial rewrite in Rust for performance-critical paths, or maintained as-is with improved testing. Assessment complete by Q2.

### Media (L2 → L3) — 12–18 Months

**Priority 1: Streaming Pipeline Optimization**
Optimize Go streaming services for throughput and latency. Implement CDN cache warming, adaptive bitrate improvements, and connection pooling optimizations. Target: 30% reduction in p99 latency for video startup.

**Priority 2: DRM Consolidation**
Consolidate three separate DRM systems (Widevine, FairPlay, PlayReady) into a unified multi-DRM orchestration layer. Reduce operational complexity and license costs.

**Priority 3: Ad Platform Modernization**
Decompose the Java ad-serving monolith into microservices. Separate ad decision engine, inventory management, and reporting into independent services on AKS.

**Priority 4: Enhanced ML Pipeline**
Expand content recommendation ML pipeline. Move from batch-trained models to online learning for real-time personalization. Integrate MLflow for experiment tracking and model versioning.

### Retail (L3 → L4) — 6–12 Months

**Priority 1: BookStore .NET 8 Migration Completion**
Complete the migration of remaining .NET 6 services to .NET 8. Target: all BookStore services running on .NET 8 by Q3.

**Priority 2: Payment Module Resilience**
Improve payment module resilience — reduce coupling with FSI Payment Gateway, implement more sophisticated circuit breaker patterns, and add payment queueing for graceful degradation during FSI outages.

**Priority 3: Search Performance Optimization**
Tune Elasticsearch cluster for improved search relevance and performance. Implement query result caching, optimize index settings, and improve autocomplete response times.

### Financial Services (L3 → L4) — 12–18 Months

**Priority 1: Data Mesh Architecture**
Adopt domain-oriented data ownership following data mesh principles. Each FSI domain (payments, accounts, risk, compliance) becomes a data product owner. Reduce dependency on the centralized Oracle data warehouse.

**Priority 2: Compliance Automation**
Automate regulatory reporting pipelines. Implement continuous compliance monitoring that validates regulatory controls in real-time rather than at audit time. Target: 80% of compliance checks automated.

**Priority 3: API Catalog Maturation**
Enrich the FSI API catalog with versioned schemas, SDK generation, and developer experience improvements. Target: all FSI APIs have published SDKs in Java and Python.

### Acme Tech (L4 → L4+) — Ongoing

**Priority 1: Platform Self-Service Portal**
Build a self-service portal for subsidiary teams to provision infrastructure, configure APIM APIs, manage Snowflake databases, and request GHAS configurations without Acme Tech manual intervention.

**Priority 2: Unified Event Platform Assessment**
Complete Confluent Cloud proof-of-concept for cross-subsidiary event routing. Assess cost, operational complexity, and migration effort from current Kafka + RabbitMQ topology.

**Priority 3: AI/ML Platform Services**
Expand platform offerings to include managed ML pipeline services, centralized feature store, and model deployment infrastructure.

## Modernization Approach

### Wave-Based Execution

Each subsidiary plans its own modernization in waves, typically 3–6 months each:

- **Scope:** Each wave targets specific systems or services with clear boundaries.
- **Success criteria:** Defined upfront — measurable outcomes (e.g., "100% WCF services replaced," "GHAS enabled on all repos").
- **Resource allocation:** Agreed at wave planning; includes dedicated modernization time alongside feature development.
- **Rollback plan:** Every wave has a documented rollback plan in case of critical issues.

### Governance

- Wave proposals are reviewed by the Technology Approval Committee.
- Progress is tracked in quarterly Architecture Review Board meetings.
- Blockers are escalated to the Group CTO.

## Investment Areas (Group-Wide)

### AI-Assisted Development

GitHub Copilot rollout to all L2+ subsidiaries. Centrally funded by Acme Tech. Measuring impact on developer productivity: code review time, PR throughput, time-to-merge, and developer satisfaction surveys.

### Security Automation

Universal GHAS enablement (Distribution and Insurance are current gaps). Automated compliance checking in CI/CD pipelines. Secret scanning custom detectors deployed for all subsidiaries.

### Data Platform

Snowflake cost optimization and cross-subsidiary data sharing improvements. Unified event platform assessment (Confluent Cloud). Customer 360 MDM initiative for improved cross-subsidiary customer linkage (long-term).

### API Standardization

All subsidiaries expose production APIs through APIM by end of roadmap. Cross-subsidiary contract testing (Pact) mandatory for all API integrations. API versioning policy enforced through APIM policies.

## Related Documentation

- [Enterprise Architecture Summary](./enterprise-summary.md) — Current state architecture overview
- [Technology Radar](./technology-radar.md) — Approved, trial, and deprecated technologies
- [Integration Architecture Overview](./integration-overview.md) — Integration topology
- [Enterprise Security Architecture](../governance/security-architecture.md) — Security controls
- [Enterprise Data Flows](./data-flows.md) — Data platform and analytics
