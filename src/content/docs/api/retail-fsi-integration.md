---
title: "Retail — Financial Services Payment Integration Contract"
description: "Integration contract between Acme Retail and Acme Financial Services"
---

<!-- title: Retail — Financial Services Integration Contract | last-updated: 2025-03-15 | owner: Acme Tech — Integration Engineering | status: current -->

# Retail — Financial Services Payment Integration Contract

## Overview

This document specifies the API contract between Acme Retail and Acme Financial Services for payment processing. This is Acme Corp's most compliance-sensitive cross-subsidiary integration, subject to PCI-DSS v4.0 requirements. The integration handles payment authorization, capture, and refund operations for all Retail transactions.

All traffic routes through Azure APIM with mutual TLS (mTLS) enforcement. For the overall contract catalog, see [Cross-Subsidiary API Contracts](./cross-subsidiary-contracts.md).

## Payment Authorization — `POST /api/v1/payments/authorize`

**Direction:** Retail → Financial Services

**Purpose:** Authorize a payment amount against the customer's payment method before order confirmation. Authorization places a hold on the funds without capturing them.

### Request Payload

```json
{
  "merchantId": "ACME-RETAIL-001",
  "orderId": "ORD-2024-001234",
  "amount": 99.98,
  "currency": "USD",
  "paymentMethod": {
    "type": "card",
    "token": "tok_visa_4242_xxxx"
  },
  "billingAddress": {
    "postalCode": "78701",
    "country": "US"
  }
}
```

### Response Payload (200 OK)

```json
{
  "authorizationId": "AUTH-2024-789012",
  "status": "authorized",
  "amount": 99.98,
  "currency": "USD",
  "expiresAt": "2024-02-19T14:30:00Z"
}
```

Authorization holds expire after 7 days if not captured.

## Payment Capture — `POST /api/v1/payments/capture`

**Direction:** Retail → Financial Services

**Purpose:** Capture a previously authorized payment. Triggered when Distribution confirms the order has shipped. Supports partial capture for split shipments.

### Request Payload

```json
{
  "authorizationId": "AUTH-2024-789012",
  "amount": 99.98,
  "currency": "USD"
}
```

### Response Payload (200 OK)

```json
{
  "captureId": "CAP-2024-345678",
  "authorizationId": "AUTH-2024-789012",
  "amount": 99.98,
  "currency": "USD",
  "status": "captured",
  "settledAt": null
}
```

Capture operations are idempotent — submitting the same `authorizationId` and `amount` twice returns the existing capture record.

## Refund — `POST /api/v1/payments/refund`

**Direction:** Retail → Financial Services

**Purpose:** Issue a full or partial refund against a captured payment. Triggered by customer service actions or automated return processing.

### Request Payload

```json
{
  "captureId": "CAP-2024-345678",
  "amount": 49.99,
  "currency": "USD",
  "reason": "item_returned"
}
```

### Response Payload (200 OK)

```json
{
  "refundId": "REF-2024-567890",
  "captureId": "CAP-2024-345678",
  "amount": 49.99,
  "currency": "USD",
  "status": "refund_initiated"
}
```

Refund operations are idempotent — duplicate submissions return the existing refund record.

## PCI-DSS Scoping

The payment integration is architected to minimize PCI-DSS scope for Acme Retail:

1. **Retail never handles raw card data.** Card details are tokenized client-side via Stripe Elements embedded in the BookStore frontend. The browser communicates directly with Stripe's PCI-DSS Level 1 certified infrastructure.
2. **Tokenized card references** (`tok_*` tokens) are passed from Retail to Financial Services' Payments Gateway. Tokens are opaque strings with no extractable card data.
3. **Financial Services' Payments Gateway** (PCI-DSS Level 1 certified) detokenizes and processes the actual card transaction via acquirer integrations (Stripe Connect).
4. **Retail's PCI-DSS scope** is limited to SAQ A-EP (e-commerce merchants that partially outsource payment processing). This scope covers: secure hosting of the payment page, TLS configuration, and logging controls.

See [Acme Retail PCI-DSS Compliance](../../acme-retail/security/pci-dss-compliance.md) and [Acme FSI Payments Gateway](../../acme-financial-services/technical/payments-gateway.md) for subsidiary-specific compliance documentation.

## Settlement Reconciliation

Financial Services generates a daily settlement file for Retail:

- **Schedule:** Generated at 02:00 UTC, available by 03:00 UTC.
- **Format:** CSV with columns: `captureId`, `orderId`, `amount`, `currency`, `status`, `settledAt`.
- **Delivery:** Azure Blob Storage, `retail-settlements` container. File naming: `settlement-YYYY-MM-DD.csv`.
- **Consumer:** Retail's Finance module processes the file during the morning batch window (06:00–07:00 UTC) to reconcile captured payments against order records.
- **Retention:** Settlement files retained for 7 years per SOX compliance requirements.

## Error Codes

| Error Code | HTTP Status | Description | Retryable |
|---|---|---|---|
| `INSUFFICIENT_FUNDS` | 402 | Customer's account has insufficient funds | No |
| `CARD_DECLINED` | 402 | Card issuer declined the transaction | No |
| `FRAUD_SUSPECTED` | 403 | Transaction flagged by fraud detection | No |
| `EXPIRED_CARD` | 422 | Payment token references an expired card | No |
| `PROCESSING_ERROR` | 500 | Internal processing error at FSI | Yes (capture/refund only) |
| `AMOUNT_MISMATCH` | 422 | Capture/refund amount exceeds authorized/captured amount | No |

## Service-Level Agreement

| Metric | Target |
|---|---|
| Availability | 99.99% (measured monthly) |
| Latency — Authorization (p95) | < 300ms |
| Latency — Capture (p95) | < 200ms |
| Latency — Refund (p95) | < 200ms |

## Retry and Circuit Breaker Policy

- **Authorization is NOT retryable** — Retrying a failed authorization risks double-charging the customer. If authorization fails with a 5xx error, the order flow halts and the customer is asked to retry.
- **Capture and refund are idempotent** and safe to retry. Retry policy: 1 second, 5 seconds, 30 seconds, then alert.
- **Circuit breaker** — If the FSI Payment Gateway returns 5xx errors for more than 30 consecutive seconds, Retail's circuit breaker opens. New orders are queued for delayed payment processing. The circuit breaker probes every 60 seconds with a health check request.

## Authentication

- **OAuth 2.0** — Retail's service principal authenticates via the `client_credentials` grant with Entra ID. Required scopes: `payments.authorize`, `payments.capture`, `payments.refund`.
- **Mutual TLS (mTLS)** — Required for all payment API traffic due to PCI-DSS network segmentation requirements. Retail's client certificate is issued by Acme Tech's internal CA and registered in APIM.
- **No client secrets** — Service principal uses certificate-based credentials. Certificates are stored in Azure Key Vault and rotated every 12 months.

## Related Documentation

- [Cross-Subsidiary API Contracts](./cross-subsidiary-contracts.md) — Full contract catalog
- [Retail ↔ Distribution Integration](./retail-distribution-integration.md) — Order fulfillment contract
- [Acme Retail Payment Module](../../acme-retail/technical/payment-module.md) — Retail-side payment processing
- [Acme Retail PCI-DSS Compliance](../../acme-retail/security/pci-dss-compliance.md) — Retail PCI compliance
- [Acme FSI Payments Gateway](../../acme-financial-services/technical/payments-gateway.md) — FSI payment processing
- [Acme FSI Compliance Framework](../../acme-financial-services/security/compliance-framework.md) — FSI regulatory compliance
