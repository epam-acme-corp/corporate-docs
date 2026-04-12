---
title: "Regulatory Compliance Matrix"
description: "Regulatory compliance requirements across all subsidiaries"
---

<!-- title: Regulatory Compliance Matrix | last-updated: 2025-03-15 | owner: Acme Tech — Security Architecture | status: current -->

# Regulatory Compliance Matrix

## Overview

Acme Corp's seven subsidiaries operate under multiple regulatory regimes spanning financial services, insurance, telecommunications, data privacy, and public company governance. This document provides the consolidated compliance matrix, per-regulation detail, and the group-level governance framework that ensures ongoing compliance.

Acme Tech serves as the central compliance coordination point, managing shared security services and facilitating cross-subsidiary compliance activities. Each subsidiary maintains its own compliance team responsible for regulation-specific requirements.

For the technical security controls that support these compliance requirements, see the [Enterprise Security Architecture](./security-architecture.md).

## Regulatory Compliance Matrix

| Regulation | Applicable Subsidiaries | Current Status | Compliance Owner | Audit Frequency |
|---|---|---|---|---|
| PCI-DSS v4.0 | Financial Services (Level 1), Retail (SAQ A-EP) | Compliant | FSI CISO + Retail Security Lead | Annual (QSA for FSI, SAQ for Retail) |
| Basel III | Financial Services | Compliant | FSI Risk & Compliance | Quarterly reporting, annual audit |
| MiFID II | Financial Services | Compliant | FSI Compliance | Annual audit |
| SOX (Sarbanes-Oxley) | Financial Services, Acme Corp (consolidated) | Compliant | FSI Finance + Group CFO | Annual audit |
| State Insurance Regulations | Insurance | Compliant (varies by state) | Insurance Compliance | Annual per state |
| FCC Regulations | Telco | Compliant | Telco Regulatory Affairs | Annual |
| CALEA | Telco | Compliant | Telco Legal + Engineering | Annual audit |
| GDPR | All (EU operations) | Compliant | Acme Tech DPO | Annual assessment |
| CCPA/CPRA | All (California consumers) | Compliant | Acme Tech Legal | Annual assessment |
| SOC 2 Type II | Acme Tech (shared services) | Compliant | Acme Tech Security | Annual audit |

## Per-Regulation Details

### PCI-DSS v4.0

**Scope:** Financial Services' Payments Gateway processes card transactions and is certified as PCI-DSS Level 1 (highest level, > 6 million transactions annually). Retail's BookStore is scoped as SAQ A-EP — card data is tokenized client-side via Stripe Elements and never enters Retail's infrastructure.

**Key controls:** Network segmentation between cardholder data environment (CDE) and general network. mTLS for all payment API traffic. Encryption of cardholder data at rest (AES-256 with CMK). Quarterly vulnerability scans by approved scanning vendor (ASV). Annual penetration test of the CDE. Multi-factor authentication for all CDE access.

**Last audit:** FSI QSA assessment completed Q4 2024 — compliant with zero findings. Retail SAQ A-EP self-assessment completed Q4 2024 — compliant.

**Next audit:** Q4 2025. QSA firm: selected via competitive process (3-year rotation).

### Basel III

**Scope:** Financial Services' capital adequacy, liquidity ratios, and leverage ratios. Applies to FSI's banking and lending operations.

**Key controls:** Real-time capital ratio monitoring via FSI's Risk Engine. Automated liquidity coverage ratio (LCR) calculations. Stress testing models executed quarterly. Risk-weighted asset calculations updated daily.

**Last audit:** Annual regulatory examination completed Q1 2025 — compliant. No material findings.

### MiFID II

**Scope:** Financial Services' investment and trading operations. Requires transaction reporting, best execution policies, client categorization, and record-keeping.

**Key controls:** Automated transaction reporting to regulatory authorities (T+1). Best execution monitoring and reporting. Client communication records retained for 7 years. Conflict-of-interest policies and disclosures.

**Last audit:** External compliance audit completed Q2 2024 — compliant. One minor finding related to transaction report field formatting — remediated within 30 days.

### SOX (Sarbanes-Oxley)

**Scope:** Acme Corp as a consolidated entity and Financial Services specifically. Covers internal controls over financial reporting (ICFR), IT general controls (ITGCs), and management assertions.

**Key controls:** Segregation of duties in financial systems (enforced via Entra ID RBAC and Azure PIM). Change management controls for financial system deployments. Database access logging and review. Automated reconciliation between subsidiary financial systems and consolidated reports.

**Last audit:** Annual SOX audit completed Q1 2025 — unqualified opinion. ITGCs clean across all in-scope systems.

### State Insurance Regulations

**Scope:** Insurance operations across all states where Acme Insurance is licensed. Requirements vary by state — includes capital reserve adequacy, claims handling procedures, rate filing requirements, and market conduct.

**Key controls:** State-specific reserve calculations maintained in DB2. Claims handling workflows enforced by mainframe business rules. Rate filings submitted per state regulatory calendar. Market conduct audit readiness maintained continuously.

**Current status:** Compliant across all operating states. Annual examinations conducted by state insurance departments on a rotating schedule.

### FCC Regulations and CALEA

**Scope:** Telco operations — spectrum licensing, consumer protection, accessibility requirements (FCC). Lawful intercept capabilities (CALEA).

**Key controls (FCC):** Spectrum usage monitoring and compliance reporting. Consumer billing dispute resolution processes. Accessibility features in customer-facing applications (WCAG 2.1 AA).

**Key controls (CALEA):** Lawful intercept infrastructure maintained by Telco Engineering. Intercept capabilities tested annually with law enforcement coordination. Access to intercept systems restricted to cleared personnel with background checks.

### GDPR and CCPA/CPRA

**Scope:** All subsidiaries that process personal data of EU residents (GDPR) or California consumers (CCPA/CPRA).

**Key controls:** Data Subject Access Request (DSAR) workflow — automated for Retail and FSI, manual for Insurance. Privacy-by-design reviews for new features and integrations. Data Processing Agreements (DPAs) with all third-party processors. Cookie consent management on all customer-facing websites. Data retention policies enforced per regulation.

**Data Protection Officer (DPO):** Appointed at Acme Tech, responsible for group-wide GDPR compliance coordination.

### SOC 2 Type II

**Scope:** Acme Tech's shared services consumed by all subsidiaries — Entra ID, APIM, Datadog, Snowflake management, GitHub Enterprise, GHAS.

**Key controls:** Change management (all changes via pull requests with required reviews). Access controls (Entra ID, Azure PIM, RBAC). Monitoring and alerting (Datadog). Incident response (documented playbooks, tested quarterly). Business continuity (Azure multi-region deployment, disaster recovery tested annually).

**Last audit:** SOC 2 Type II report issued Q1 2025 — clean report with no exceptions.

## Group-Level Compliance Governance

### Quarterly Compliance Committee

The Compliance Committee meets quarterly, chaired by the Group CISO (Acme Tech):

- **Attendees:** Subsidiary compliance leads, Group Legal, Group CFO office, Acme Tech Security.
- **Agenda:** Review of audit findings across all subsidiaries. Regulatory change impact assessments. Cross-subsidiary compliance dependencies. Incident reports and lessons learned. Upcoming audit schedule coordination.

### Annual Audit Plan

Acme Tech coordinates audit schedules across all subsidiaries to avoid conflicts and ensure coverage:

- External auditors selected via competitive process every 3 years.
- Audit schedule published at the start of each fiscal year.
- Internal audit team conducts pre-audit readiness assessments 60 days before each external audit.

### Regulatory Change Management

- Acme Tech Legal monitors regulatory changes globally across all applicable jurisdictions.
- Impact assessments are distributed to affected subsidiaries within 30 days of regulatory publication.
- Implementation timelines are tracked in quarterly compliance reviews.
- Major regulatory changes (e.g., PCI-DSS version upgrades) trigger dedicated project workstreams.

### Compliance Training

Annual security and compliance training is mandatory for all employees:

| Training Module | Audience | Frequency |
|---|---|---|
| Security awareness | All employees | Annual + quarterly phishing exercises |
| Secure coding practices | Developers | Annual |
| Incident response | Operations teams | Annual + quarterly tabletop exercises |
| SOX controls | Finance teams | Annual |
| PII handling and privacy | Anyone handling personal data | Annual |
| PCI-DSS awareness | FSI and Retail payment teams | Annual |

## Related Documentation

- [Enterprise Security Architecture](./security-architecture.md) — Technical security controls
- [Integration Architecture Overview](../architecture/integration-overview.md) — Integration security context
- [Acme Tech Identity and Access Management](../../acme-tech/security/identity-access-management.md)
- [Acme Retail PCI-DSS Compliance](../../acme-retail/security/pci-dss-compliance.md)
- [Acme FSI Compliance Framework](../../acme-financial-services/security/compliance-framework.md)
