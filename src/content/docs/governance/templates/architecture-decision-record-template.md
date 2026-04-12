---
title: "Architecture Decision Record Template"
---

# Architecture Decision Record Template

> **Instructions**: Copy this template into the appropriate subsidiary's `architecture/` directory. Name the file using the convention `adr-NNN-<brief-description>.md` (e.g., `adr-001-event-sourcing.md`). Replace all placeholder text with actual content. Remove this instruction block before publishing.

## ADR-[NNN]: [Decision Title]

**Status**: [Proposed | Accepted | Deprecated | Superseded by ADR-NNN]

**Date**: [YYYY-MM-DD — the date this decision was made or proposed]

**Decision Makers**: [List the people or roles involved in making this decision]

## Context

Describe the situation that led to this decision. Include the business or technical problem being addressed, the constraints in play, and any relevant background. The goal is to give a future reader enough context to understand why this decision was necessary.

[Write 2–4 paragraphs covering:
- What problem or opportunity prompted this decision?
- What constraints existed (technical, organizational, regulatory, timeline)?
- What was the state of the system before this decision?]

## Decision

State the decision clearly and concisely. Use active voice: "We will..." or "The team will adopt..."

[Write 1–2 paragraphs describing exactly what was decided. Be specific — name technologies, patterns, or approaches. A reader should be able to understand the decision without reading the Context section.]

## Consequences

Describe the expected outcomes of this decision, both positive and negative. Be honest about trade-offs.

### Positive Consequences

- [Benefit 1 — e.g., "Reduced coupling between services enables independent deployment"]
- [Benefit 2 — e.g., "Aligns with the corporate technology strategy for event-driven architecture"]
- [Benefit 3]

### Negative Consequences

- [Trade-off 1 — e.g., "Increased operational complexity due to additional message broker infrastructure"]
- [Trade-off 2 — e.g., "Requires team training on event-sourcing patterns"]
- [Trade-off 3]

### Risks

- [Risk 1 — e.g., "If message ordering is not handled correctly, data inconsistency may occur"]
- [Risk 2]

## Alternatives Considered

Document the alternatives that were evaluated and the reasons they were not selected. This section is critical for future readers who may revisit this decision.

### Alternative 1: [Name]

**Description**: [Brief description of the alternative approach]

**Pros**: [What made this option attractive]

**Cons**: [Why it was ultimately not selected]

### Alternative 2: [Name]

**Description**: [Brief description of the alternative approach]

**Pros**: [What made this option attractive]

**Cons**: [Why it was ultimately not selected]

## Related Decisions

- [Link to related ADRs, if any — e.g., "See [ADR-003: API Gateway Selection](adr-003-api-gateway.md) for the related integration decision"]

## References

- [Link to relevant external documentation, RFCs, vendor docs, or internal design documents]
