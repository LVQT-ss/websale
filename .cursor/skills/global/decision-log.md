# Decision Log

## Purpose
Document non-trivial technical decisions so future agents/devs understand WHY choices were made.

## When to Use
- More than one valid approach exists
- The choice affects architecture, data model, or DX
- You're choosing between libraries/tools
- A trade-off is involved (perf vs simplicity, etc.)

## File Location
`DECISIONS.md` in project root. Create from `global/templates/DECISIONS.md.template` if missing.

## Format
```markdown
## DEC-XXX: [Short Title]
**Date:** YYYY-MM-DD
**Status:** Accepted | Superseded by DEC-YYY
**Context:** [Why this decision is needed — 1-2 sentences]

### Options
**A) [Option Name]**
- Pros: [list]
- Cons: [list]
- Edge Cases: [list]

**B) [Option Name]**
- Pros: [list]
- Cons: [list]
- Edge Cases: [list]

### Decision
Option [X] — [one sentence reasoning]

### Implementation Notes
- [any specifics for implementing the chosen option]
```

## Steps
1. Identify the decision point
2. List at least 2 options (ideally 3)
3. For each: write Pros, Cons, Edge Cases
4. Choose one with clear reasoning
5. Append to `DECISIONS.md` with next DEC number
6. Reference DEC-XXX in code comments where relevant

## Verify
- Decision is numbered sequentially
- At least 2 options listed
- Reasoning is clear and specific (not "it's better")
- Implementation notes are actionable

## NEVER
- Make architectural decisions without documenting them
- Write "Option A is better" without explaining why
- Delete or edit past decisions (mark as Superseded instead)
- Skip edge case analysis
