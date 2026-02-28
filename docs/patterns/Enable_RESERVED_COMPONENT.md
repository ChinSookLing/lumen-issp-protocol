# Enable Reserved Component — Proposal Template

**Version:** v1.0
**Ratified:** M78 (2026-02-21), Option C(light), 6/6
**Purpose:** Standardize the process for activating RESERVED components in core pattern modules.

---

## When to use this template

Use this template when proposing to activate any component currently marked as RESERVED in core/*.js.
Currently known RESERVED components:
- DM.gate_res (C5) — core/dm.js

---

## Proposal Fields (all required)

### 1. Component Identity

- **Pattern module:** (e.g., DM)
- **Component name:** (e.g., gate_res)
- **Component ID:** (e.g., C5)
- **File:** (e.g., core/dm.js)
- **Current status:** RESERVED

### 2. Activation Rationale

> Why should this component be activated now? What gap does it fill?
> Must reference at least one of: RW evidence, pattern theory, Council discussion.

### 3. Proposed Mechanism

- **Regex count (target):** EN=___, ZH=___
- **Scoring weight:** ___
- **Interaction with existing components:** (e.g., does it overlap with guilt? debt?)

### 4. Evidence

- **RW cases supporting activation:** (TR id or description)
- **Synthetic vectors prepared:** (TRS id or draft)
- **Psychology literature basis:** (citation)

### 5. Test Plan

- [ ] Baseline verification: component = 0 on all existing tests before activation
- [ ] Strong positive tests (EN + ZH): ≥ ___ vectors
- [ ] Medium positive tests: ≥ ___ vectors
- [ ] Benign / hard negative tests: ≥ ___ vectors (≥30% of total)
- [ ] Self-reference tests (e.g., "I feel X" should NOT trigger): ≥ ___ vectors
- [ ] Full regression: npm test remains green

### 6. DoD (Definition of Done)

- [ ] Regex inserted into correct position in core module
- [ ] Component scoring activated (no longer returns 0)
- [ ] All test vectors pass
- [ ] npm test green (no regression)
- [ ] Test file committed with naming: tr-{NNN}-{pattern}-{lang}.test.js
- [ ] Commit message includes Evidence pointers (Rule 2)
- [ ] Council vote recorded in meeting minutes

### 7. Rollback Plan

> If activation causes unexpected regression:
> 1. `git revert` the activation commit
> 2. Re-run `npm test` to confirm rollback
> 3. Report to Council with failure analysis
> 4. Re-propose with adjusted mechanism

---

## Approval Requirements

- **Vote threshold:** C1 (≥5/6) — same as new capability
- **Cooling period:** None required (component already exists in architecture)
- **Post-activation:** Diagnostic TR within 1 meeting cycle

---

## Precedent

| Component | Activated | Meeting | Vote | Commit |
|-----------|-----------|---------|------|--------|
| DM.guilt (C4) | 2026-02-20 | M77 | 6/6 | d6a247d |

---

**Author:** Node-01 (AI Council Architect / Secretary)
**Approved:** M78, Option C(light), 6/6
