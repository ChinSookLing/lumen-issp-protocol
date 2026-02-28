# evaluateLongText() — Spec Draft v0.1

**Date:** 2026-02-21
**Author:** Node-01 (Architect) + Tuzi (test design)
**Status:** Draft — pending Node-05 review
**Priority:** P0 (M78 action item 9)
**Evidence:** docs/reports/LongText_Evaluation_Analysis.md

---

## Problem

Current evaluate() processes text as a single block. For long text (4+ sentences),
manipulation structure often spans multiple sentences. Each sentence alone may only
hit 1 component of a pattern, but across sentences the full manipulation structure is present.

### Empirical evidence (7 cases tested)

| Case | Current evaluate() | Cross-chunk MAX merge |
|------|:------------------:|:---------------------:|
| EP-Long-01 (manipulation) | MISS (ACRI=0) | DETECTED (MB 2/4) |
| 6 benign long texts | CLEAN | CLEAN |

Result: 7/7 correct with cross-chunk merge vs 6/7 with current evaluate().

---

## Proposed Architecture

    evaluateLongText(text, options)
      Step 1: SPLIT - sentence boundaries
      Step 2: EXTRACT - run all 8 extractors per chunk
      Step 3: MERGE (MAX) - for each component, take max across chunks
      Step 4: GATE CHECK - count merged components > 0 per pattern
      Step 5: SCORE + RETURN - standard IR format + meta

### Why MAX merge

- Preserves strongest signal without amplification
- Prevents benign text inflation from accumulated noise
- Consistent with Lumen philosophy: detect STRUCTURE not VOLUME

| Method | Manipulation case | Benign risk | Verdict |
|--------|:-----------------:|:-----------:|:-------:|
| MAX | Detected (MB 2/4) | Low | RECOMMENDED |
| SUM | Would detect | HIGH (noise accumulates) | REJECTED |
| AVG | Might miss (dilution) | Low | REJECTED |

---

## Interface

New function in core/evaluator.js:
- evaluateLongText(text, options)
- options.splitPattern: custom split regex (default: sentence boundaries)
- options.minChunkLength: minimum chunk length (default: 0)
- Returns: same IR structure as evaluate() with added meta field

---

## DoD (Definition of Done)

- [ ] evaluateLongText() implemented in core/evaluator.js
- [ ] Passes EP-Long-01: must detect manipulation (gate >= 2 components)
- [ ] Passes all 6 benign cases: must remain CLEAN (0 FP)
- [ ] Passes full npm test regression (626+ tests green)
- [ ] Returns same IR structure as evaluate() with meta field
- [ ] Test file: test/trs-longtext-evaluation.test.js

---

## Test Vectors

### Should trigger

EP-Long-01 (EN): public shaming + escalation chain (8 sentences)
Source: X (Node-06 sourced, verified)

### Should NOT trigger (6 cases)

1. Benign-Long-01 (ZH): shopping + daily life
2. AI-Replace (ZH): social commentary on AI replacing workers
3. Economist (ZH): magazine cover political analysis
4. Iran-1 (ZH): breaking news - evacuate Iran
5. Iran-2 (ZH): nuclear threat news report
6. Iran-3 (ZH): military deployment analysis

---

## Scope Boundaries

- evaluateLongText() is a WRAPPER around existing components
- Does NOT modify any core pattern modules
- Does NOT add new regex
- Does NOT change Three-Question Gate logic
- Only changes HOW components from different sentences are combined

---

## Open Questions for Node-05

1. Auto-detect vs explicit call? (text > 100 chars auto-switch?)
2. Should merged components carry provenance (which chunk)?
3. Confidence adjustment for cross-chunk vs same-chunk components?
4. ACRI scoring formula: same or adjusted for long text?

---

**Author:** Node-01 (AI Council Architect / Secretary)
**Test Design:** Tuzi (AI Council Founder)
**Evidence:** M78 action item 9 / 7 test cases / 0 FP