---
title: "System Documentation Template"
---

# System Documentation Template

> **Instructions**: Copy this template into the appropriate subsidiary's `technical/` directory. Replace all placeholder text (indicated by `[brackets]`) with actual content. Remove this instruction block before publishing.

## System Overview

[Provide a concise summary of the system: what it does, who uses it, and why it exists. Include the system's name, owning team, and its role within the broader subsidiary architecture. Target 2–3 paragraphs.]

## Technology Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Language | [e.g., Java 17] | [Version] | [Any relevant notes] |
| Framework | [e.g., Spring Boot] | [Version] | |
| Database | [e.g., PostgreSQL] | [Version] | |
| Message Broker | [e.g., Apache Kafka] | [Version] | |
| Container Runtime | [e.g., Kubernetes / AKS] | [Version] | |
| CI/CD | [e.g., GitHub Actions] | — | |

## Architecture

Describe the system's high-level architecture. Include the architectural pattern (e.g., microservices, monolith, event-driven), key component interactions, and data flow. Link to any ADRs that explain significant architectural decisions.

[Architecture description in 2–4 paragraphs. Reference architecture diagrams if they exist.]

## Key Components

### [Component Name]

**Responsibility**: [What this component does]

**Technology**: [Primary technology/framework]

**Interfaces**: [How other components interact with it — APIs, events, shared database, etc.]

### [Component Name]

**Responsibility**: [What this component does]

**Technology**: [Primary technology/framework]

**Interfaces**: [How other components interact with it]

## Dependencies

| Dependency | Type | Purpose | Owner |
|---|---|---|---|
| [Service/System Name] | [Internal / External] | [Why this system depends on it] | [Owning team] |
| [Service/System Name] | [Internal / External] | [Why this system depends on it] | [Owning team] |

## Data Stores

| Store | Technology | Purpose | Sensitivity |
|---|---|---|---|
| [Database Name] | [e.g., PostgreSQL 15] | [What data it holds] | [e.g., PII, Financial, Public] |
| [Cache Name] | [e.g., Redis 7] | [What it caches] | [Sensitivity level] |

## API Surface

List the APIs this system exposes. Link to the full API contract documentation where available.

| Endpoint / Topic | Type | Purpose | Contract |
|---|---|---|---|
| [e.g., `/api/v1/accounts`] | [REST / gRPC / Event] | [Brief description] | [Link to API doc] |

## Known Issues and Technical Debt

Document known limitations, technical debt items, and planned improvements. This section helps new team members understand the system's current state honestly.

- **[Issue Title]**: [Description and impact. Link to tracking issue if applicable.]
- **[Issue Title]**: [Description and impact.]

## Development Setup

Provide step-by-step instructions for setting up a local development environment for this system.

1. [Step — e.g., "Clone the repository: `git clone ...`"]
2. [Step — e.g., "Install dependencies: `npm install`"]
3. [Step — e.g., "Start dependent services: `docker-compose up -d`"]
4. [Step — e.g., "Run the application: `./gradlew bootRun`"]
5. [Step — e.g., "Verify: `curl http://localhost:8080/health`"]

## Contact and Ownership

| Role | Team / Individual | Contact |
|---|---|---|
| Owning Team | [Team Name] | [Slack channel, email, or service desk link] |
| Tech Lead | [Name] | [Contact] |
| On-Call | [Rotation Name] | [PagerDuty link or schedule reference] |
