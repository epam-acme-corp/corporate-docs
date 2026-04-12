---
title: "Acme Corporation Documentation Standards"
last-updated: "2025-06-15"
owner: "Acme Tech — Documentation & Knowledge Management"
status: "Active"
---

# Acme Corporation Documentation Standards

## Purpose

This document defines the documentation standards for Acme Corporation's internal knowledge base. These standards ensure that documentation across all seven subsidiaries is consistent, discoverable, and maintainable. They apply to every contributor — whether you are writing a business process overview for Acme Insurance, an API contract for Acme Financial Services, or a runbook for Acme Tech's shared platform.

Well-structured documentation reduces onboarding time for new employees, supports cross-subsidiary collaboration, and enables automated retrieval systems to surface relevant information quickly and accurately.

## Audience

These standards are intended for:

- **Documentation authors** across all subsidiaries who create and maintain knowledge base content.
- **Reviewers** who evaluate contributions during the pull-request review process.
- **Engineering teams** building tooling that indexes, searches, or processes documentation from this repository.
- **Leadership and governance stakeholders** who rely on documentation for operational visibility and compliance evidence.

## Documentation Categories

All content in the knowledge base falls into one of seven standardized categories. Each subsidiary directory contains subdirectories corresponding to these categories, ensuring a consistent structure across the organization.

### Business Documentation

Business documentation captures domain knowledge, processes, and organizational context. This includes business process definitions, stakeholder and persona descriptions, regulatory context, and domain-specific business rules.

**Quality expectations**: Business documentation should be written for a knowledgeable reader who may not be an expert in the specific domain. Define industry-specific terms on first use or link to the glossary. Include process flow descriptions in prose rather than relying solely on diagrams.

### Technical Documentation

Technical documentation covers system-level details for development teams. This includes service descriptions, technology stack inventories, development environment setup guides, and coding conventions specific to a subsidiary or system.

**Quality expectations**: Technical documentation should enable a new team member to understand a system's purpose, structure, and development workflow within a single reading session. Include concrete examples — configuration snippets, CLI commands, and sample requests — rather than abstract descriptions.

### Architecture Documentation

Architecture documentation records significant design decisions and the structural patterns that shape each subsidiary's systems. The primary artifact is the Architecture Decision Record (ADR), which captures the context, decision, and consequences of each architectural choice.

**Quality expectations**: Every ADR must include the full decision context — what problem was being solved, what constraints applied, and what alternatives were considered. Architecture overviews should describe the system at a level of abstraction appropriate for a cross-functional audience, including both engineering and product stakeholders.

### Data Documentation

Data documentation describes data models, schemas, data flow patterns, and data governance policies. This includes entity-relationship descriptions, data dictionaries, ETL pipeline documentation, and data quality standards.

**Quality expectations**: Data documentation should clearly define every field, entity, and relationship. Use tables for field-level definitions. Document data lineage — where data originates, how it flows through systems, and where it is consumed.

### API & Integration Documentation

API documentation describes the contracts between systems, both internal and external. This includes REST API specifications, event schemas, integration patterns, and third-party API usage guides.

**Quality expectations**: API documentation must include concrete request and response examples. Document authentication requirements, error codes, rate limits, and versioning policies. Every endpoint should have at least one complete example showing a request and its expected response.

### Security & Compliance Documentation

Security documentation covers access control policies, compliance frameworks, vulnerability management procedures, and audit requirements. This category is particularly important for regulated subsidiaries such as Acme Financial Services and Acme Insurance.

**Quality expectations**: Security documentation must be precise and unambiguous. Reference specific compliance frameworks (e.g., SOX, PCI-DSS, GDPR) where applicable. Document access control models with explicit role definitions and permission matrices. Flag any content that is restricted to specific audiences.

### Operations Documentation

Operations documentation includes runbooks, incident response procedures, SLA/SLO definitions, monitoring and alerting configurations, and deployment procedures. This is the category most frequently accessed during incidents and on-call rotations.

**Quality expectations**: Operations documentation must be actionable under pressure. Write runbooks as step-by-step procedures that an on-call engineer can follow at 3:00 AM without prior context. Include health check URLs, escalation paths, and rollback procedures. Test runbook steps periodically to ensure accuracy.

## Quality Standards

All documentation in the knowledge base must meet these baseline quality standards regardless of category.

### Completeness

Every document should be self-contained for its declared topic. A reader should not need to consult external sources to understand the core content. Where dependencies on other documents exist, provide explicit cross-references using relative links.

### Accuracy

Documentation must reflect the current state of the systems and processes it describes. Outdated documentation is worse than no documentation — it erodes trust in the knowledge base. Authors are responsible for keeping their documents current, and the review process includes a freshness check.

### Clarity

Write for your audience. Use plain language where possible. Define abbreviations and domain-specific terms on first use, or link to the appropriate glossary entry. Avoid jargon that is specific to a single team when the document's audience is broader.

### Consistency

Follow the formatting conventions defined in [CONTRIBUTING.md](../../CONTRIBUTING.md) and in this document. Consistent structure enables readers to build mental models that transfer across documents and subsidiaries.

## Review Process

All documentation contributions follow a pull-request workflow with mandatory review.

### Authoring and Submission

1. Create a branch from `main` following the naming convention: `docs/<subsidiary>/<brief-description>`.
2. Author your document using the appropriate template from `corporate/governance/templates/`.
3. Ensure your document includes complete YAML frontmatter with title, last-updated, owner, and status fields.
4. Open a pull request with a descriptive title and a summary of what is being added or changed.

### Review Requirements

Every pull request requires approval from two parties:

- **Domain owner**: A designated reviewer from the subsidiary or team that owns the content area. Domain owners verify factual accuracy, completeness, and alignment with current processes and systems.
- **Acme Tech Documentation team**: A member of the central documentation team reviews for adherence to these standards, structural consistency, cross-referencing accuracy, and overall quality.

### Review Criteria

Reviewers evaluate contributions against the following criteria:

- Adherence to formatting and structural conventions
- Completeness of frontmatter metadata
- Factual accuracy and currency of content
- Appropriate use of cross-references and glossary links
- Clarity and readability for the intended audience
- Absence of sensitive or restricted information in publicly accessible sections

### Merging

Once both approvals are obtained, the author merges the pull request using a squash merge. The squash commit message should concisely describe the documentation change.

## Versioning

This knowledge base uses Git history as its versioning mechanism. There is no separate version numbering scheme for individual documents. The `last-updated` field in each document's frontmatter indicates when the content was last substantively revised.

For documents that undergo significant revisions, include a brief changelog section at the bottom of the file noting major changes and their dates. This is optional for minor updates but recommended for documents that serve as authoritative references (e.g., governance policies, architecture standards).

## File and Directory Naming Conventions

All files and directories use **kebab-case** naming:

- Files: `claims-adjudication-process.md`, `adr-001-event-sourcing.md`
- Directories: `acme-financial-services/`, `architecture/`, `business/`

File names should be descriptive and specific. Avoid generic names like `overview.md` at the subsidiary level — prefer `claims-processing-overview.md` or `payment-gateway-overview.md`. The exception is `overview.md` at the corporate level, where it serves as the master corporate overview.

## Metadata Frontmatter

Every document must include a YAML frontmatter block as the first content in the file:

```yaml
---
title: "Human-Readable Document Title"
last-updated: "YYYY-MM-DD"
owner: "Team Name — Sub-team (if applicable)"
status: "Draft | Active | Deprecated"
---
```

### Field Definitions

- **title**: The document's display title. Must match the H1 heading in the document body.
- **last-updated**: The date of the most recent substantive update. Update this field whenever you modify the document's content (not for formatting-only changes).
- **owner**: The team responsible for the document's accuracy and maintenance. Use the format "Subsidiary — Team" (e.g., "Acme Insurance — Claims Engineering").
- **status**: The document's lifecycle state:
  - `Draft` — Under development. Not yet reviewed or approved for general use.
  - `Active` — Reviewed, approved, and considered authoritative.
  - `Deprecated` — No longer current. The document body should include a notice directing readers to the replacement.

## RAG Optimization Guidelines

This knowledge base is indexed by retrieval-augmented generation (RAG) systems that surface relevant documentation in response to natural-language queries. The following guidelines ensure that documents are optimized for automated retrieval without compromising human readability.

### Clear and Descriptive Headings

Use headings that accurately describe the content of each section. A heading should make sense when read in isolation — it may appear as a search result or context snippet without the surrounding document. Prefer "Authentication Flow for Mobile Clients" over "How It Works."

### Self-Contained Sections

Each H2 section should be understandable on its own to the greatest extent possible. While cross-references to other documents are encouraged, avoid writing sections that are meaningless without reading the preceding section. RAG systems may retrieve individual sections rather than entire documents.

### Target Word Counts

- **Individual files**: 500–3,000 words. This range balances depth with focus.
- **Individual H2 sections**: 150–800 words. Sections shorter than 150 words may lack enough context for retrieval; sections longer than 800 words may dilute relevance.

### Keyword Density

Naturally incorporate relevant terminology — including both full terms and common abbreviations — throughout the document. Do not artificially stuff keywords, but ensure that the terms a searcher would use appear in the text. For example, a document about claims processing should include both "claims adjudication" and "claims processing" if both terms are used in practice.

### Structured Data

Use tables, definition lists, and structured formats where they improve clarity. Structured data is more reliably extracted by automated systems than equivalent information buried in prose paragraphs.

## Related Resources

- [Contributing Guide](../../CONTRIBUTING.md) — Practical contribution workflow and formatting reference
- [Business Glossary](../glossary/business-glossary.md) — Industry-specific terminology
- [Technology Glossary](../glossary/technology-glossary.md) — Shared technology terms
- [Templates](templates/) — Standard templates for each documentation category
