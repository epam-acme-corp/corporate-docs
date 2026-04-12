---
title: "Runbook Template"
---

# Runbook Template

> **Instructions**: Copy this template into the appropriate subsidiary's `operations/` directory. Replace all placeholder text with actual content. This document is intended to be used by on-call engineers during incidents — write clearly and concisely. Remove this instruction block before publishing.

## Service Information

| Field | Value |
|---|---|
| **Service Name** | [Service name as it appears in monitoring and deployment tools] |
| **Owning Team** | [Team name] |
| **Slack Channel** | [e.g., `#team-payments-oncall`] |
| **Repository** | [Link to source code repository] |
| **Dashboard** | [Link to primary monitoring dashboard] |
| **PagerDuty Service** | [Link to PagerDuty service or equivalent] |

## SLA and SLO

| Metric | Target | Measurement Window |
|---|---|---|
| Availability | [e.g., 99.95%] | [e.g., Rolling 30 days] |
| Latency (p99) | [e.g., < 500ms] | [e.g., 5-minute intervals] |
| Error Rate | [e.g., < 0.1%] | [e.g., Rolling 1 hour] |

## Health Checks

| Endpoint | Expected Response | Frequency |
|---|---|---|
| [e.g., `GET /health`] | [e.g., `200 OK` with `{"status": "healthy"}`] | [e.g., Every 30s] |
| [e.g., `GET /ready`] | [e.g., `200 OK`] | [e.g., Every 30s] |

## Common Alerts and Responses

### [Alert Name — e.g., "High Error Rate"]

**Severity**: [Critical / Warning / Info]

**Trigger Condition**: [e.g., "Error rate exceeds 5% over a 5-minute window"]

**Impact**: [What is the user-facing impact of this condition?]

**Response Steps**:

1. [Step — e.g., "Check the dashboard for the affected service: [link]"]
2. [Step — e.g., "Review recent deployments: `gh run list --repo [repo] --limit 5`"]
3. [Step — e.g., "Check dependent service health: [link to dependency dashboard]"]
4. [Step — e.g., "If caused by a bad deployment, initiate rollback (see Rollback Procedures below)"]
5. [Step — e.g., "If root cause is unclear, escalate to the owning team"]

### [Alert Name — e.g., "Database Connection Pool Exhaustion"]

**Severity**: [Critical / Warning / Info]

**Trigger Condition**: [e.g., "Active DB connections exceed 90% of pool capacity"]

**Impact**: [User-facing impact description]

**Response Steps**:

1. [Step]
2. [Step]
3. [Step]

## Escalation Path

| Level | Contact | When to Escalate |
|---|---|---|
| L1 — On-Call Engineer | [Rotation or name] | First responder for all alerts |
| L2 — Team Lead | [Name or rotation] | If L1 cannot resolve within [e.g., 30 minutes] |
| L3 — Engineering Manager | [Name] | If customer impact exceeds [threshold] or duration exceeds [e.g., 1 hour] |
| L4 — VP Engineering | [Name] | Major incident affecting multiple subsidiaries |

## Rollback Procedures

### Application Rollback

1. [Step — e.g., "Identify the last known good deployment: `gh run list --repo [repo] --status success --limit 5`"]
2. [Step — e.g., "Trigger redeployment of the previous version: [specific command or process]"]
3. [Step — e.g., "Verify the rollback: check health endpoints and monitoring dashboards"]
4. [Step — e.g., "Notify the team in Slack: `#team-[name]-oncall`"]

### Database Rollback

1. [Step — e.g., "Identify the migration to revert"]
2. [Step — e.g., "Run the rollback migration: [specific command]"]
3. [Step — e.g., "Verify data integrity"]

> ⚠️ **Warning**: Database rollbacks may cause data loss. Always consult with the database owner before executing.

## Dependencies

| Dependency | Type | Health Check | Impact if Unavailable |
|---|---|---|---|
| [Service Name] | [Internal / External] | [Health check URL or method] | [What fails if this dependency is down] |
| [Service Name] | [Internal / External] | [Health check URL or method] | [What fails if this dependency is down] |

## Contact

| Role | Name / Team | Contact Method |
|---|---|---|
| Primary On-Call | [Name or rotation] | [PagerDuty, Slack, phone] |
| Secondary On-Call | [Name or rotation] | [PagerDuty, Slack, phone] |
| Service Owner | [Team Name] | [Slack channel] |
| Database Admin | [Name or team] | [Contact method] |
