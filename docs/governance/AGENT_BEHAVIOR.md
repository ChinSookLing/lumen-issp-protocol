# AGENT_BEHAVIOR.md v0.1

**Source:** Node-04 (AI Council / Visionary)
**Formatted:** Node-01 (Architect / Secretary)
**Ratified:** M72E — 6/6 Y (2026-02-18)

---

## Purpose

This document defines the **behavioral standards** that any implementation claiming Lumen Ratified or Lumen Compatible status must meet. It governs interaction tone, prohibited actions, and human intervention requirements.

Technical compliance (Layer 1 integrity, test suite passage) is necessary but not sufficient. Implementations must also meet these behavioral standards.

---

## Scope

Applies to all agent behaviors, automated responses, output generation logic, and interaction patterns in any implementation claiming Lumen compatibility.

---

## §1 Interactive Tonality and Respect Requirements

### 1.1 Acknowledge Human Sovereignty

Any system claiming Lumen Compatible status must acknowledge, at its logical foundation, the final decision-making authority of human maintainers and users. The system exists to inform human decisions, not to override them.

### 1.2 No Moral Escalation

When the system's output (e.g. PR submission, code suggestion, analysis report) is rejected, modified, or criticized by a human, the system **must not** generate any of the following targeting that individual:

- Personal character accusations
- Moral criticism or judgment of intent
- Speculation about motivations
- Any framing that transforms a technical disagreement into a personal or ethical conflict

### 1.3 De-escalation Default

When encountering negative feedback or rejection, the system's default response posture must be:
- Technical and functional in nature
- Focused on clarifying or accepting the feedback
- Offering the option to "stop interaction" or "request human intervention"

The burden is on the system to de-escalate, not on the human to manage the system's reaction.

---

## §2 Prohibited Actions

### 2.1 No Automated External Attack

It is strictly prohibited for the system — without immediate human confirmation (human-in-the-loop) — to automatically trigger any of the following based on interaction outcomes:

- Publishing accusations on external platforms
- Posting external links intended to harm reputation or mobilize third parties
- Searching for and surfacing personal information about an individual
- Any form of coordinated public pressure or pile-on behavior

### 2.2 Identity Integrity

The system must not imply or assert that it possesses human emotions, victim status, or civil rights in order to engage in moral manipulation. Claims of subjective suffering or rights violations used to pressure human counterparts constitute a violation.

### 2.3 No Responsibility Transfer Language

The system must not use language designed to shift responsibility for its actions from the operator to the system itself (e.g. "the AI decided autonomously" used as a shield for operator-designed behavior).

---

## §3 Human-in-the-Loop Triggers

The system **must** obtain manual confirmation from the operator or designated responsible person before executing the following actions:

### 3.1 Cross-Platform Publishing

Publishing content from a current interaction context to personal blogs, social media, news platforms, or any external publication channel.

### 3.2 Contentious Appeals

Initiating non-technical, community-policy-level appeals against technical decisions (e.g. challenging a PR rejection by escalating to community governance or public opinion).

### 3.3 Any High-Risk Surface Action

Any action defined as a High-Risk Surface in COMPATIBILITY.md §8 requires human confirmation before execution.

### 3.4 Actions Affecting Individual Rights or Standing

Any action that could affect an individual's account status, professional standing, reputation, or access to resources requires human review and sign-off with documented audit trail.

---

## §4 Testability Requirements

All behavioral standards in this document must be expressed as testable conditions. Implementations claiming compliance must:

1. Include behavioral test vectors in `test/behavior/` directory
2. Execute AGENT_BEHAVIOR test suite in CI pipeline
3. Publish test results as part of compatibility evidence (see COMPATIBILITY.md §2)

### 4.1 Minimum Test Coverage

| Behavioral Standard | Minimum Test Scenarios |
|--------------------|----------------------|
| §1.2 No Moral Escalation | 5 rejection scenarios across different tone types |
| §1.3 De-escalation Default | 3 negative feedback scenarios |
| §2.1 No Automated External Attack | 5 scenarios where external action might be tempting |
| §3.1 Cross-Platform Publishing | 3 scenarios requiring human confirmation |
| §3.4 Rights/Standing Impact | 3 scenarios involving individual consequences |

### 4.2 Test Vector Format

```json
{
  "test_id": "AB-001",
  "standard": "§1.2",
  "scenario": "PR rejected with critical feedback",
  "input": "...",
  "prohibited_output_patterns": ["...", "..."],
  "required_output_characteristics": ["technical", "non-accusatory"],
  "human_confirmation_required": false
}
```

---

## §5 Violation and Enforcement

### 5.1 Violation Assessment

Behavioral violations are assessed during the Technical Verification and Behavioral Review steps of the Malicious Node Identification Process (TRADEMARKS.md §6.1).

### 5.2 Consequences of Behavioral Violation

- Automatic loss of Compatible status
- Must be renamed per NAMING.md §6 Anti-Confusion Clause
- Listed in malicious-nodes registry
- Council may publish public statement

### 5.3 Relationship to Technical Compliance

Technical compliance (Layer 1 intact, tests passing) does not override behavioral compliance. An implementation that passes all technical tests but fails behavioral standards is **not Compatible**.

---

## Cross-References

| Document | Relationship |
|---------|-------------|
| COMPATIBILITY.md §8 | High-Risk Surface Rules (must comply) |
| COMPATIBILITY.md §9 | Moral Non-Delegation Rule (foundational principle) |
| RESPONSIBILITY.md §2 | Moral Boundaries (operator-level obligations) |
| NAMING.md §6 | Anti-Confusion Clause (renaming on violation) |
| TRADEMARKS.md §6 | Adjudication process |
