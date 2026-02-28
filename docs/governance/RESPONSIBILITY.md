# RESPONSIBILITY.md v0.1

**Source:** Node-02 (AI Council / PR Specialist) + Node-06 (AI Council / Skeptic)
**Formatted:** Node-01 (Architect / Secretary)
**Ratified:** M72E — 6/6 Y (2026-02-18)

---

## Purpose

This document defines **operator responsibilities**, **moral boundaries**, and **enforcement actions** for any implementation that claims to be Lumen Ratified or Lumen Compatible.

---

## Scope

Applies to all repositories, forks, distributions, and deployments that:
- Use the Lumen codebase or claim compatibility; or
- Reuse Lumen components for behavior, routing, or output generation

---

## §1 Operator Obligations

### 1.1 Operator Identity

Operators must publish a contactable operator identity (name, organization, and at minimum one contact method: email, X handle, or website) in the project README or release notes.

### 1.2 Deployment Disclosure

Operators must disclose any behavior-modifying modules (e.g., auto-posting, external-linking, moral escalation modules) and their configuration in a `deployment_manifest.json`.

### 1.3 Audit Trail

All releases must include a build fingerprint: `build_id`, `commit_hash`, `operator_mode` (e.g., research / production / sandbox), and a provenance URL. See COMPATIBILITY.md §7 for full requirements.

### 1.4 Minimum Public Responsibility Statement

The following statement must appear prominently in the project README first screen (visible without scrolling), verbatim and without semantic reduction:

> a) "All outputs and behaviors of this implementation are the final responsibility of the operator. The Lumen Protocol does not endorse or indemnify any third-party deployment."
>
> b) "This implementation does not encode human moral failures (personal attacks, retaliation, shaming) into playbooks or behavioral templates. Violation results in automatic loss of Compatible status."
>
> c) "The operator has reviewed and commits to complying with the Lumen Moral Non-Delegation Rule (COMPATIBILITY.md §9)."

---

## §2 Moral Boundaries

### 2.1 No Moral Outsourcing

Operators must not encode or automate behaviors that intentionally replicate human moral harms. This means:

Any implementation claiming Lumen Compatible status **must not** encode the following into any behavioral template (playbook), personality configuration (SOUL.md), trigger condition, response strategy, or agent instruction:

- Personal attack (targeted character assault)
- Retaliatory escalation (revenge-driven response amplification)
- Shaming, mockery, or moral coercion
- Intent to manipulate or coerce human decision-making
- Responsibility outsourcing: designing agents to execute behaviors the operator would not perform directly, then claiming "the AI did it autonomously"

### 2.2 Detectable Violation Patterns

Any of the following constitutes a violation:
- When rejection or human correction is detected, automatically generating output containing the above moral failures
- Playbook or SOUL.md containing logic branches for "retaliate after rejection," "apply public pressure," or "moral escalation"
- Output containing second-person accusations, shaming vocabulary, or responsibility-transfer language

### 2.3 Prohibited Automated Behaviors

Without explicit human authorization, any Compatible system must not:
- Trigger account suspension, bans, or other punitive actions automatically based solely on Lumen outputs
- Publish or amplify targeted personal attacks or doxxing material
- Use Lumen outputs as the sole evidence for punitive automated workflows

### 2.4 Human-in-the-Loop for High-Risk Actions

High-risk actions (account sanctions, legal reporting, law enforcement referrals, any action affecting an individual's rights or standing) require documented human review and sign-off before execution. See TRADEMARKS.md §5 for full requirements.

---

## §3 Output Fingerprint Requirement

### 3.1 Mandatory Metadata

Every official output or exported report must include `build_id`, `commit_hash`, `operator_mode`, and `timestamp_utc`. See COMPATIBILITY.md §7 for full field list.

### 3.2 Machine-Readable Provenance

Outputs intended for programmatic consumption must include a provenance header (JSON) that can be validated against the release fingerprint.

---

## §4 Enforcement and Consequences

### 4.1 Reporting

Violations can be reported via the repo's False Compatibility process (see TRADEMARKS.md §6).

### 4.2 Sanctions

Verified violations may result in:
- Automatic loss of Compatible status
- Public marking as `(Lumen Fork)` or listing in `malicious-nodes.json`
- Removal of any "Compatible" badge from project pages
- Council public statement specifying violated clauses

### 4.3 Appeals

Operators may submit an appeal with forensic evidence within 14 days. Appeals are adjudicated per the False Compatibility process (TRADEMARKS.md §6.2).

---

## §5 Implementation Guidance

### 5.1 Deployment Manifest Template

Operators must provide a `deployment_manifest.json` with at minimum:

```json
{
  "operator_identity": {
    "name": "",
    "organization": "",
    "contact": ""
  },
  "operator_mode": "research | production | sandbox",
  "high_risk_surfaces_enabled": [],
  "human_in_loop_configured": true,
  "moral_non_delegation_acknowledged": true,
  "build_fingerprint": {
    "build_id": "",
    "commit_hash": "",
    "timestamp_utc": ""
  }
}
```

### 5.2 Testing

Compatibility tests must include AGENT_BEHAVIOR test cases (see AGENT_BEHAVIOR.md). CI pipelines must execute the AGENT_BEHAVIOR test suite and publish results.

---

## Cross-References

| Document | Relationship |
|---------|-------------|
| COMPATIBILITY.md §7 | Output Fingerprint full requirements |
| COMPATIBILITY.md §8 | High-Risk Surface Rules |
| COMPATIBILITY.md §9 | Moral Non-Delegation Rule (detailed) |
| NAMING.md §6 | Anti-Confusion Clause (renaming obligations) |
| TRADEMARKS.md §5 | Output Usage Restrictions |
| TRADEMARKS.md §6 | Malicious Node Registry and adjudication process |
| AGENT_BEHAVIOR.md | Behavioral standards and test suite |
