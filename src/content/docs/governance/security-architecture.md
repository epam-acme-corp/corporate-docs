---
title: "Enterprise Security Architecture"
description: "Zero-trust security model and security architecture"
---

<!-- title: Enterprise Security Architecture | last-updated: 2025-03-15 | owner: Acme Tech — Security Architecture | status: current -->

# Enterprise Security Architecture

## Zero-Trust Security Model

Acme Corp's enterprise security architecture follows a zero-trust model: no implicit trust is granted based on network location, every request is authenticated and authorized, least-privilege access is enforced, and all traffic is encrypted. The model is built on three core principles:

1. **Verify explicitly** — Authenticate and authorize every request based on all available data points: user identity, device health, location, service identity, and resource sensitivity.
2. **Use least-privilege access** — Grant only the minimum permissions needed for a specific task, for the minimum duration needed. Time-bound access via Azure PIM for administrative operations.
3. **Assume breach** — Design for containment. Segment networks, encrypt data at rest and in transit, monitor all activity, and maintain incident response playbooks for rapid response.

### Implementation Maturity by Subsidiary

| Subsidiary | Zero-Trust Maturity | Notes |
|---|---|---|
| Acme Tech (L4) | Fully implemented | Reference implementation for the group |
| Acme Financial Services (L3) | Fully implemented | Enhanced controls for PCI-DSS and Basel III |
| Acme Retail (L3) | Fully implemented | PCI-DSS SAQ A-EP scoping |
| Acme Telco (L2) | Substantially implemented | BSS/OSS fully covered; some network equipment uses legacy authentication |
| Acme Media (L2) | Substantially implemented | CDN edge nodes use token-based auth; DRM systems have vendor-specific security |
| Acme Distribution (L1) | In progress | SAP systems transitioning to Entra ID SSO; WCF services use legacy Windows auth |
| Acme Insurance (L0) | Foundational | Mainframe uses RACF; ExpressRoute provides network isolation; no modern IAM integration for COBOL |

## Network Security — Hub-Spoke VNet Architecture

### Architecture Overview

The enterprise network follows an Azure hub-spoke topology:

- **Hub VNet (Acme Tech)** — Provides shared services: Azure Firewall, DNS, APIM, Entra ID Connect, and VPN/ExpressRoute gateways.
- **Spoke VNets (per subsidiary)** — Each subsidiary operates within its own spoke VNet, peered with the hub. Spoke-to-spoke traffic routes through the hub via Azure Firewall and APIM.

### Network Segmentation

Each subsidiary's spoke VNet is segmented by tier with Network Security Groups (NSGs) restricting lateral movement:

- **Web tier** — Public-facing services (e.g., Retail BookStore, Media streaming endpoints). Ingress from Azure Front Door / Cloudflare only.
- **Application tier** — Backend services and APIs. Ingress from web tier and APIM only.
- **Data tier** — Databases and data stores. Ingress from application tier only. No direct external access.

### Azure Firewall (Premium Tier)

All outbound internet traffic routes through the centralized Azure Firewall:

- **Egress allowlisting** — Only approved external services are reachable (package registries, SaaS APIs, payment processor endpoints).
- **IDPS** — Intrusion Detection and Prevention System enabled for all traffic.
- **TLS inspection** — Enabled for non-PCI traffic. PCI-scoped traffic between Retail and FSI uses end-to-end mTLS and is excluded from TLS inspection to maintain compliance.
- **DNS filtering** — Blocks known malicious domains using threat intelligence feeds.

### Private Endpoints

All cross-VNet Azure PaaS services use Private Endpoints — no public endpoints for internal services:

- Snowflake (via Azure Private Link)
- Azure SQL databases
- Azure Blob Storage
- Azure Key Vault
- Azure Container Registry

### Exceptions

**Insurance (ExpressRoute):** Insurance's on-premises mainframe (z/OS) connects via ExpressRoute private peering. Traffic is restricted to specific IP ranges and protocols: SNA/LU 6.2 for CICS transactions, SFTP for batch file transfers. No general internet connectivity for the mainframe.

**Distribution (SAP):** SAP systems are hosted on Azure VMs in Distribution's spoke VNet. SAP-specific NSG rules permit RFC and IDoc traffic between the SAP application servers and the Python Flask adapter services.

## Identity and Access Management

### Microsoft Entra ID — Single Identity Provider

All subsidiaries use Microsoft Entra ID as the single identity provider. All human users authenticate via Entra ID with SSO.

### Conditional Access Policies

| Policy | Requirement | Scope |
|---|---|---|
| MFA | Required for all users | All subsidiaries |
| Phishing-resistant MFA | FIDO2 or Microsoft Authenticator push preferred | Acme Tech, FSI, Retail |
| Compliant device | Required for production access (via Intune) | All modern subsidiaries |
| Location restriction | Production access from corporate network or approved VPN only | All subsidiaries |
| Risk-based step-up | Medium+ sign-in risk triggers additional authentication | All subsidiaries |

### Service-to-Service Authentication

- **Preferred:** Azure Managed Identity for service-to-service calls within Azure.
- **Alternative:** Service principals with certificate-based credentials (for cross-subscription or non-Azure services).
- **Prohibited in production:** Client secrets. All production service principals use certificate-based authentication.
- **Token flow:** OAuth 2.0 `client_credentials` grant via Entra ID.

### Emergency Break-Glass Procedures

Two break-glass accounts exist per subsidiary with the following controls:

- Strong passwords (40+ characters) stored in a physical safe at each subsidiary's primary office.
- Monitored 24/7 — any usage triggers an immediate SOC alert and automatic notification to the subsidiary CISO and Acme Tech Security.
- Tested quarterly to verify credentials are valid and monitoring is operational.
- Break-glass accounts are excluded from Conditional Access policies to ensure emergency access.

### Privileged Access Management

Azure PIM (Privileged Identity Management) provides just-in-time administrative access:

- All admin roles are eligible, not permanently assigned. Administrators request activation when needed.
- Maximum activation duration: 8 hours.
- Approval required for Global Admin and Security Admin role activations.
- All PIM activations are logged and reviewed monthly by the subsidiary security lead.

## Application Security — GHAS Rollout

GitHub Advanced Security (GHAS) provides the application security tooling across the group:

| Subsidiary | GHAS Enabled | CodeQL Languages | Custom Query Packs | Secret Scanning |
|---|---|---|---|---|
| Acme Tech | Yes | C#, Python, JavaScript, Go, Terraform | Acme security patterns | Active + custom detectors |
| Financial Services | Yes | Java, Python, SQL | FSI compliance rules | Active + custom detectors |
| Retail | Yes | C#, JavaScript, TypeScript | Retail PCI patterns | Active + custom detectors |
| Telco | Yes | Java, C++, Python, TypeScript | Telco-specific patterns | Active |
| Media | Yes | Go, JavaScript, Java, Python | Media DRM patterns | Active |
| Distribution | Planned | Java, Python, C# (.NET 4.6 limited) | Pending | Pending |
| Insurance | Planned | COBOL (not supported), VB6 (limited) | N/A | Pending (SVN migration first) |

### CodeQL Custom Query Packs

Acme Tech maintains a shared query pack (`acme-security-queries`) covering:

- SQL injection patterns specific to Acme's ORMs (Entity Framework, Spring Data, SQLAlchemy)
- Insecure deserialization in .NET and Java applications
- Hardcoded credential patterns (connection strings, API keys, tokens)
- Acme-specific API misuse (e.g., calling internal APIs without required `X-Correlation-ID` header)

### Secret Scanning Custom Detectors

Custom secret detectors are configured for Acme-internal credential formats:

- Acme internal API keys (prefix: `acme_api_`)
- Snowflake connection strings and credentials
- Datadog API and application keys
- Subsidiary-specific service account credentials

## Data Security

### Encryption at Rest

AES-256 encryption for all data stores. Azure-managed keys by default; customer-managed keys (CMK) for PCI-scoped and regulatory data stores:

- FSI Oracle databases — CMK via Azure Key Vault
- Insurance DB2 data extracts in Azure Blob Storage — CMK via Azure Key Vault
- Retail payment-related tables — CMK via Azure Key Vault

### Encryption in Transit

TLS 1.3 minimum for all cross-subsidiary and external traffic. TLS 1.2 is permitted for legacy connections with documented upgrade plans:

- Insurance mainframe SFTP connections (TLS 1.2, upgrade planned with mainframe connectivity refresh)
- Distribution SAP RFC connections (TLS 1.2, upgrade planned with SAP S/4HANA migration)

### Key Management

Per-subsidiary Azure Key Vault instances managed by Acme Tech Security in partnership with subsidiary security leads. Cross-subsidiary key access requires explicit RBAC approval from both parties and Acme Tech's security team.

### PII Classification and Handling

Data is classified into four tiers:

| Tier | Description | Examples | Access Controls |
|---|---|---|---|
| Public | Information intended for public disclosure | Marketing content, public API docs | No restrictions |
| Internal | Non-sensitive business information | Internal process docs, meeting notes | Entra ID authentication required |
| Confidential | Sensitive data requiring protection | PII (names, emails, addresses), financial data | RBAC + audit logging |
| Restricted | Highly sensitive data with regulatory implications | SSN, credit card data, KYC documents, medical records | RBAC + audit logging + column-level masking + approval workflow |

PII in Snowflake is protected by column-level dynamic masking policies. Restricted data requires explicit role grant approved by the data owner and Acme Tech Security.

### Data Loss Prevention (DLP)

- **Microsoft Purview DLP** policies applied to Microsoft 365 (email, SharePoint, Teams) — prevents sharing of PII and restricted data with unauthorized recipients.
- **Endpoint DLP** on managed devices via Microsoft Intune — blocks unauthorized USB transfers, clipboard operations with restricted data.
- **Database-level DLP** via audit logging and anomaly detection — Datadog monitors query patterns for unusual data access volumes.

## Threat Model

### External Threats

| Threat | Mitigation |
|---|---|
| DDoS attacks | Azure DDoS Protection Standard on all public-facing endpoints. Cloudflare protection for Retail BookStore and Media streaming. |
| Credential stuffing | Entra ID Smart Lockout, CAPTCHA on public login pages, rate limiting at APIM. |
| Supply chain attacks | Dependabot, GHAS secret scanning, private package registries (GitHub Packages, Azure Artifacts), SBOM generation for all production deployments. |
| Phishing | Phishing-resistant MFA (FIDO2), Entra ID Conditional Access risk policies, Microsoft Defender for Office 365. |

### Internal Threats

| Threat | Mitigation |
|---|---|
| Data exfiltration | DLP policies, network egress controls (Azure Firewall), database activity monitoring, Conditional Access (block unmanaged devices). |
| Privilege escalation | Azure PIM (just-in-time access), least-privilege RBAC, segregation of duties, audit logging of all privilege changes. |
| Insider threat | Background checks for privileged roles, activity monitoring, quarterly access reviews, separation of deployment and approval duties. |

## Security Operations

### SOC Integration

Acme Tech operates the Security Operations Center (SOC), which monitors all subsidiaries 24/7:

- **SIEM:** Datadog Security Monitoring ingests security events from all subsidiaries — Azure Activity Logs, Entra ID sign-in logs, GHAS alerts, Azure Firewall logs, and application security events.
- **Alert triage:** L1 SOC analysts handle initial triage. L2/L3 escalation to subsidiary security leads for subsidiary-specific incidents.
- **Correlation rules:** Custom detection rules for cross-subsidiary attack patterns (e.g., compromised credentials used across multiple subsidiaries).

### Incident Response

Documented playbooks cover the following scenarios: credential compromise, data breach, DDoS attack, ransomware, insider threat, and supply chain compromise. Each playbook defines detection criteria, escalation path, containment steps, communication plan, and post-incident review process.

### Penetration Testing

Quarterly external penetration testing by a third-party firm. Scope rotates across subsidiaries — each subsidiary is tested at least annually. Critical findings must be remediated within 30 days; high-severity findings within 90 days.

### Vulnerability Management

- **Code and dependencies:** Dependabot and GHAS provide continuous scanning. Critical CVEs must be patched within 72 hours; high-severity within 30 days.
- **Infrastructure:** Microsoft Defender for Cloud scans all Azure resources. Compliance standards: CIS Azure Foundations Benchmark.

## Related Documentation

- [Compliance Matrix](./compliance-matrix.md) — Regulatory compliance status and governance
- [Integration Architecture Overview](../architecture/integration-overview.md) — Network topology context
- [Acme Tech Identity and Access Management](../../acme-tech/security/identity-access-management.md)
- [Acme Tech Access Policies](../../acme-tech/security/access-policies.md)
- [Acme Retail PCI-DSS Compliance](../../acme-retail/security/pci-dss-compliance.md)
- [Acme FSI Compliance Framework](../../acme-financial-services/security/compliance-framework.md)
