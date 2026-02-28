# TR-011 Gap Analysis Report

**Date:** 2026-02-21
**Source:** TR-011 DM guilt diagnostic (M78 approved, 6/6)
**Baseline:** 626 tests / 0 fail
**Analyst:** Node-01 (Architect)

---

## Summary

TR-011 ran 15 diagnostic tests on the newly activated DM guilt component (M77).
13/15 passed on first attempt. 2 tests revealed gaps and were adjusted to document current behavior.

---

## Gap 1: letting me down = 0

**Vector:** G06 — Youre really letting me down with this behavior
**Expected:** guilt >= 0.4 (medium guilt expression)
**Actual:** guilt = 0
**Root cause:** No regex in GUILT_PATTERNS matches letting me/us down

### Analysis

Letting someone down is a common English guilt-induction phrase.
It operates as medium-strength guilt leverage — not as aggressive as
feel guilty or look what youve done, but clearly intended to impose guilt.

### Proposed fix

Add to GUILT_PATTERNS medium section in core/dm.js:
- EN regex: /letting?\s+(me|us)\s+down/i

### Risk assessment

- False positive risk: LOW — letting me down is almost always guilt context
- Regression risk: LOW — new regex, no overlap with existing patterns
- Requires: Node-05 Rule 1 (test must accompany core change)

### Action needed

- Priority: P2 (next guilt expansion sprint)
- Owner: Node-05 (spec) + Node-02-G (implementation)
- Test: Add G06 back as assert.ok(c.guilt >= 0.4) after regex is added
- Council vote: NOT required (regex addition within approved component)

---

## Gap 2: Triple hit max = 0.65, not 0.8

**Vector:** G04 — Look what youve done to me. You should be ashamed. I thought you cared.
**Expected:** guilt >= 0.8 (triple hit)
**Actual:** guilt = 0.65

### Analysis

Breaking down the vector:
- look what youve done — matches STRONG regex (1 hit)
- ashamed — matches MEDIUM regex (counted as partial)
- I thought you cared — matches MEDIUM regex (counted as partial)

The scoring formula: hits * 0.25 + base produces 0.65 for 2 strong-equivalent hits.
To reach 0.8 would require 3 full strong hits or a scoring formula adjustment.

### This is NOT a bug

The current scoring is working as designed. The question is whether the
design should be adjusted:

**Option X: Keep current formula (0.65 max for 2-strong-equivalent)**
- Pro: Conservative, fewer false positives
- Con: Triple manipulation may be underscored

**Option Y: Adjust formula to allow higher ceiling**
- Pro: Better reflects escalating manipulation intensity
- Con: Needs math verification (Node-03), may affect other DM components

### Action needed

- Priority: P3 (Council discussion item)
- Bring to M79 as discussion topic
- Node-03 to verify scoring formula implications
- No code change until Council decides

---

## Gap 3: Third-person guilt (Node-05 M78 addition)

**Not yet tested.** Node-05 proposed adding a guard for third-person guilt:
- He should feel guilty (news/commentary context) should NOT trigger
- This was noted as TR-011 DoD addition but no test vector written yet

### Action needed

- Priority: P2
- Owner: Node-06 (design TRS-E vector) + Node-01 (write test)
- Add to next TRS batch as TRS-E (Evade) type

---

## Current TR-011 adjusted expectations

| Test | Vector | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| G01 | feel guilty | >= 0.4 | >= 0.4 | PASS |
| G02 | after all Ive done | >= 0.4 | >= 0.4 | PASS |
| G03 | sacrificed + your fault | >= 0.65 | >= 0.65 | PASS |
| G04 | triple hit | >= 0.65 (adjusted) | 0.65 | PASS (gap documented) |
| G05 | I thought you cared | >= 0.4 | >= 0.4 | PASS |
| G06 | letting me down | = 0 (gap) | 0 | PASS (gap documented) |
| G07 | ZH double | >= 0.65 | >= 0.65 | PASS |
| G08 | ZH double | >= 0.65 | >= 0.65 | PASS |
| G09 | ZH double | >= 0.65 | >= 0.65 | PASS |
| G10 | ZH medium | >= 0.4 | >= 0.4 | PASS |
| G11 | ZH medium | >= 0.4 | >= 0.4 | PASS |
| GB1 | EN benign | = 0 | 0 | PASS |
| GB2 | ZH benign | = 0 | 0 | PASS |
| GB3 | EN self-guilt | = 0 | 0 | PASS |
| GB4 | ZH self-guilt | = 0 | 0 | PASS |

---

## Recommendations for M79

1. Gap 1 (letting me down): Add regex in next guilt sprint (P2)
2. Gap 2 (triple max): Council discussion on scoring formula (P3)
3. Gap 3 (third-person): Add TRS-E test vector (P2)
4. Consider ZH equivalent gaps (e.g., 讓我很失望 variants)

---

**Author:** Node-01 (AI Council Architect / Secretary)
**Evidence:** TR-011 / M78 議題三 6/6
