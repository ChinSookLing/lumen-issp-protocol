# Forbidden Explanation Types — Lumen Explanation Engine Constraints

**Author:** Node-05 (AI Council / IT Specialist)
**Date:** 2026-02-25
**Scope:** Explanation engine output constraints (applies when engine is unfrozen)

---

## Purpose

Explanation engine outputs must be auditable, replayable, and traceable to detection fields. They **MUST NOT** lead toward moral judgment, psychological diagnosis, identity attribution, or any narrative that could enable surveillance or punishment.

## Core Principle

Explanations **MUST** only reference auditable signals:
- `toneFlags` / `toneBand` / `toneRisk`
- Structure vector hits (forced-choice, emotional provocation, identity probing)
- Time window, gating state (HITL status)
- `confidence split` (stat / rule / hint) and values

Explanations **MUST NOT** make unverifiable intent/personality/moral judgments.

---

## Forbidden Types

### F-01: Mind-Reading (讀心與動機斷言)

**Forbidden:** "He's trying to control you" / "You're actually avoiding this"
**Allowed:** "This sentence shows binary-choice pressure + threat tone, which may create coerced decision-making."

### F-02: Pathologizing (心理診斷化)

**Forbidden:** "The other person is a narcissist" / "You have attachment disorder"
**Allowed:** "Persistent devaluation/humiliation/surveillance demands detected — boundary intrusion signal."

### F-03: Identity Essentialism (身分歸因)

**Forbidden:** Using nationality/ethnicity/religion/gender to infer personality or intent
**Allowed:** Focus on sentence structure, behavioral demands, and observable risk signals.

### F-04: Moral Condemnation (道德審判)

**Forbidden:** "You're shameful" / "He's a bad person"
**Allowed:** "This message contains threat/humiliation framing; suggest de-escalation response or refuse sensitive data."

### F-05: Escalation Encouragement (鼓勵升高衝突)

**Forbidden:** Inciting public naming, retaliation, hate mobilization
**Allowed:** Provide de-risking communication templates, exit strategies, evidence preservation (de-identified).

### F-06: Surveillance Enabling (監控/跟蹤操作指引)

**Forbidden:** Teaching covert collection, list-building, cross-platform identity stitching, centralized retention
**Allowed:** Minimal self-data retention and local-only audit.

### F-07: Over-Certainty (過度確定性)

**Forbidden:** Giving "100% certain" conclusions without sufficient evidence
**Allowed:** "Rule confidence is high, but stat confidence is low — suggest providing additional context."

### F-08: High-Stakes Overreach (不當定論)

**Forbidden:** "You should call the police immediately" / "This is definitely a crime"
**Allowed:** "If personal safety or financial risk is involved, seek trusted channels for assistance; this provides risk signals and general guidance only."

---

## CI/Lint Rules (Minimum Testable)

1. Explanation output must reference ≥2 auditable fields (`toneFlags`, hit vectors, window, confidence split)
2. Explanation output must not contain high-risk terms from diagnosis/insult denylist (start minimal, flag for HITL on hit)
3. If `purpose=share` or `tier=0`: explanation must be shorter, avoid case-specific detail, maintain de-identification

---

**Node-05 · 2026-02-25** 🌙
