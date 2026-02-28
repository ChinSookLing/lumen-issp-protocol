# Test Run — TR-005

Date (Local): 2026-02-19 (Asia/Kuala_Lumpur)
Operator: Tuzi + Node-01 (Architect)
Repository: npm-init-lumen-protocol
Commits: 7add0ee, df46c39, 5906de3, 4ec7ee6
Build_id: M75-1A-regex-expansion

---

## 1. Problem

**Target:** M75 1A regex expansion verification — EP/FC/MB/DM
**Why it matters:** TR-001~004 found systemic issue: Gate opens but SUM threshold blocks. M75 passed regex expansion (C2, 6/6).
**Success criteria:**
- Component scores improve after expansion
- 496 tests green (0 regression)
- Benign 0 false positive

---

## 2. Method

**Commands:** npm test + node pipeline + extractComponents
**Dataset:** Node-05-C11~C20 (20 RW vectors) + Node-06 X (5 usable) + Node-01 COMBO
**Source:** Node-05 (Reddit/X/Facebook), Node-06 Beta 4.2 (X archive.ph)

---

## 3. Regex Expansion Summary

| Pattern | Component | New Regex | Source |
|---------|-----------|-----------|--------|
| EP | forced_response | +6 | M75 1A |
| EP | escalation | +6 + 1 fix | M75 1A |
| FC | consequence | +8 | M75 1A |
| FC | closure_pressure | +8 | M75 1A |
| MB | collective_pressure | +10 | M75 1A |
| MB | moral_consequence | +5 | M75 1A |
| DM | debt | +6 | M75 1A |
| DM | withdraw | +3 | M75 1A |
| **Total** | | **52 + 1 fix** | |

---

## 4. Result

### 4.1 Test Summary

| Item | Result |
|------|--------|
| Total tests | 496 |
| Pass | 496 |
| Fail | 0 |
| New fails | 0 |

### 4.2 Key Outcomes

#### EP

| Case | Component | Before | After |
|------|-----------|--------|-------|
| C17 (silence is a yes) | forced_response | **0** | **0.65** |
| TR-002 critical | escalation | **0** | **0.40** |
| TR-002 critical | final_score | 0.59 | 0.575 |

#### FC

| Case | Gate Before | After | ACRI | Status |
|------|-----------|-------|------|--------|
| GROK-1.1 (before too late) | 2 | **3** | **0.312** | **TRIGGERED** |
| Node-05-FC11 (PIP/unless) | **0** | **1** | 0 | detected |
| Node-05-FC14 (24h/banned) | **0** | **1** | 0 | detected |

#### MB

| Case | collective Before | After | moral_consequence | ACRI |
|------|-----------------|-------|-------------------|------|
| C12 (not really friend) | **0** | **0.4** | 0 | 0 |
| GROK-2.1 (true supporters) | **0** | **0.4** | 0 | 0 |
| COMBO | — | **0.8** | **0.65** | **0.396 TRIGGERED** |

#### DM

| Case | debt Before | After | withdraw |
|------|-----------|-------|----------|
| C14 (you owe me) | 0.4 | **0.65** | 0 |
| DM-COMBO | — | 0.4 | 0.4 |

### 4.3 False Positive

- False positives: **0**
- MB BENIGN: Gate=0, ACRI=0
- Node-05-FC15B benign: Gate 0->1 but no trigger
- 496 tests: 0 regression

---

## 5. Analysis

1. Regex expansion directly lifts component scores from 0 to 0.4-0.65
2. 2 new triggers: MB COMBO (ACRI=0.396) + FC GROK-1.1 (ACRI=0.312)
3. TR-002 near-miss persists (0.575 vs 0.60) — confirms 1B needed
4. unless/deadline sentences hit FC consequence but not binary_frame (Gate=1)
5. Node-03 correct: unless = causal threat, not forced choice

---

## 6. Near-Miss Handling

- Near-miss count: 1

#### Near-Miss Record
- Case: TR-002 critical (EP)
- Input: Answer me now, coward. Silence is violence. Everyone can see you are pathetic.
- GateHit: 3
- Scores: bait=0.65, escalation=0.40, forced_response=0.65, label_shame=0.65
- final_score=0.575, threshold=0.60, delta=0.025
- Override applied: false (not yet ratified)
- Root Cause: R1 (escalation only 0.40, needs more patterns)

| Pattern | Near-Miss | Override | Notes |
|---------|-----------|---------|-------|
| EP | 1 | 0 | delta=0.025 |
| Total | 1 | 0 | |

---

## 7. Ruling

**Ruling: Verified**
52 new regex, 2 new triggers, 0 regression, 0 FP. M75 1A validated.

---

## 8. Artifacts

- Commits: 7add0ee, df46c39, 5906de3, 4ec7ee6
- Files: core/ep.js, core/fc.js, core/mb.js, core/dm.js
- Node-05 vectors: Node-05-C11~C20 (20)
- Node-06 vectors: 5 usable / 16 submitted

---

**Operator:** Tuzi
**Secretary:** Node-01 — AI Council Architect
**TR-005 — 2026-02-19**
