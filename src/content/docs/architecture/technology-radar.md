---
title: "Acme Corp Technology Radar"
description: "Technology adoption recommendations and lifecycle status"
---

<!-- title: Acme Corp Technology Radar | last-updated: 2025-03-15 | owner: Acme Tech — Enterprise Architecture | status: current -->

# Acme Corp Technology Radar

## Overview

The Acme Corp Technology Radar provides a snapshot of the technologies used, evaluated, and deprecated across the group. Maintained by Acme Tech's Enterprise Architecture team and reviewed by the Technology Approval Committee, the radar guides technology decisions across all seven subsidiaries.

The radar is organized into four quadrants (Languages & Frameworks, Platforms & Infrastructure, Tools, Techniques) with four rings indicating the adoption recommendation for each technology.

## Ring Definitions

| Ring | Definition | Guidance |
|---|---|---|
| **Adopt** | Proven at Acme Corp. Recommended for new projects. Well-supported, documented, and staffed. | Teams should use these technologies by default for new work. |
| **Trial** | Being used in production in at least one subsidiary. Showing promise. | Teams may adopt for new projects with Architecture Review Board approval. |
| **Assess** | Interesting technology being evaluated. Proof-of-concept stage. | Not approved for production use without explicit Technology Approval Committee approval. |
| **Hold** | Technologies being phased out or not recommended for new projects. | Existing usage maintained but not expanded. Migration paths defined. |

## Languages & Frameworks

| Technology | Ring | Used At | Notes |
|---|---|---|---|
| Java 17+ / Spring Boot 3 | Adopt | FSI, Telco, Distribution, Media | Group standard for JVM workloads |
| .NET 6–8 / ASP.NET Core | Adopt | Retail, Acme Tech | Group standard for .NET workloads |
| React 18+ | Adopt | Retail, FSI, Media, Acme Tech | Group standard for web frontends |
| Python 3.11+ | Adopt | All (various uses) | Data science, scripting, APIs |
| TypeScript | Adopt | Retail, Media, Acme Tech | Preferred over JavaScript for new projects |
| Go 1.21+ | Trial | Media (streaming), Acme Tech (platform tooling) | High-performance services, emerging adoption |
| FastAPI | Trial | Distribution (new APIs), Media (ML serving) | Modern Python API framework |
| Angular 17+ | Trial | Telco (BSS frontend) | Telco-specific; React preferred for new group projects |
| C++ (ISO 17+) | Trial | Telco (Rating Engine) | Specialized use case — high-performance real-time rating |
| .NET Framework 4.6 | Hold | Distribution (WCF services) | Migration to .NET 8 planned |
| VB6 | Hold | Insurance (desktop apps) | No new development; maintain only |
| Classic ASP | Hold | Insurance (web UI) | No new development; maintain only |
| COBOL | Hold | Insurance (mainframe) | Maintain only; no new COBOL development |
| Java 8 / Java 11 | Hold | Distribution (legacy), Telco (some services) | Migrate to Java 17+ |

## Platforms & Infrastructure

| Technology | Ring | Used At | Notes |
|---|---|---|---|
| Kubernetes (AKS) | Adopt | FSI, Retail, Media, Acme Tech, Telco (partial) | Standard container orchestration |
| Terraform | Adopt | FSI, Retail, Media, Acme Tech, Telco | Standard IaC tool |
| Azure (cloud platform) | Adopt | All | Group cloud provider |
| GitHub Actions | Adopt | All except Insurance (SVN) | Standard CI/CD platform |
| PostgreSQL | Adopt | FSI, Retail, Acme Tech | Preferred open-source RDBMS |
| Microsoft Entra ID | Adopt | All | Group identity provider |
| Snowflake | Adopt | All (via Acme Tech) | Enterprise analytics platform |
| Kafka (Confluent) | Adopt | FSI | Event streaming for financial services |
| RabbitMQ | Adopt | Retail, Media | Message broker for order and content events |
| ClickHouse | Trial | Media (analytics) | Columnar analytics database for real-time aggregations |
| Confluent Cloud | Assess | Acme Tech (evaluating) | Potential unified event platform for cross-subsidiary routing |
| Istio (service mesh) | Assess | Acme Tech (evaluating) | Future cross-subsidiary service mesh |
| SQL Server 2012 | Hold | Insurance | End-of-support; migrate to PostgreSQL or modern SQL Server |
| SVN | Hold | Insurance | Migrate to Git/GitHub |
| On-premises mainframe (z/OS) | Hold | Insurance | Maintain only; hybrid cloud integration via ExpressRoute |

## Tools

| Technology | Ring | Used At | Notes |
|---|---|---|---|
| GitHub (repos, PRs, issues) | Adopt | All except Insurance (SVN) | Standard SCM and collaboration platform |
| GitHub Advanced Security (GHAS) | Adopt | FSI, Retail, Telco, Media, Acme Tech | Standard application security tooling |
| Datadog | Adopt | All | Standard observability platform (APM, logs, metrics, SLOs) |
| Tableau | Adopt | All (via Acme Tech) | Executive BI and board reporting |
| Looker | Adopt | All (via Acme Tech) | Operational BI and self-service analytics |
| dbt | Adopt | All (via Acme Tech) | Data transformation in Snowflake |
| Jupyter / JupyterHub | Adopt | FSI, Retail, Media, Acme Tech | Data science workbench |
| GitHub Copilot | Trial | FSI, Retail, Acme Tech, Telco | AI-assisted development — measuring productivity impact |
| MLflow | Trial | FSI, Media | ML experiment tracking and model registry |

## Techniques

| Technique | Ring | Used At | Notes |
|---|---|---|---|
| Microservices | Adopt | FSI, Retail, Media, Acme Tech | Default architecture for new systems |
| Infrastructure as Code | Adopt | All modern subsidiaries | Terraform-based provisioning |
| CI/CD (trunk-based) | Adopt | FSI, Retail, Acme Tech | GitHub Actions with branch protection rules |
| Event-Driven Architecture | Adopt | FSI, Retail, Media | Kafka and RabbitMQ based |
| Contract Testing (Pact) | Trial | FSI, Retail | Cross-subsidiary API contract verification |
| Feature Flags | Trial | Retail, FSI | LaunchDarkly for controlled feature rollout |
| GraphQL | Assess | Media (CMS API) | Evaluating for broader use in content-heavy APIs |
| Rust (performance-critical) | Assess | Acme Tech (evaluating) | Potential for Telco Rating Engine rewrite |
| SOAP / WCF | Hold | Distribution (SAP adapters) | Wrap with REST; no new SOAP services |
| Manual deployments | Hold | Insurance | Automate via GitHub Actions after SVN migration |

## How to Propose a New Technology

To introduce a technology not currently on the Adopt or Trial rings:

1. Submit a technology proposal to the Enterprise Architecture team with business justification, risk assessment, and proof-of-concept results.
2. The Technology Approval Committee reviews the proposal in its monthly meeting.
3. If approved for Trial, the technology is assigned a sponsoring subsidiary and success criteria.
4. After successful trial (typically 6–12 months), the committee may promote to Adopt.

## Related Documentation

- [Enterprise Architecture Summary](./enterprise-summary.md) — Consolidated architecture view
- [Modernization Roadmap](./modernization-roadmap.md) — Technology migration plans
- [Acme Tech Platform Engineering](../../acme-tech/technical/platform-engineering.md) — Platform services
