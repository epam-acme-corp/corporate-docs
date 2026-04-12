---
title: "Retail — Distribution Integration Contract"
description: "Integration contract between Acme Retail and Acme Distribution"
---

<!-- title: Retail — Distribution Integration Contract | last-updated: 2025-03-15 | owner: Acme Tech — Integration Engineering | status: current -->

# Retail — Distribution Integration Contract

## Overview

This document specifies the API contract between Acme Retail and Acme Distribution for order fulfillment operations. This is Acme Corp's highest-volume cross-subsidiary integration, processing approximately 50,000 orders per day through three primary integration points: order handoff, status webhooks, and inventory availability checks.

All traffic routes through Azure APIM. Authentication uses OAuth 2.0 bearer tokens issued by Microsoft Entra ID. For the overall contract catalog and governance rules, see [Cross-Subsidiary API Contracts](./cross-subsidiary-contracts.md).

## Order Handoff — `POST /api/v1/fulfillment/orders`

**Direction:** Retail → Distribution

**Purpose:** Retail submits a new order for fulfillment by Distribution's warehouse operations. This is the entry point for the order fulfillment saga.

### Request Payload

```json
{
  "orderId": "ORD-2024-001234",
  "customerId": "CUST-789012",
  "items": [
    {
      "sku": "ISBN-978-0-13-468599-1",
      "title": "The Pragmatic Programmer",
      "quantity": 2,
      "unitPrice": 49.99
    }
  ],
  "shippingAddress": {
    "name": "Jane Smith",
    "line1": "123 Main Street",
    "city": "Austin",
    "state": "TX",
    "postalCode": "78701",
    "country": "US"
  },
  "priority": "standard",
  "requestedDeliveryDate": "2024-02-15"
}
```

### Response Payload (201 Created)

```json
{
  "fulfillmentId": "FUL-2024-005678",
  "orderId": "ORD-2024-001234",
  "status": "accepted",
  "estimatedShipDate": "2024-02-12",
  "estimatedDeliveryDate": "2024-02-15",
  "warehouseId": "WH-AUSTIN-01"
}
```

### Error Responses

| HTTP Status | Error Code | Description |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid request payload (missing required fields, invalid format) |
| 409 | `DUPLICATE_ORDER` | Order with the same `orderId` already exists (idempotency check) |
| 422 | `ITEM_UNAVAILABLE` | One or more items cannot be fulfilled (insufficient stock) |
| 503 | `WAREHOUSE_UNAVAILABLE` | Distribution warehouse system temporarily unavailable |

### Idempotency

The `orderId` field serves as the idempotency key. Submitting the same `orderId` twice returns the existing fulfillment record (200 OK) rather than creating a duplicate. This enables safe retries.

## Status Webhook — `POST /webhook/order-status`

**Direction:** Distribution → Retail

**Purpose:** Distribution notifies Retail of fulfillment status changes asynchronously. Retail registers a webhook endpoint that Distribution calls whenever an order's fulfillment status changes.

### Webhook Payload

```json
{
  "fulfillmentId": "FUL-2024-005678",
  "orderId": "ORD-2024-001234",
  "status": "shipped",
  "trackingNumber": "1Z999AA10123456784",
  "carrier": "UPS",
  "updatedAt": "2024-02-12T14:30:00Z"
}
```

### Status Lifecycle

Orders progress through the following statuses:

`accepted` → `picking` → `packed` → `shipped` → `delivered`

Exception statuses: `cancelled`, `on_hold`, `returned`

### Webhook Delivery Guarantees

- **Delivery semantics:** At-least-once. Retail must handle duplicate webhook deliveries idempotently.
- **Signature validation:** Each webhook request includes an `X-Webhook-Signature` header containing an HMAC-SHA256 signature computed over the request body using a shared secret. Retail must validate this signature before processing.
- **Response requirement:** Retail must respond with HTTP 200 within 5 seconds. Any other response or timeout triggers a retry.
- **Retry policy:** 3 retries with exponential backoff — 10 seconds, 60 seconds, 300 seconds. After all retries are exhausted, the failed delivery is logged and an alert is sent to Distribution's operations team for manual intervention.

## Inventory Availability — `GET /api/v1/inventory/availability`

**Direction:** Retail → Distribution

**Purpose:** Real-time stock availability check before order placement. Used by the BookStore frontend to display availability status and by the order service to validate stock before submitting a fulfillment order.

### Request

```
GET /api/v1/inventory/availability?skus=ISBN-978-0-13-468599-1,ISBN-978-0-596-51774-8
```

Maximum 50 SKUs per request.

### Response Payload (200 OK)

```json
{
  "items": [
    {
      "sku": "ISBN-978-0-13-468599-1",
      "available": true,
      "quantity": 145,
      "warehouseId": "WH-AUSTIN-01"
    },
    {
      "sku": "ISBN-978-0-596-51774-8",
      "available": false,
      "quantity": 0,
      "nextRestockDate": "2024-02-20"
    }
  ]
}
```

### Caching

APIM caches inventory availability responses for 60 seconds. This reduces load on Distribution's SAP WMS while maintaining acceptable freshness for the BookStore frontend. Cache is keyed on the sorted SKU list.

## Service-Level Agreement

| Metric | Target |
|---|---|
| Availability | 99.95% (measured monthly) |
| Latency — Order handoff (p95) | < 500ms |
| Latency — Inventory check (p95) | < 200ms |
| Throughput — Orders | Up to 500 orders/minute sustained, 1,000/minute burst |
| Throughput — Inventory checks | Up to 2,000 requests/minute |

## Retry and Resilience Policy

- **Order handoff** is idempotent (`orderId` as idempotency key). Consumers retry with exponential backoff: 1 second, 5 seconds, 30 seconds, then alert to operations.
- **Inventory availability** is a safe read operation. Consumers retry immediately up to 3 times, then serve cached data or display "availability unknown" to the user.
- **Circuit breaker:** If Distribution returns 5xx errors for more than 30 consecutive seconds, Retail's circuit breaker opens. Orders are queued for delayed processing. Inventory checks fall back to cached data. The circuit breaker attempts a half-open probe every 60 seconds.

## Authentication

OAuth 2.0 bearer tokens issued by Microsoft Entra ID. Retail uses a registered service principal with the following scopes:

- `fulfillment.orders.write` — Required for order handoff
- `fulfillment.orders.read` — Required for order status queries
- `inventory.read` — Required for inventory availability checks

Tokens are obtained via the `client_credentials` grant and cached for their lifetime (typically 1 hour). Token refresh is handled automatically by the MSAL library.

## Related Documentation

- [Cross-Subsidiary API Contracts](./cross-subsidiary-contracts.md) — Full contract catalog
- [Retail ↔ FSI Integration](./retail-fsi-integration.md) — Payment processing contract
- [Acme Retail Order Fulfillment](../../acme-retail/technical/order-fulfillment.md) — Retail-side order processing
- [Acme Retail API Overview](../../acme-retail/api/overview.md) — Retail API catalog
- [Acme Distribution Architecture](../../acme-distribution/architecture/overview.md) — Distribution system architecture
- [Integration Patterns — Saga](../architecture/integration-patterns.md#saga-pattern) — Saga pattern documentation
