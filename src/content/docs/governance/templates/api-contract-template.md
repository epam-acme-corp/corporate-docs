---
title: "API Contract Template"
---

# API Contract Template

> **Instructions**: Copy this template into the appropriate subsidiary's `api/` directory. Replace all placeholder text with actual content. Remove this instruction block before publishing.

## API Overview

[Describe what this API does, who its intended consumers are, and what business capability it supports. Include the owning team and service name. Target 1–2 paragraphs.]

## Base URL

| Environment | Base URL |
|---|---|
| Production | `https://api.acme.com/[service]/v1` |
| Staging | `https://api-staging.acme.com/[service]/v1` |
| Development | `https://api-dev.acme.com/[service]/v1` |

## Authentication

[Describe the authentication mechanism. At Acme Corp, most internal APIs use OAuth 2.0 with tokens issued by Entra ID.]

All requests must include a valid Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

**Required Scopes**: [List the OAuth scopes required to access this API, e.g., `api://[service]/.default`]

## Endpoints

### [HTTP Method] [Path]

**Description**: [What this endpoint does]

**Request**:

```http
[METHOD] /[path] HTTP/1.1
Host: api.acme.com
Authorization: Bearer <token>
Content-Type: application/json

{
  "[field]": "[value]",
  "[field]": "[value]"
}
```

**Response** (`200 OK`):

```json
{
  "[field]": "[value]",
  "[field]": "[value]"
}
```

**Error Responses**:

| Status Code | Description |
|---|---|
| `400` | [Description of bad request scenario] |
| `401` | Unauthorized — missing or invalid Bearer token |
| `403` | Forbidden — valid token but insufficient permissions |
| `404` | [Resource type] not found |
| `500` | Internal server error |

## Error Codes

All error responses follow a standard envelope:

```json
{
  "error": {
    "code": "[ERROR_CODE]",
    "message": "[Human-readable error description]",
    "traceId": "[Correlation ID for troubleshooting]"
  }
}
```

| Error Code | HTTP Status | Description |
|---|---|---|
| `[ERROR_CODE]` | `[Status]` | [Description] |
| `[ERROR_CODE]` | `[Status]` | [Description] |

## Rate Limits

| Tier | Limit | Window |
|---|---|---|
| Standard | [e.g., 100 requests] | [e.g., per minute] |
| Elevated | [e.g., 1,000 requests] | [e.g., per minute] |

Rate limit headers are included in every response:

```
X-RateLimit-Limit: [max requests]
X-RateLimit-Remaining: [remaining requests]
X-RateLimit-Reset: [UTC epoch timestamp]
```

## Versioning

This API follows URL-based versioning. The major version is included in the URL path (e.g., `/v1/`, `/v2/`). Minor and patch changes are backward-compatible and do not result in a new version prefix.

**Deprecation Policy**: When a new major version is released, the previous version remains available for at least 6 months. Deprecation notices are communicated via the `Sunset` response header and through internal communication channels.

## Changelog

| Date | Version | Change |
|---|---|---|
| [YYYY-MM-DD] | [e.g., v1.0] | [Description of change] |
| [YYYY-MM-DD] | [e.g., v1.1] | [Description of change] |
