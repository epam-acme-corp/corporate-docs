---
title: "Acme Corporation — System Registry"
description: "Authoritative inventory of every bespoke system across all Acme Corp subsidiaries"
---

# Acme Corporation — System Registry

> **Purpose:** Authoritative inventory of every bespoke system across all Acme Corp subsidiaries.
> This document is the blueprint for building application emulations of the full Acme Corp landscape.
> Every system, integration, and contract listed here must be accurate and consistent with the knowledge base.

---

## Reading Guide

Each system entry includes:

| Field | Description |
|-------|-------------|
| **Type** | Web app, API service, batch processor, desktop client, mobile app, platform service |
| **Technology** | Language, framework, version |
| **Runtime** | Container (AKS), VM (IIS), mainframe (z/OS), serverless, desktop |
| **Database** | Engine, version, type (RDBMS, document, time-series, in-memory) |
| **Cache / Broker** | Redis, RabbitMQ, Kafka, MQTT — where applicable |
| **API Style** | REST, SOAP/WCF, GraphQL, gRPC, batch file |
| **Auth** | How the system authenticates (Entra ID, API key, basic, etc.) |
| **Integrates With** | Internal systems (within OPCO and cross-OPCO) and 3rd-party services |

---

## 1. Acme Tech — Shared Services Platform

**Maturity:** Level 4 (AI-Native) · **HQ:** Chicago, IL · **~2,500 employees** · **3% revenue**

Acme Tech provides centralised platform services to all subsidiaries. Systems are primarily managed cloud services with custom configuration, automation, and governance tooling layered on top.

### 1.1 Identity Hub

| Field | Value |
|-------|-------|
| Type | Platform service (identity provider) |
| Technology | Entra ID (Azure AD) with custom Terraform provisioning + PowerShell automation |
| Runtime | Azure PaaS (managed) |
| Database | Entra ID directory (managed) |
| API Style | OIDC / SAML 2.0 / SCIM 2.0 / Microsoft Graph REST API |
| Auth | N/A (this IS the auth provider) |
| Integrates With | **All subsidiary systems** (SSO federation), Azure APIM (token validation), Datadog (audit log forwarding), GitHub Enterprise (SAML SSO + SCIM provisioning) |

**Key details:**
- Conditional Access policies: MFA required, compliant device for production
- SCIM auto-provisioning to GitHub Enterprise (team sync from Entra groups)
- Emergency break-glass accounts with PIM (Privileged Identity Management)
- PAT and SSH key policies enforced at org level

### 1.2 API Gateway

| Field | Value |
|-------|-------|
| Type | Platform service (API management) |
| Technology | Azure API Management (Premium tier) + custom policy fragments (C# expressions) |
| Runtime | Azure PaaS (multi-region, internal VNet injection) |
| Database | None (stateless proxy; analytics to Azure Monitor + Datadog) |
| Cache | Built-in APIM cache (Redis-backed, per-policy) |
| API Style | REST (proxies all backend styles: REST, SOAP, GraphQL) |
| Auth | OAuth 2.0 token validation (Entra ID), API key (partner tier), mutual TLS (Insurance legacy) |
| Integrates With | **All subsidiary APIs** (reverse proxy), Entra ID (token validation), Datadog (metrics + logs), Azure Key Vault (secrets, certificates) |

**Key details:**
- URL pattern: `https://api.acme-corp.com/{subsidiary}/{service}/{version}/`
- Rate limiting: per-subscription (default 100 req/min, 10K req/day)
- Cross-subsidiary traffic routed through APIM (mandatory for all production)
- SOAP-to-REST translation policies for Insurance and Distribution legacy endpoints
- Correlation header injection: `X-Correlation-ID` (UUID, injected if absent)
- Request/response logging to Datadog (body redacted for PCI/PII)

### 1.3 GitHub Enterprise Governance Platform

| Field | Value |
|-------|-------|
| Type | Platform service (DevSecOps governance) |
| Technology | GitHub Enterprise Cloud + custom GitHub Actions (TypeScript, composite actions), GitHub Apps (Node.js) |
| Runtime | GitHub-hosted + self-hosted runners on AKS |
| Database | None (GitHub as system of record) |
| API Style | GitHub REST API v3 + GraphQL v4, webhook events |
| Auth | GitHub App installation tokens, SAML SSO via Entra ID |
| Integrates With | Entra ID (SAML + SCIM), Datadog (CI/CD metrics via webhook), Azure Key Vault (Actions secrets sync), APIM (deployment notifications) |

**Key details:**
- 7 GitHub organizations (one per subsidiary + corporate)
- Custom rulesets: conventional commits, signed commits (FSI/Insurance), tag protection
- Reusable workflow library: `acme-tech/github-actions-library`
- Self-hosted runners: AKS node pools, ephemeral containers, org-scoped
- GHAS rollout: FSI ✅, Retail ✅, Telco ✅, Media ✅, Distribution 🔲, Insurance 🔲

### 1.4 Observability Platform

| Field | Value |
|-------|-------|
| Type | Platform service (monitoring and observability) |
| Technology | Datadog (SaaS) + custom agents, dashboards, monitors (Terraform-managed) |
| Runtime | Datadog SaaS + agents on AKS (DaemonSet), VMs, on-prem (Insurance) |
| Database | Datadog (managed; retention: 15 days hot metrics, 90 days logs, 15 days traces) |
| API Style | Datadog REST API v2 (programmatic dashboard/monitor management) |
| Auth | Datadog API key + app key (per subsidiary, rotated quarterly) |
| Integrates With | **All subsidiary applications** (agents/logs), GitHub Actions (CI/CD metrics), PagerDuty (incident routing), Slack (alerts), Azure Monitor (infrastructure metrics) |

**Key details:**
- Unified log format: JSON with required fields (timestamp, service, level, message, traceId, spanId, subsidiary, environment, correlationId)
- W3C Trace Context + Datadog headers for distributed tracing
- SLO monitoring per service tier (Tier 1: 99.95-99.99%, Tier 2: 99.9%, Tier 3: 99.5%)
- Sensitive Data Scanner for PII/PCI redaction in logs

### 1.5 Data & AI Platform

| Field | Value |
|-------|-------|
| Type | Platform service (analytics and AI infrastructure) |
| Technology | Snowflake (analytics), Azure AI Search (RAG), Azure OpenAI (LLM), MLflow (model registry), Apache Airflow (orchestration), dbt (transformations) |
| Runtime | Azure PaaS + Snowflake SaaS |
| Database | Snowflake (per-subsidiary databases + cross-subsidiary shares), Azure Cosmos DB (RAG metadata), Azure AI Search (vector + keyword indexes) |
| API Style | REST (Snowflake SQL API, Azure AI Search REST, Azure OpenAI REST) |
| Auth | Entra ID managed identities, Snowflake key-pair auth, Azure RBAC |
| Integrates With | **All subsidiary databases** (ETL pipelines via Airflow), Azure Blob Storage (data lake), GitHub (dbt models in repos), Datadog (pipeline monitoring) |

**Key details:**
- Each subsidiary has its own Snowflake database; Acme Tech manages cross-subsidiary data shares with RBAC
- dbt transformation layer: per-subsidiary models + cross-subsidiary consolidated models
- RAG infrastructure: Azure AI Search with hybrid search (keyword + vector), chunking via Copilot-IQ CLI
- ML model governance: MLflow tracking, model registry, promotion gates

### 1.6 Infrastructure Platform

| Field | Value |
|-------|-------|
| Type | Platform service (infrastructure as code) |
| Technology | Terraform v1.7+ (modules), Azure Landing Zones (hub-spoke), Helm charts |
| Runtime | AKS clusters (per subsidiary per environment), Azure VMs (legacy workloads) |
| Database | None (state in Azure Storage backend, encrypted) |
| API Style | Terraform provider APIs, Azure Resource Manager REST |
| Auth | Entra ID service principals, workload identity federation (OIDC for GitHub Actions) |
| Integrates With | GitHub Actions (CI/CD), Azure Key Vault (secrets), Datadog (drift detection alerts), Slack (notifications) |

**Key details:**
- Hub-spoke VNet topology: Acme Tech hub + 7 subsidiary spokes
- Private Endpoints mandatory for all PaaS in production
- Azure Firewall for egress filtering
- Daily drift detection: `terraform plan` → alert on drift → auto-remediation PRs
- Mandatory tags: cost-center, subsidiary, environment, owner

---

## 2. Acme Financial Services — Banking & Finance

**Maturity:** Level 3 (AI-Assisted) · **HQ:** New York, NY · **~12,000 employees** · **32% revenue**

Heavily regulated (PCI-DSS, Basel III, MiFID II, SOX, AML/KYC). Modern Java/Spring microservices architecture with event-driven patterns.

### 2.1 Core Banking Platform

| Field | Value |
|-------|-------|
| Type | API service (monolith with modular decomposition) |
| Technology | Java 17 / Spring Boot 3.2 |
| Runtime | AKS (Azure Kubernetes Service), 3 replicas per service module |
| Database | Oracle 19c RAC (Real Application Clusters) — primary transactional store |
| Cache | Redis 7 (session cache, account balance cache) |
| Broker | Kafka 3.6 (transaction events, audit trail) |
| API Style | REST (internal APIs), SOAP (legacy integration with Insurance) |
| Auth | Entra ID OAuth 2.0 (service-to-service: client credentials) |
| Integrates With | Payments Gateway (REST — payment initiation), Risk Engine (REST — transaction risk scoring), Regulatory Reporting (Kafka — transaction events), Wealth Management Portal (REST — account data), Data Warehouse (Kafka → Snowflake), **Acme Tech** APIM (external API exposure), Entra ID (auth), Datadog (observability) |

**Key APIs:**
- `GET /api/v2/accounts/{accountId}` — Account details
- `GET /api/v2/accounts/{accountId}/transactions` — Transaction history
- `POST /api/v2/accounts/{accountId}/transactions` — Initiate transaction
- `GET /api/v2/accounts/{accountId}/statements` — Statement generation
- `POST /api/v2/accounts/interest-calculation` — Interest batch trigger

**Key tables:** ACCOUNTS, TRANSACTIONS, CUSTOMERS, INTEREST_RATES, STATEMENTS, AUDIT_LOG

### 2.2 Payments Gateway

| Field | Value |
|-------|-------|
| Type | API service (event-driven microservices) |
| Technology | Java 17 / Spring Boot 3.2, Spring Cloud Stream |
| Runtime | AKS, 5 replicas (high availability, PCI-DSS zone) |
| Database | PostgreSQL 15 (transaction records) + Redis 7 (idempotency cache, rate limiting) |
| Broker | Kafka 3.6 (payment events: initiated, authorized, captured, settled, refunded) |
| API Style | REST (PCI-DSS compliant endpoints) |
| Auth | Entra ID OAuth 2.0 + mutual TLS for partner connections |
| Integrates With | Core Banking (REST — account debit/credit), **Acme Retail** Payment Module (REST — payment authorization/capture/refund), SWIFT (ISO 20022 messaging — wire transfers), Card Networks via processor (Visa/Mastercard), Stripe (tokenization partner), **Acme Telco** (REST — mobile payment acceptance), Risk Engine (REST — fraud screening pre-auth), Datadog (PCI audit logging) |

**Key APIs:**
- `POST /api/v1/payments/authorize` — Payment authorization (tokenized card)
- `POST /api/v1/payments/capture` — Capture authorized payment
- `POST /api/v1/payments/refund` — Process refund
- `GET /api/v1/payments/{paymentId}/status` — Payment status
- `POST /api/v1/transfers/wire` — SWIFT wire transfer initiation
- `POST /api/v1/transfers/sepa` — SEPA credit transfer

**Kafka topics:** `fsi.payments.initiated`, `fsi.payments.authorized`, `fsi.payments.captured`, `fsi.payments.settled`, `fsi.payments.refunded`, `fsi.payments.failed`

### 2.3 Risk Engine

| Field | Value |
|-------|-------|
| Type | API service (ML inference + rules engine) |
| Technology | Python 3.11 / FastAPI, scikit-learn, XGBoost, TensorFlow Serving |
| Runtime | AKS (GPU node pool for model inference) |
| Database | PostgreSQL 15 (risk scores, model metadata, decision log) |
| Cache | Redis 7 (feature store — customer risk profiles, cached bureau data) |
| API Style | REST |
| Auth | Entra ID OAuth 2.0 (service-to-service) |
| Integrates With | Core Banking (REST — customer data for scoring), Payments Gateway (REST — real-time fraud check), Experian/Equifax (REST — credit bureau pulls), Refinitiv/World-Check (REST — KYC/AML screening), MLflow (model registry — model version management), Data Warehouse (Snowflake — model training data), Datadog (model performance metrics) |

**Key APIs:**
- `POST /api/v1/risk/credit-score` — Real-time credit scoring
- `POST /api/v1/risk/fraud-check` — Transaction fraud detection (< 100ms SLA)
- `POST /api/v1/risk/aml-screening` — AML/sanctions screening
- `GET /api/v1/risk/models/{modelId}/performance` — Model performance metrics

**ML models:** Credit scoring (XGBoost, retrained monthly), Fraud detection (TensorFlow, real-time inference, retrained weekly), AML pattern detection (scikit-learn ensemble, retrained quarterly)

### 2.4 Regulatory Reporting

| Field | Value |
|-------|-------|
| Type | Batch processor |
| Technology | Java 17 / Spring Batch 5 |
| Runtime | AKS (scheduled CronJobs) |
| Database | Oracle 19c (reads from Core Banking), PostgreSQL 15 (report staging, audit trail) |
| Broker | Kafka 3.6 (consumes transaction events for near-real-time aggregation) |
| API Style | REST (report status/trigger), batch file output (regulatory submission) |
| Auth | Entra ID OAuth 2.0, mutual TLS for regulatory submissions |
| Integrates With | Core Banking (Oracle direct read — transaction data), Kafka (transaction events), Data Warehouse (Snowflake — aggregated risk data), Regulatory filing systems (SFTP batch submission — Basel III, MiFID II, SOX), Datadog (job monitoring) |

**Key jobs:**
- `BaselIIICapitalAdequacyReport` — Daily capital adequacy calculation
- `MiFIDTransactionReport` — T+1 trade reporting
- `SOXAuditTrailExtract` — Monthly audit trail generation
- `AMLSuspiciousActivityReport` — Real-time + daily SAR generation

### 2.5 Wealth Management Portal

| Field | Value |
|-------|-------|
| Type | Web application (SPA + BFF) |
| Technology | React 18 (frontend) + Node.js 20 / Express (BFF) |
| Runtime | AKS (BFF), Azure CDN (static assets) |
| Database | MongoDB 7 (client preferences, portfolio configuration) |
| Cache | Redis 7 (session store, portfolio cache) |
| API Style | REST (BFF aggregates downstream services) |
| Auth | Entra ID OAuth 2.0 (authorization code + PKCE for user login) |
| Integrates With | Core Banking (REST — account balances, transaction history), Bloomberg (REST — real-time market data, portfolio analytics), Risk Engine (REST — portfolio risk assessment), Data Warehouse (Snowflake — historical performance), Datadog (RUM for frontend, APM for BFF) |

**Key BFF APIs:**
- `GET /api/v1/portfolios/{clientId}` — Client portfolio overview
- `GET /api/v1/portfolios/{clientId}/performance` — Performance analytics
- `POST /api/v1/portfolios/{clientId}/rebalance` — Rebalancing request
- `GET /api/v1/market-data/quotes` — Real-time quotes (Bloomberg proxy)

### 2.6 Data Warehouse

| Field | Value |
|-------|-------|
| Type | Data platform (ETL + analytics) |
| Technology | Apache Airflow 2.8 (orchestration), dbt 1.7 (transformations), Python 3.11 |
| Runtime | AKS (Airflow), Snowflake (compute) |
| Database | Snowflake (primary analytics store) |
| API Style | Snowflake SQL API, Airflow REST API |
| Auth | Snowflake key-pair, Entra ID workload identity |
| Integrates With | Core Banking (Kafka CDC → landing zone), Payments Gateway (Kafka events), Risk Engine (PostgreSQL extract), Regulatory Reporting (Snowflake shared views), **Acme Tech** Data Platform (cross-subsidiary data shares), Tableau (BI dashboards), Jupyter (data science notebooks) |

**Key pipelines:** Daily account snapshot, hourly transaction aggregation, weekly risk aggregation, monthly regulatory data preparation

---

## 3. Acme Retail — Omnichannel Commerce

**Maturity:** Level 3 (AI-Assisted) · **HQ:** Seattle, WA · **~7,500 employees** · **14% revenue**

Active .NET modernization (4.8 → .NET 8). Microservices architecture with event-driven inventory and fulfillment.

### 3.1 eCommerce Platform (BookStore)

| Field | Value |
|-------|-------|
| Type | Web application (monolith undergoing strangler-fig modernization) |
| Technology | .NET Framework 4.8 → .NET 8 (40% migrated), React 18 (frontend), ASP.NET MVC + Web API |
| Runtime | AKS (.NET 8 services), IIS on Azure VM (.NET 4.8 legacy modules) |
| Database | SQL Server 2019 (orders, customers, legacy product data) |
| Cache | Redis 7 (session, product cache, cart) |
| Broker | RabbitMQ 3.12 (order events, inventory sync) |
| API Style | REST (.NET 8 APIs), legacy MVC routes (.NET 4.8) |
| Auth | Entra ID B2C (customer login), Entra ID (internal staff) |
| Integrates With | Product Catalogue (REST — product search/detail), Payment Module (REST — checkout payment), Inventory Management (RabbitMQ — stock reservation), Order Fulfillment (RabbitMQ — order placed event), Loyalty Platform (REST — points accrual at checkout), Recommendation Engine (REST — personalized suggestions), Cloudinary (REST — image CDN), SendGrid (REST — order confirmation emails), Segment (JavaScript SDK — analytics), Datadog (APM + RUM) |

**Key APIs:**
- `GET /api/v2/products` — Product listing (proxies to Catalogue)
- `GET /api/v2/products/{slug}` — Product detail
- `POST /api/v2/cart` — Add to cart
- `POST /api/v2/checkout` — Initiate checkout
- `GET /api/v2/orders/{orderId}` — Order status
- `GET /api/v2/orders` — Order history

**RabbitMQ exchanges:** `retail.orders` (fanout), `retail.inventory` (topic), `retail.fulfillment` (direct)

### 3.2 Product Catalogue

| Field | Value |
|-------|-------|
| Type | API service |
| Technology | .NET 6 / ASP.NET Core Web API |
| Runtime | AKS |
| Database | Elasticsearch 8 (search index, primary product store) + Azure Blob Storage (product images) |
| Cache | Redis 7 (category tree, hot product cache) |
| API Style | REST |
| Auth | Entra ID OAuth 2.0 (service-to-service) |
| Integrates With | BookStore eCommerce (REST — product queries), Inventory Management (RabbitMQ — stock level enrichment), Algolia (REST — search fallback/A-B testing), Cloudinary (REST — image transformation URLs), Recommendation Engine (REST — product metadata for ML features) |

**Key APIs:**
- `GET /api/v1/catalogue/products` — Product search (Elasticsearch query)
- `GET /api/v1/catalogue/products/{sku}` — Product by SKU
- `GET /api/v1/catalogue/categories` — Category tree
- `PUT /api/v1/catalogue/products/{sku}` — Update product data (internal)
- `POST /api/v1/catalogue/products/bulk-import` — Bulk product import

### 3.3 Payment Module

| Field | Value |
|-------|-------|
| Type | API service (PCI-DSS Level 1 compliant) |
| Technology | .NET Framework 4.8 (modernization target → .NET 8, planned H2 2025) |
| Runtime | Azure VM (isolated PCI network segment), planned migration to AKS |
| Database | SQL Server 2019 (payment transactions, tokenized card references) |
| API Style | REST |
| Auth | Entra ID OAuth 2.0 + IP allowlist (PCI-DSS network controls) |
| Integrates With | BookStore eCommerce (REST — payment at checkout), **Acme FSI** Payments Gateway (REST — authorization, capture, refund), Stripe (REST — card tokenization, PCI proxy), POS System (REST — in-store payments), Datadog (PCI audit logging) |

**Key APIs:**
- `POST /api/v1/payments/process` — Process payment (tokenized)
- `POST /api/v1/payments/refund` — Initiate refund
- `GET /api/v1/payments/{transactionId}` — Transaction status
- `POST /api/v1/payments/reconcile` — Daily reconciliation trigger

**PCI flow:** Customer card → Stripe.js (client-side tokenization) → Payment Module (token only, never raw PAN) → FSI Payments Gateway (authorization) → Card network

### 3.4 Inventory Management

| Field | Value |
|-------|-------|
| Type | API service (event-driven microservice) |
| Technology | .NET 6 / ASP.NET Core |
| Runtime | AKS |
| Database | PostgreSQL 15 (stock levels, reservations, warehouse allocations) |
| Broker | RabbitMQ 3.12 (inventory events, stock reservation saga) |
| API Style | REST |
| Auth | Entra ID OAuth 2.0 |
| Integrates With | BookStore eCommerce (RabbitMQ — stock reservation on order), Product Catalogue (RabbitMQ — stock level updates for search enrichment), Order Fulfillment (RabbitMQ — allocation confirmation), **Acme Distribution** WMS (REST — real-time stock query, warehouse allocation), POS System (REST — in-store stock check), Datadog (stock level metrics) |

**Key APIs:**
- `GET /api/v1/inventory/{sku}/availability` — Stock check (real-time)
- `POST /api/v1/inventory/reserve` — Reserve stock for order
- `POST /api/v1/inventory/release` — Release reservation (timeout/cancel)
- `POST /api/v1/inventory/reorder` — Trigger reorder (when below threshold)

**RabbitMQ events:** `inventory.reserved`, `inventory.released`, `inventory.low-stock`, `inventory.restocked`

### 3.5 Order Fulfillment

| Field | Value |
|-------|-------|
| Type | API service (saga orchestrator) |
| Technology | .NET 6 / ASP.NET Core |
| Runtime | AKS |
| Database | PostgreSQL 15 (order state machine, fulfillment tracking) |
| Broker | RabbitMQ 3.12 (order lifecycle events) |
| API Style | REST |
| Auth | Entra ID OAuth 2.0 |
| Integrates With | BookStore eCommerce (RabbitMQ — order.placed event), Inventory Management (RabbitMQ — allocation), **Acme Distribution** WMS (REST — `POST /api/v1/fulfillment/orders` — handoff for physical fulfillment), **Acme Distribution** webhook (REST — `POST /webhook/order-status` — status callbacks: picked, packed, shipped, delivered), Payment Module (REST — capture after ship), SendGrid (REST — shipping notification emails), Datadog (order funnel metrics) |

**Key APIs:**
- `GET /api/v1/fulfillment/orders/{orderId}` — Fulfillment status
- `POST /api/v1/fulfillment/orders/{orderId}/cancel` — Cancel order
- `GET /api/v1/fulfillment/orders/{orderId}/tracking` — Tracking info

**Order state machine:** PLACED → INVENTORY_RESERVED → SENT_TO_WAREHOUSE → PICKING → PACKED → SHIPPED → DELIVERED (or CANCELLED at any pre-ship stage)

### 3.6 Loyalty Platform

| Field | Value |
|-------|-------|
| Type | API service |
| Technology | Node.js 20 / Express |
| Runtime | AKS |
| Database | MongoDB 7 (member profiles, points ledger, campaign config) |
| Cache | Redis 7 (tier cache, active campaign cache) |
| API Style | REST |
| Auth | Entra ID OAuth 2.0 |
| Integrates With | BookStore eCommerce (REST — points accrual on purchase, redemption at checkout), POS System (REST — in-store loyalty), Recommendation Engine (REST — loyalty tier for personalization weighting), SendGrid (REST — loyalty tier change emails, campaign emails), **Acme Media** (REST — content partnership promotions), Datadog (member engagement metrics) |

**Key APIs:**
- `GET /api/v1/loyalty/members/{memberId}` — Member profile + tier
- `POST /api/v1/loyalty/members/{memberId}/earn` — Accrue points
- `POST /api/v1/loyalty/members/{memberId}/redeem` — Redeem points
- `GET /api/v1/loyalty/campaigns/active` — Active campaigns

**Tiers:** Bronze (0-999 pts), Silver (1000-4999), Gold (5000-14999), Platinum (15000+)

### 3.7 Recommendation Engine

| Field | Value |
|-------|-------|
| Type | API service (ML inference) |
| Technology | Python 3.11 / FastAPI, TensorFlow Serving, scikit-learn |
| Runtime | AKS (GPU node pool for inference) |
| Database | Redis 7 (feature store — user behavior vectors, product embeddings) |
| Cache | Redis 7 (pre-computed recommendation lists, 5-min TTL) |
| API Style | REST |
| Auth | Entra ID OAuth 2.0 |
| Integrates With | BookStore eCommerce (REST — homepage and PDP recommendations), Product Catalogue (REST — product metadata for features), Loyalty Platform (REST — tier-based recommendation boosting), Segment (REST — user behavior events for feature engineering), Data Warehouse (Snowflake — model training data), MLflow (model registry), Datadog (inference latency, model accuracy) |

**Key APIs:**
- `GET /api/v1/recommendations/{userId}?context=home&limit=12` — Personalized recs
- `GET /api/v1/recommendations/{userId}?context=pdp&productId=X` — "Similar items"
- `GET /api/v1/recommendations/trending?category=X` — Trending products

**Models:** Collaborative filtering (TensorFlow, retrained nightly), Content-based (scikit-learn, product attributes), Hybrid ranker (ensemble, real-time)

### 3.8 Point of Sale (POS)

| Field | Value |
|-------|-------|
| Type | Desktop application (thick client) |
| Technology | .NET 6 / WPF |
| Runtime | Windows 10/11 POS terminals (in-store) |
| Database | SQLite (local offline cache) + SQL Server 2019 (cloud sync) |
| API Style | REST (sync to cloud services) |
| Auth | Entra ID (staff login), local PIN fallback for offline |
| Integrates With | BookStore eCommerce (REST — shared order/customer data), Inventory Management (REST — in-store stock check), Payment Module (REST — card payment processing), Loyalty Platform (REST — in-store loyalty scan), Datadog (POS health telemetry) |

**Key features:** Offline-capable (queues transactions locally, syncs when connected), barcode scanning, receipt printing, cash drawer integration

---

## 4. Acme Insurance — Legacy Insurance

**Maturity:** Level 0 (Legacy) · **HQ:** Hartford, CT · **~6,500 employees** · **18% revenue**

Mainframe-centric. COBOL core with VB6/Classic ASP frontends. SVN source control, no CI/CD. Minimal integration — mostly batch files and manual processes. Active modernization roadmap.

### 4.1 Policy Administration System (PAS)

| Field | Value |
|-------|-------|
| Type | Mainframe application (batch + CICS online) |
| Technology | COBOL 85 on IBM z/OS 2.5, Java 8 wrappers (thin REST facade, added 2022) |
| Runtime | IBM z15 mainframe (on-premises, Hartford data center) |
| Database | DB2 v12 for z/OS (primary policy store) |
| Broker | IBM MQ Series (internal mainframe messaging) |
| API Style | CICS transactions (3270 terminal), Java 8 REST facade (limited: read-only policy lookup) |
| Auth | RACF (mainframe security), basic auth for Java REST facade |
| Integrates With | Claims Engine (batch file — policy data extract, nightly), Broker Portal (ODBC — policy inquiry via SQL Server linked server to DB2), Actuarial Models (batch file — policy-level exposure data, monthly), Document Management (IBM MQ — policy document indexing), **Acme FSI** (Kafka consumer via Java wrapper — shared customer events, experimental), LexisNexis (batch SFTP — risk scoring for underwriting), State regulatory systems (ACORD XML — policy filing), Datadog (Java wrapper metrics only — mainframe itself not instrumented) |

**Key CICS transactions:** `PNEW` (new policy), `PRWL` (renewal), `PEND` (endorsement), `PQRY` (policy query), `PUWR` (underwriting decision)

**Key DB2 tables:** POLICIES, COVERAGES, PREMIUMS, ENDORSEMENTS, UNDERWRITING_DECISIONS, POLICY_HOLDERS

**Java facade APIs (limited):**
- `GET /api/v1/policies/{policyNumber}` — Policy lookup (read-only)
- `GET /api/v1/policies/{policyNumber}/coverages` — Coverage details

### 4.2 Claims Engine

| Field | Value |
|-------|-------|
| Type | Desktop application (fat client) |
| Technology | Visual Basic 6.0 SP6 |
| Runtime | Windows 10 (desktop PCs, terminal server for remote access) |
| Database | SQL Server 2012 (claims data, adjudication rules) |
| API Style | None (direct ODBC database access, manual workflows) |
| Auth | Windows domain authentication (Active Directory, not Entra ID) |
| Integrates With | PAS (batch file — policy data import, nightly at 02:00 EST), Document Management (COM automation — attach claim documents to FileNet), Actuarial Models (ODBC export — claims data for loss reserving), Broker Portal (SQL Server shared database — claim status views), Payment system (batch file — claims payment extract to bank, daily), LexisNexis (batch SFTP — fraud indicator scoring, weekly) |

**Key tables:** CLAIMS, CLAIM_LINES, ADJUDICATION_RULES, CLAIM_PAYMENTS, RESERVES, CLAIMANTS

**Known issues:** No REST API, no event system. All integration is batch/file-based or shared database. VB6 is EOL with no vendor support.

### 4.3 Actuarial Models

| Field | Value |
|-------|-------|
| Type | Analytical workbench (desktop + batch) |
| Technology | SAS 9.4, Excel VBA (2016), R scripts (experimental) |
| Runtime | SAS server (on-premises Windows Server 2016), analyst desktops |
| Database | SAS datasets (flat files), Excel workbooks, CSV exports |
| API Style | None (file-based I/O) |
| Auth | Windows domain authentication |
| Integrates With | PAS (batch file — policy exposure data, monthly), Claims Engine (ODBC — claims data extract for reserving), SQL Server 2012 (ODBC — supplementary queries), Regulatory filing (manual — actuarial report generation for state filings) |

**Key models:** Loss reserving (chain-ladder, Bornhuetter-Ferguson), pricing (GLM), risk assessment (experience rating), catastrophe modeling

### 4.4 Broker Portal

| Field | Value |
|-------|-------|
| Type | Web application |
| Technology | Classic ASP / VBScript, some JavaScript (jQuery 1.x) |
| Runtime | IIS 8.5 on Windows Server 2012 R2 |
| Database | SQL Server 2012 (broker data, commission tracking, shared views to Claims) |
| API Style | None (server-rendered HTML forms, HTTP POST) |
| Auth | Forms authentication (username/password, MD5 hashed — known security issue) |
| Integrates With | PAS (ODBC linked server to DB2 — policy inquiry), Claims Engine (shared SQL Server database — claim status), Commission system (SQL Server stored procedures — commission calculation), Document Management (HTTP link — document retrieval from FileNet web interface) |

**Known issues:** MD5 password hashing (no salt), no SSO/MFA, no HTTPS internally (HTTPS only at load balancer), session management vulnerabilities. Rewrite planned as Phase 2 of migration roadmap.

### 4.5 Document Management

| Field | Value |
|-------|-------|
| Type | Enterprise content management |
| Technology | IBM FileNet P8 5.5.4 (on-premises) |
| Runtime | WebSphere Application Server 9 on Windows Server 2016 |
| Database | DB2 v12 (FileNet metadata store) |
| API Style | FileNet Content Engine API (Java), CMIS (limited), HTTP web interface |
| Auth | LDAP (Active Directory) |
| Integrates With | PAS (IBM MQ — document indexing events), Claims Engine (COM automation — document attachment), Broker Portal (HTTP — document viewing links), Scanner stations (TWAIN — bulk document scanning and OCR) |

**Content types:** Policy documents, claims attachments, correspondence, underwriting files, regulatory filings. ~15M documents, ~8TB storage.

---

## 5. Acme Distribution — Logistics & Warehousing

**Maturity:** Level 1 (Migrated) · **HQ:** Dallas, TX · **~8,000 employees** · **15% revenue**

Recently migrated from Azure DevOps to GitHub. Mixed technology stack with legacy WMS at centre. Basic CI/CD (build + unit tests). No GHAS.

### 5.1 Warehouse Management System (WMS)

| Field | Value |
|-------|-------|
| Type | API service (monolith, WCF services) |
| Technology | .NET Framework 4.6 / WCF (Windows Communication Foundation) |
| Runtime | IIS on Windows Server 2016 (on-premises, 5 regional data centers) |
| Database | SQL Server 2016 (inventory, warehouse operations — ~50M inventory records) |
| API Style | SOAP/WCF (primary), REST facade (new, partial — under construction) |
| Auth | Windows integrated auth (WCF), API key (REST facade) |
| Integrates With | **Acme Retail** Order Fulfillment (REST — `POST /api/v1/fulfillment/orders` receive orders, webhook status callbacks), ERP Integration Layer (SOAP — SAP ECC inventory sync, goods receipt/issue), Route Optimization (REST — shipment manifests for route planning), Fleet Management (REST — truck loading assignments), IoT Tracking (REST — warehouse sensor data correlation), Driver Mobile App (REST — pick list distribution), Barcode/RF scanners (Zebra terminals — .NET Compact Framework custom app), Datadog (agent on IIS servers) |

**WCF Services:** ReceivingService, InventoryService, PickingService, PackingService, ShippingService (~15 total)

**REST facade (new):**
- `GET /api/v1/inventory/{sku}` — Stock level query
- `POST /api/v1/shipments` — Create shipment
- `GET /api/v1/shipments/{id}/status` — Shipment status

**Key tables:** LOCATIONS, INVENTORY, PICK_WAVES, PICK_LISTS, SHIPMENTS, PURCHASE_ORDERS, WAREHOUSE_ZONES

**SQL Server partitioning:** SHIPMENTS partitioned by ship date (monthly)

### 5.2 Route Optimization Service

| Field | Value |
|-------|-------|
| Type | API service (optimization engine) |
| Technology | Python 3.10 / Flask |
| Runtime | AKS (migrated to Azure post-ADO migration) |
| Database | PostgreSQL 14 (routes, constraints, delivery windows) |
| API Style | REST |
| Auth | API key |
| Integrates With | WMS (REST — shipment manifests, delivery addresses), Fleet Management (REST — available vehicles, driver hours-of-service), HERE Maps (REST — distance matrix calculation, real-time traffic), Driver Mobile App (REST — optimized route delivery), Google OR-Tools (library — Vehicle Routing Problem solver), Datadog (optimization run metrics) |

**Key APIs:**
- `POST /api/v1/routes/optimize` — Optimize next-day routes (batch, nightly)
- `POST /api/v1/routes/reoptimize` — Intraday dynamic re-optimization
- `GET /api/v1/routes/{date}/summary` — Route summary for date
- `GET /api/v1/routes/{routeId}/stops` — Ordered stop sequence

**Constraints:** Max 11-hour drive time (DOT regulation), delivery time windows, vehicle weight/capacity, refrigeration requirements

### 5.3 Fleet Management

| Field | Value |
|-------|-------|
| Type | API service |
| Technology | Java 11 / Spring Boot 2.7 |
| Runtime | AKS |
| Database | MySQL 8 (vehicle inventory, maintenance, fuel records) |
| API Style | REST |
| Auth | API key |
| Integrates With | Route Optimization (REST — vehicle availability), WMS (REST — truck loading assignments), IoT Tracking (REST — GPS position data from OBD-II dongles), Driver Mobile App (REST — driver assignment, vehicle checkout), Fuel card provider (batch file — fuel transaction import, daily), **Acme Telco** (REST — IoT SIM management for vehicle trackers), Datadog (fleet health metrics) |

**Key APIs:**
- `GET /api/v1/vehicles` — Vehicle inventory
- `GET /api/v1/vehicles/{id}/location` — Current GPS position
- `POST /api/v1/vehicles/{id}/maintenance` — Schedule maintenance
- `GET /api/v1/drivers/{id}/hours` — Hours-of-service status

**Vehicle fleet:** ~1,200 vehicles (vans, trucks, refrigerated units)

### 5.4 ERP Integration Layer

| Field | Value |
|-------|-------|
| Type | Middleware (integration adapter) |
| Technology | .NET Framework 4.6 / WCF + SOAP web services |
| Runtime | IIS on Windows Server 2016 |
| Database | None (stateless middleware, message queue for async) |
| API Style | SOAP/XML (SAP-facing), SOAP/WCF (internal-facing) |
| Auth | Basic auth (SAP RFC), Windows integrated (internal) |
| Integrates With | SAP ECC (IDoc: DESADV for ASN, WMMBXY for goods movements, DEBMAS for customer master; BAPI: BAPI_GOODSMVT_CREATE for goods receipt; connection via SAP PI middleware, RFC destinations), WMS (SOAP — inventory sync: real-time on receipt/ship + nightly batch reconciliation), Fleet Management (SOAP — cost center data), Datadog (basic IIS metrics) |

**SAP integration patterns:** IDoc (inbound/outbound), BAPI (synchronous calls), RFC (remote function calls via SAP PI)

### 5.5 IoT Tracking Platform

| Field | Value |
|-------|-------|
| Type | Event processing service (IoT ingestion) |
| Technology | Node.js 18 / Express |
| Runtime | AKS |
| Database | InfluxDB 2 (time-series: sensor readings, GPS positions — ~100M data points/day) |
| Broker | Mosquitto MQTT broker (single instance — no HA, known risk) |
| API Style | REST (query API), MQTT (device ingestion) |
| Auth | MQTT: username/password per device, REST API: API key |
| Integrates With | WMS (REST — warehouse temperature/humidity data correlation), Fleet Management (REST — GPS position feed from OBD-II dongles), Twilio (REST — temperature excursion SMS alerts), PagerDuty (REST — critical alerts), Grafana (HTTP — dashboards: warehouse overview, fleet map, temperature compliance), Datadog (infrastructure metrics) |

**MQTT topics:** `acme/warehouse/{id}/temp`, `acme/warehouse/{id}/humidity`, `acme/fleet/{vehicleId}/gps`, `acme/fleet/{vehicleId}/temp`

**Device inventory:** ~500 temperature sensors, ~200 humidity sensors, ~150 door sensors, ~1,200 GPS trackers, ~300 refrigeration monitors

**Retention:** Raw data 90 days, downsampled (1-hour averages) 2 years

### 5.6 Driver Mobile App

| Field | Value |
|-------|-------|
| Type | Mobile application |
| Technology | Xamarin (legacy — EOL approaching, .NET MAUI or React Native decision pending) |
| Runtime | Android 10+ / iOS 15+ devices |
| Database | SQLite (local — offline capable, conflict resolution for intermittent connectivity) |
| API Style | REST (sync to backend services) |
| Auth | Entra ID (driver login) |
| Integrates With | Route Optimization (REST — receive optimized route), Fleet Management (REST — vehicle checkout, hours logging), WMS (REST — pick list confirmation, proof of delivery upload), HERE Maps SDK (native — turn-by-turn navigation), Device camera (native — proof of delivery photos), Datadog (mobile RUM) |

---

## 6. Acme Telco — Telecommunications

**Maturity:** Level 2 (Secured) · **HQ:** Atlanta, GA · **~5,000 employees** · **11% revenue**

BSS/OSS split architecture. Java-dominant with C++ real-time rating. GHAS enabled, Dependabot running. Copilot licences ad-hoc.

### 6.1 Billing Mediation

| Field | Value |
|-------|-------|
| Type | Batch processor (high-volume CDR processing) |
| Technology | Java 17 / Spring Batch 5 |
| Runtime | AKS (scheduled batch + continuous file watcher) |
| Database | Oracle 19c (rated CDRs, billing data) |
| API Style | REST (admin/monitoring), file-based I/O (CDR ingestion) |
| Auth | Entra ID OAuth 2.0 |
| Integrates With | Rating & Charging Engine (REST — rated CDR submission), Network switches/elements (SFTP — raw CDR files, ASN.1 format), CRM Integration Layer (REST — subscriber plan lookup for rating), Amdocs (legacy BSS — parallel billing during wind-down, 6-9 months), Data Warehouse (Snowflake — billing analytics), Datadog (CDR processing throughput metrics) |

**Processing:** ~50M CDRs/day. Pipeline: collect → decode (ASN.1) → normalize → validate → enrich (subscriber plan) → rate → output

### 6.2 Rating & Charging Engine

| Field | Value |
|-------|-------|
| Type | API service (real-time, high-performance) |
| Technology | C++ 17 (custom engine) + Java 17 / Spring Boot 3 (management API wrapper) |
| Runtime | AKS (dedicated high-CPU node pool, no resource sharing) |
| Database | Redis 7 (in-memory: subscriber balances, rate plans, real-time counters) + PostgreSQL 15 (rated events archive, rate plan config) |
| API Style | REST (management API, rated event queries), binary protocol (internal C++ ↔ mediation for high throughput) |
| Auth | Entra ID OAuth 2.0 (REST API), mutual TLS (binary protocol) |
| Integrates With | Billing Mediation (REST + binary — CDR rating requests), CRM Integration Layer (REST — plan changes trigger rate plan reload), Self-Service Portal (REST — balance inquiry, real-time usage), Service Provisioning (REST — new subscriber rate plan activation), **Acme FSI** Payments Gateway (REST — mobile payment top-up), Datadog (rating latency, balance accuracy metrics) |

**Performance:** < 5ms per rating event, ~2,000 events/second sustained, burst to 10,000/s

**Key management APIs:**
- `GET /api/v1/subscribers/{msisdn}/balance` — Real-time balance
- `GET /api/v1/subscribers/{msisdn}/usage` — Current period usage
- `POST /api/v1/rating/rate` — Rate a CDR (batch, Java wrapper)
- `PUT /api/v1/rate-plans/{planId}` — Update rate plan

### 6.3 CRM Integration Layer

| Field | Value |
|-------|-------|
| Type | API service (facade/adapter) |
| Technology | Java 17 / Spring Boot 3 |
| Runtime | AKS |
| Database | PostgreSQL 15 (enriched subscriber profiles, CRM sync cache) |
| Cache | Redis 7 (subscriber lookup cache, 5-min TTL) |
| API Style | REST |
| Auth | Entra ID OAuth 2.0 |
| Integrates With | Salesforce CRM (REST — SOQL queries, subscriber CRUD, case management), Self-Service Portal (REST — subscriber profile, plan details), Billing Mediation (REST — subscriber plan for CDR enrichment), Rating Engine (REST — plan change notifications), Service Provisioning (REST — subscriber lifecycle events), Datadog (CRM sync health) |

**Key APIs:**
- `GET /api/v1/subscribers/{msisdn}` — Full subscriber profile (CRM + enrichment)
- `PUT /api/v1/subscribers/{msisdn}/plan` — Plan change request
- `GET /api/v1/subscribers/{msisdn}/cases` — Support case history
- `POST /api/v1/subscribers/{msisdn}/cases` — Create support case

### 6.4 Self-Service Portal

| Field | Value |
|-------|-------|
| Type | Web application (SPA + BFF) |
| Technology | Angular 16 (frontend) + Java 17 / Spring Boot 3 (BFF) |
| Runtime | AKS (BFF), Azure CDN (Angular static assets) |
| Database | PostgreSQL 15 (session data, user preferences, cached plan info) |
| API Style | REST (BFF aggregation layer) |
| Auth | Entra ID B2C (subscriber login, MFA optional) |
| Integrates With | CRM Integration Layer (REST — subscriber profile, plan management), Rating Engine (REST — real-time balance and usage), Billing Mediation (REST — invoice history), Service Provisioning (REST — SIM management, plan changes), **Acme FSI** Payments Gateway (REST — online bill payment), Datadog (RUM + APM) |

### 6.5 Network Monitoring

| Field | Value |
|-------|-------|
| Type | Platform service (observability for network infrastructure) |
| Technology | Prometheus (metrics collection) + Grafana (dashboards) + custom Java 17 collectors |
| Runtime | AKS (Prometheus/Grafana), dedicated VMs (collectors near network equipment) |
| Database | TimescaleDB (time-series: network KPIs, capacity metrics — PostgreSQL extension) |
| API Style | REST (Prometheus API, Grafana API), SNMP (network equipment polling) |
| Auth | Entra ID (Grafana SSO), service accounts (Prometheus) |
| Integrates With | Network equipment — Ericsson OSS, Huawei NMS (SNMP polling), Fault Management (REST — alarm correlation, KPI degradation events), Service Provisioning (REST — capacity data for provisioning decisions), Datadog (infrastructure metrics forwarding), PagerDuty (critical network alerts) |

**Key metrics:** Cell site availability, signal quality (RSRP/RSRQ), throughput per cell, handover success rate, core network latency

### 6.6 Service Provisioning

| Field | Value |
|-------|-------|
| Type | API service (order management / fulfillment) |
| Technology | Python 3.11 / Django |
| Runtime | AKS |
| Database | PostgreSQL 15 (provisioning orders, SIM inventory, subscriber activations) |
| API Style | REST |
| Auth | Entra ID OAuth 2.0 |
| Integrates With | CRM Integration Layer (REST — subscriber lifecycle: activate, suspend, terminate), Rating Engine (REST — rate plan activation), Self-Service Portal (REST — SIM swap, plan change requests), Network equipment (NETCONF/SSH — switch port provisioning, SIM HLR updates), **Acme Distribution** Fleet Management (REST — IoT SIM provisioning for vehicle trackers), Ericsson OSS (REST — network resource provisioning), Datadog (provisioning SLA metrics) |

**Key APIs:**
- `POST /api/v1/provisioning/activate` — New subscriber activation
- `POST /api/v1/provisioning/sim-swap` — SIM swap
- `POST /api/v1/provisioning/plan-change` — Plan change order
- `POST /api/v1/provisioning/suspend` — Suspend subscriber
- `GET /api/v1/provisioning/orders/{orderId}` — Order status

### 6.7 Fault Management

| Field | Value |
|-------|-------|
| Type | API service (event correlation engine) |
| Technology | Java 11 / Spring Boot 2.7 (upgrade to Java 17 planned) |
| Runtime | AKS |
| Database | PostgreSQL 14 (fault tickets, alarm history, correlation rules) |
| API Style | REST, SNMP trap receiver |
| Auth | Entra ID OAuth 2.0 |
| Integrates With | Network Monitoring (REST — alarm ingestion from Prometheus alerts), Network equipment (SNMP traps — direct fault events), CRM Integration Layer (REST — customer impact assessment), PagerDuty (REST — critical fault escalation), Datadog (fault ticket metrics, MTTR tracking) |

**Key APIs:**
- `GET /api/v1/faults/active` — Active fault list
- `POST /api/v1/faults/correlate` — Trigger correlation engine
- `GET /api/v1/faults/{faultId}` — Fault detail + root cause

---

## 7. Acme Media — Content & Streaming

**Maturity:** Level 2 (Secured) · **HQ:** Los Angeles, CA · **~3,500 employees** · **7% revenue**

Polyglot microservices (Go, Node.js, Java, Python, .NET). Event-driven content pipeline. GHAS enabled, early Copilot exploration.

### 7.1 Content Management System (CMS)

| Field | Value |
|-------|-------|
| Type | API service (headless CMS) |
| Technology | Node.js 20 / Express |
| Runtime | AKS |
| Database | MongoDB 7 (articles, videos, galleries, podcasts, authors, categories — flexible document schema) |
| Cache | Redis 7 (content cache, editorial search cache) |
| API Style | REST + GraphQL (flexible frontend queries) |
| Auth | Entra ID OAuth 2.0 (editorial staff), API key (public content API) |
| Integrates With | Publishing Platform (GraphQL/REST — content delivery), Content Workflow (RabbitMQ — content state events), Streaming Platform (REST — video metadata linking), Cloudinary (REST — image processing), Elasticsearch (REST — editorial search, autocomplete), Datadog (APM) |

**Key REST APIs:**
- `GET /api/v1/content/articles` — Article listing
- `GET /api/v1/content/articles/{slug}` — Article by slug
- `GET /api/v1/content/videos` — Video listing
- `GET /api/v1/content/search?q=` — Content search
- `POST /api/v1/content/articles` — Create article (editorial)
- GraphQL endpoint: `/graphql` (flexible queries for frontend)

**Content workflow states:** draft → review → approved → scheduled → published → archived

**Webhook events:** `content.published`, `content.updated`, `content.archived`

### 7.2 Streaming Platform

| Field | Value |
|-------|-------|
| Type | API service (microservices cluster) |
| Technology | Go 1.21 (5 microservices: Ingest, Transcoding, Packaging, Playback, Live) |
| Runtime | AKS (high-CPU node pool for packaging) |
| Database | PostgreSQL 15 (content catalog — ~45K titles, playback sessions, availability windows) + Redis 7 (session cache, manifest cache) |
| Cache | Redis 7 (active session cache, CDN origin shield warm cache) |
| API Style | REST |
| Auth | Entra ID OAuth 2.0 (management), JWT (player sessions — short-lived, signed by DRM service) |
| Integrates With | CMS (REST — content metadata), Content Workflow (RabbitMQ — transcode triggers), AWS MediaConvert (REST — transcoding jobs: source → multi-bitrate renditions 240p-4K), Akamai CDN (HTTP — origin pull, cache purge API), Brightcove Player SDK (JavaScript — client-side ABR, analytics), DRM Service (REST — license token issuance), Ad Platform (REST — ad break signaling for SSAI), Recommendation Engine (REST — viewing history for personalization), Datadog (streaming quality metrics: buffer ratio, startup time, bitrate switches) |

**Key APIs:**
- `POST /api/v1/playback/sessions` — Create playback session (returns manifest URL + DRM license URL)
- `GET /api/v1/playback/sessions/{id}/heartbeat` — Keep-alive
- `DELETE /api/v1/playback/sessions/{id}` — End session
- `GET /api/v1/catalog/titles` — Browse catalog
- `GET /api/v1/catalog/titles/{id}` — Title detail
- `GET /api/v1/catalog/search` — Search catalog
- `GET /api/v1/live/events` — Current and upcoming live events
- `GET /api/v1/live/events/{id}/stream` — Live manifest URL

**HLS/DASH:** Adaptive bitrate, 6 quality levels (240p to 4K), segment duration 6s (VOD) / 2s (live), target live latency < 10s

### 7.3 Ad Platform

| Field | Value |
|-------|-------|
| Type | API service (real-time ad decisioning + analytics) |
| Technology | Java 17 / Spring Boot 3 |
| Runtime | AKS |
| Database | PostgreSQL 15 (campaigns, ad inventory, targeting rules) + ClickHouse (impression/click events — ~500M events/day, columnar for fast aggregation) |
| API Style | REST, VAST/VPAID (video ad standards) |
| Auth | Entra ID OAuth 2.0 (campaign management), API key (ad serving) |
| Integrates With | Streaming Platform (REST — ad break signaling, SSAI manifest manipulation), Google Ad Manager (REST — programmatic ad decisioning, yield optimization), ClickHouse (native protocol — impression/click event ingestion), Recommendation Engine (REST — audience segment data for ad targeting), Datadog (ad serving latency, fill rate metrics) |

**Key APIs:**
- `GET /api/v1/ads/decision?content={id}&segment={id}` — Ad decision request
- `POST /api/v1/ads/impressions` — Impression tracking
- `POST /api/v1/ads/clicks` — Click tracking
- `GET /api/v1/ads/campaigns/{id}/report` — Campaign performance report

**Ad types:** Pre-roll, mid-roll, companion display, overlay

### 7.4 Content Workflow Engine

| Field | Value |
|-------|-------|
| Type | Event processor (orchestration) |
| Technology | Node.js 20 |
| Runtime | AKS |
| Database | MongoDB 7 (workflow state, job tracking) |
| Broker | RabbitMQ 3.12 (content pipeline events) |
| API Style | REST (workflow status), RabbitMQ events (primary orchestration) |
| Auth | Entra ID OAuth 2.0 |
| Integrates With | CMS (RabbitMQ — content submitted event), Streaming Platform (RabbitMQ — transcode request/complete), AWS MediaConvert (REST — transcoding job submission + webhook callback), Quality assurance team (REST — QA task assignment, approval/reject), Datadog (pipeline throughput, bottleneck detection) |

**Pipeline:** content.ingested → content.transcode-requested → content.transcoded → content.qa-assigned → content.qa-passed → content.published

### 7.5 Recommendation Engine

| Field | Value |
|-------|-------|
| Type | API service (ML inference) |
| Technology | Python 3.11 / FastAPI, PyTorch |
| Runtime | AKS (GPU node pool) |
| Database | Redis 7 (feature store — user viewing history, content embeddings) + PostgreSQL 15 (model metadata, A/B test config) |
| API Style | REST |
| Auth | Entra ID OAuth 2.0 |
| Integrates With | Streaming Platform (REST — viewing history events), CMS (REST — content metadata for feature engineering), Ad Platform (REST — audience segments for ad targeting), Publishing Platform (REST — article recommendations), Data Warehouse (Snowflake — model training data), MLflow (model registry), Datadog (inference latency, recommendation CTR) |

**Key APIs:**
- `GET /api/v1/recommendations/{userId}?context=home&limit=20` — Personalized content list
- `GET /api/v1/recommendations/{userId}?context=watch-next&currentTitle={id}` — Watch next
- `GET /api/v1/recommendations/trending` — Trending content

### 7.6 Publishing Platform

| Field | Value |
|-------|-------|
| Type | Web application (SSR/ISR) |
| Technology | Next.js 14 (React 18) |
| Runtime | AKS (Node.js server for SSR), Azure CDN (static assets) |
| Database | None (headless — all content from CMS via GraphQL/REST) |
| Cache | ISR cache (Incremental Static Regeneration), Redis 7 (session, AB test variants) |
| API Style | Consumes CMS GraphQL + REST |
| Auth | None (public editorial sites), Entra ID (preview/staging) |
| Integrates With | CMS (GraphQL — article/content delivery), Recommendation Engine (REST — personalized article suggestions), Ad Platform (JavaScript SDK — display ad rendering), Google Analytics 4 (JavaScript — page analytics), Nielsen (JavaScript — audience measurement), SendGrid (REST — newsletter delivery), Datadog (RUM) |

**Performance targets:** LCP < 2.5s, FID < 100ms, CLS < 0.1

**Sites:** 12 editorial websites sharing same CMS, site-specific config for branding/navigation

### 7.7 Digital Rights Management (DRM)

| Field | Value |
|-------|-------|
| Type | API service |
| Technology | .NET 6 / ASP.NET Core |
| Runtime | AKS |
| Database | SQL Server 2019 (content keys, licenses issued, entitlements, geographic restrictions) |
| API Style | REST |
| Auth | Entra ID OAuth 2.0 (management), JWT (license acquisition — issued by Streaming Platform) |
| Integrates With | Streaming Platform (REST — DRM license token issuance for playback sessions), Widevine (Google — license server for Android/Chrome), FairPlay (Apple — license server for iOS/Safari), PlayReady (Microsoft — license server for Windows/Edge), Content Workflow (REST — content key generation on ingest), Datadog (license issuance metrics, piracy detection) |

**DRM schemes:** Widevine (Android/Chrome), FairPlay (iOS/Safari), PlayReady (Windows/Edge) — unified API via CENC (Common Encryption, AES-128-CTR)

---

## Cross-OPCO Integration Map

### Synchronous Integrations (REST API)

| Source System | Target System | Endpoint | Purpose | Auth | SLA |
|--------------|---------------|----------|---------|------|-----|
| Retail Order Fulfillment | Distribution WMS | `POST /api/v1/fulfillment/orders` | Order handoff for physical fulfillment | Entra ID OAuth 2.0 | 99.95%, p95 < 500ms |
| Distribution WMS | Retail Order Fulfillment | `POST /webhook/order-status` | Status callback (picked/packed/shipped/delivered) | Webhook signature (HMAC-SHA256) | Best effort |
| Retail Inventory Mgmt | Distribution WMS | `GET /api/v1/inventory/availability?skus=X,Y,Z` | Real-time stock check | Entra ID OAuth 2.0 | 99.95%, p95 < 200ms |
| Retail Payment Module | FSI Payments Gateway | `POST /api/v1/payments/authorize` | Payment authorization (tokenized card) | Entra ID OAuth 2.0 + mTLS | 99.99%, p95 < 300ms |
| Retail Payment Module | FSI Payments Gateway | `POST /api/v1/payments/capture` | Payment capture after shipment | Entra ID OAuth 2.0 + mTLS | 99.99%, p95 < 300ms |
| Retail Payment Module | FSI Payments Gateway | `POST /api/v1/payments/refund` | Refund processing | Entra ID OAuth 2.0 + mTLS | 99.99%, p95 < 500ms |
| Telco Self-Service Portal | FSI Payments Gateway | `POST /api/v1/payments/authorize` | Mobile bill payment | Entra ID OAuth 2.0 | 99.95%, p95 < 500ms |
| Telco Rating Engine | FSI Payments Gateway | `POST /api/v1/payments/authorize` | Prepaid top-up payment | Entra ID OAuth 2.0 + mTLS | 99.99%, p95 < 200ms |
| Media Loyalty (via Retail) | Retail Loyalty Platform | `POST /api/v1/loyalty/members/{id}/earn` | Content partnership points | Entra ID OAuth 2.0 | 99.9%, p95 < 300ms |
| Distribution Fleet Mgmt | Telco Service Provisioning | `POST /api/v1/provisioning/activate` | IoT SIM activation for vehicle trackers | Entra ID OAuth 2.0 | 99.9%, p95 < 2s |
| All systems | Acme Tech API Gateway | `https://api.acme-corp.com/{subsidiary}/...` | All cross-subsidiary traffic | OAuth 2.0 (token validated at APIM) | 99.99% |
| All systems | Acme Tech Identity Hub | OIDC / SAML endpoints | Authentication and authorization | OIDC/SAML | 99.99% |

### Asynchronous Integrations (Event-Driven)

| Source System | Target System | Channel | Event/Message | Purpose |
|--------------|---------------|---------|---------------|---------|
| Retail eCommerce | Retail Inventory Mgmt | RabbitMQ `retail.orders` | `order.placed` | Stock reservation trigger |
| Retail Inventory Mgmt | Retail Order Fulfillment | RabbitMQ `retail.inventory` | `inventory.reserved` | Proceed with fulfillment |
| Retail Order Fulfillment | Retail Inventory Mgmt | RabbitMQ `retail.fulfillment` | `order.shipped` | Release hold, decrement stock |
| FSI Payments Gateway | FSI Core Banking | Kafka `fsi.payments.*` | Payment lifecycle events | Account debit/credit |
| FSI Core Banking | FSI Regulatory Reporting | Kafka `fsi.transactions.*` | Transaction events | Near-real-time regulatory aggregation |
| FSI Core Banking | Insurance PAS (Java wrapper) | Kafka `fsi.customers.updated` | Customer data change events | Shared customer sync (experimental) |
| Media CMS | Media Content Workflow | RabbitMQ `media.content` | `content.submitted` | Trigger ingest pipeline |
| Media Content Workflow | Media Streaming Platform | RabbitMQ `media.content` | `content.transcode-requested` | Trigger transcoding |

### Batch Integrations

| Source | Target | Schedule | Format | Purpose |
|--------|--------|----------|--------|---------|
| Insurance PAS (DB2) | Insurance Claims Engine (SQL Server) | Nightly 02:00 EST | Flat file (fixed-width) | Policy data sync |
| Insurance Claims Engine | Insurance bank | Daily 18:00 EST | Flat file (CSV) | Claims payment extract |
| Insurance PAS | Insurance Actuarial Models | Monthly 1st | SAS dataset + CSV | Policy exposure data |
| Insurance Claims Engine | Insurance Actuarial Models | Monthly 1st | CSV (ODBC extract) | Claims data for reserving |
| Distribution ERP Layer | SAP ECC | Real-time + nightly reconciliation | IDoc XML (DESADV, WMMBXY, DEBMAS) | Inventory/master data sync |
| FSI Payments Gateway | Retail Payment Module | Daily 06:00 EST | CSV | Settlement reconciliation |
| All subsidiary DBs | Acme Tech Data Platform (Snowflake) | Daily (Airflow DAGs) | Parquet/CSV via Azure Blob | Analytics ETL |

### Observability Integration (All Systems)

Every system integrates with **Acme Tech Observability Platform (Datadog)**:
- **APM:** Datadog tracing libraries in each service (Java: dd-java-agent, .NET: dd-trace-dotnet, Python: ddtrace, Node.js: dd-trace-js, Go: dd-trace-go)
- **Logs:** JSON format forwarded to Datadog (log agent or direct API)
- **Metrics:** Custom business metrics + infrastructure metrics
- **RUM:** Frontend monitoring (React, Angular, Next.js apps)
- **Correlation:** W3C Trace Context headers propagated across all cross-subsidiary REST calls via APIM

---

## System Count Summary

| Subsidiary | Bespoke Systems | Maturity | Primary Languages |
|-----------|----------------|----------|-------------------|
| Acme Tech | 6 platform services | L4 | Terraform, TypeScript, PowerShell, Python |
| Acme Financial Services | 6 applications | L3 | Java 17, Python 3.11, Node.js 20, React 18 |
| Acme Retail | 8 applications | L3 | .NET 6-8, Node.js 20, Python 3.11, React 18 |
| Acme Insurance | 5 applications | L0 | COBOL, VB6, Classic ASP, Java 8, SAS |
| Acme Distribution | 6 applications | L1 | .NET 4.6, Python 3.10, Java 11, Node.js 18, Xamarin |
| Acme Telco | 7 applications | L2 | Java 17, C++ 17, Python 3.11, Angular 16 |
| Acme Media | 7 applications | L2 | Go 1.21, Node.js 20, Java 17, Python 3.11, .NET 6, Next.js 14 |
| **Total** | **45 systems** | | |

### External / 3rd-Party Service Inventory

| Service | Type | Used By | Integration |
|---------|------|---------|-------------|
| Stripe | Payment tokenization | Retail | REST API |
| Bloomberg | Market data | FSI | REST API |
| SWIFT | Financial messaging | FSI | ISO 20022 |
| Experian / Equifax | Credit bureau | FSI | REST API |
| Refinitiv / World-Check | KYC/AML screening | FSI | REST API |
| Salesforce | CRM | Telco | REST API (SOQL) |
| Ericsson OSS | Network management | Telco | SNMP, REST |
| Huawei NMS | Network management | Telco | SNMP |
| Amdocs | Legacy BSS | Telco | Proprietary (wind-down) |
| SAP ECC | ERP | Distribution | IDoc, BAPI, RFC |
| HERE Maps | Route calculation | Distribution | REST API |
| Twilio | SMS notifications | Distribution | REST API |
| DHL / FedEx | Shipping & tracking | Distribution | REST API |
| Google OR-Tools | Route optimization | Distribution | Library (local) |
| AWS MediaConvert | Video transcoding | Media | REST API |
| Brightcove | Video player SDK | Media | JavaScript SDK |
| Google Ad Manager | Programmatic ads | Media | REST API |
| Akamai | CDN | Media | HTTP origin pull, REST API |
| Nielsen | Audience measurement | Media | JavaScript SDK |
| LexisNexis | Risk scoring | Insurance | Batch SFTP |
| IBM FileNet P8 | Document management | Insurance | Java API, CMIS |
| SendGrid | Email delivery | Retail, Media | REST API |
| Segment | Analytics | Retail | JavaScript SDK, REST API |
| Cloudinary | Image CDN | Retail, Media | REST API |
| Algolia | Search | Retail | REST API |
| Google Analytics 4 | Web analytics | Media | JavaScript SDK |
| PagerDuty | Incident management | All (via Datadog) | REST API |
| Slack | Notifications | All (via Datadog) | REST API (webhook) |
