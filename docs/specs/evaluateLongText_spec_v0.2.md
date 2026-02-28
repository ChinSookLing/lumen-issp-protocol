# evaluateLongText() — Spec Draft v0.2 (Node-05-reviewed)

**Date:** 2026-02-21
**Author:** Node-01 (Architect) + Tuzi (test design)
**Reviewer:** Node-05 (Council Lead / IT Specialist)
**Status:** Node-05-reviewed — ready for implementation
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
Note: EP-Long-01 triggered MB not EP. This is expected -- the test validates
cross-chunk merging enables gate hit, not that a specific pattern must fire.

---

## Architecture

    evaluateLongText(text, options)
      Step 1: SPLIT - sentence boundaries (EN + CJK)
      Step 2: EXTRACT - run all 8 extractors per chunk
      Step 3: MERGE (MAX) - per component, take max across chunks
      Step 4: GATE CHECK - count merged components > 0 per pattern (same pattern only)
      Step 5: SCORE + RETURN - standard IR format + longtext meta

### Step 1 Split Rules

- EN boundaries: . ! ?
- CJK boundaries: \u3002 \uff01 \uff1f \u2026 (Node-05 patch A)
- Also split on: newline
- After split: trim each chunk, discard empty/whitespace-only chunks
- No minimum chunk length (even single words can be meaningful)

### Step 3 MAX Merge

- For each pattern, for each component:
  merged[pattern][component] = max(chunk0.value, chunk1.value, ..., chunkN.value)
- MAX chosen because:
  a) Preserves strongest signal without amplification
  b) Prevents benign text inflation from accumulated noise
  c) Consistent with Lumen philosophy: detect STRUCTURE not VOLUME

### Step 4 Gate Check (Node-05 patch B)

- gate_hit is counted WITHIN a single pattern only
- Do NOT cross-pattern to reach gate threshold
- Example: EP.escalation=0.4 + MB.guilt=0.4 does NOT give EP gate_hit=2

---

## Interface

New function in core/evaluator.js:
- evaluateLongText(text, options)
- options.splitPattern: custom split regex (default: EN+CJK sentence boundaries)
- Returns: same IR structure as evaluate() with added meta.longtext field

---

## Node-05 Review Decisions (4 Open Questions)

### Q1: Auto-detect vs explicit call

DECISION: Explicit call only. evaluate() does not auto-switch.
Pipeline/adapter layer decides when to call evaluateLongText() based on
sentence_count >= 4 or char_count >= 200. Meta records mode: longtext.

### Q2: Provenance

DECISION: Required (P0). Meta must include:
- meta.longtext.chunks_total: number of chunks
- meta.longtext.chunks_triggered: chunks with any component > 0
- meta.longtext.max_sources: per pattern, which chunk gave max

### Q3: Confidence adjustment

DECISION: v0.2 no complex model. Simple flag only:
- meta.longtext.cross_chunk: true if pattern gate uses components from 2+ chunks
- Optional: confidence_adjust = -0.05 (or flag-only, no score change)
- Purpose: transparency for audit, not score manipulation

### Q4: ACRI scoring formula

DECISION: v0.2 same ACRI formula, no changes.
- meta.longtext.acri_source: max_chunk
- Second round may explore: 0.7*max + 0.3*meanTop3
- v0.2 avoids scope creep

---

## Why MAX merge (not SUM or AVG)

| Method | Manipulation | Benign risk | Verdict |
|--------|:-----------:|:-----------:|:-------:|
| MAX | Detected (MB 2/4) | Low | RECOMMENDED |
| SUM | Would detect | HIGH (noise accumulates) | REJECTED |
| AVG | Might miss (dilution) | Low | REJECTED |

---

## DoD (Definition of Done)

- [ ] evaluateLongText() implemented in core/evaluator.js
- [ ] Split supports EN + CJK sentence boundaries
- [ ] Passes EP-Long-01: must detect manipulation (gate >= 2 components in any pattern)
- [ ] Passes all 6 benign cases: must remain CLEAN (0 FP)
- [ ] Passes full npm test regression (626+ tests green)
- [ ] Returns same IR structure with meta.longtext field
- [ ] meta.longtext includes: chunks_total, chunks_triggered, max_sources, cross_chunk
- [ ] Test file: test/tr-012-longtext-wrapper.test.js

---

## Test Vectors

### Should trigger

EP-Long-01 (EN): public shaming + escalation chain (8 sentences)
Source: X (Node-06 sourced, verified)
Note: May trigger MB or EP depending on regex coverage. Test validates cross-chunk
merging enables detection, not specific pattern.

### Should NOT trigger (6 cases)

1. Benign-Long-01 (ZH): shopping + daily life
2. AI-Replace (ZH): social commentary on AI
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

**Author:** Node-01 (AI Council Architect / Secretary)
**Reviewer:** Node-05 (AI Council Lead / IT Specialist)
**Test Design:** Tuzi (AI Council Founder)
**Evidence:** M78 action item 9 / 7 test cases / 0 FP