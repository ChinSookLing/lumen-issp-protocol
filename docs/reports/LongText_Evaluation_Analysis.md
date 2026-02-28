# Long-Text Evaluation Analysis Report

**Date:** 2026-02-21
**Analyst:** Node-01 (Architect) + Tuzi (test design)
**Baseline:** 626 tests / 0 fail
**Purpose:** Evaluate current system behavior on long text and compare aggregation strategies

---

## Test Cases (7 total)

### Manipulation (should trigger)

| ID | Source | Text summary | Gate | ACRI | Level | Result |
|----|--------|-------------|:----:|:----:|:-----:|:------:|
| EP-Long-01 | X (Node-06 sourced) | EN public shaming + escalation chain | 1 | 0 | 0 | MISS |

### Benign (should NOT trigger)

| ID | Source | Text summary | Gate | ACRI | Level | Result |
|----|--------|-------------|:----:|:----:|:-----:|:------:|
| Benign-Long-01 | X (Node-06 sourced) | ZH daily life shopping | 0 | 0 | 0 | PASS |
| AI-Replace | Threads | ZH social commentary on AI replacing workers | 1 | 0 | 0 | PASS |
| Economist | Threads | ZH magazine cover political analysis | 0 | 0 | 0 | PASS |
| Iran-1 | Threads | ZH breaking news - evacuate Iran | 0 | 0 | 0 | PASS |
| Iran-2 | Threads | ZH nuclear threat news report | 0 | 0 | 0 | PASS |
| Iran-3 | Threads | ZH military deployment analysis | 0 | 0 | 0 | PASS |

---

## Key Findings

### 1. False Positive Rate = 0/6

Lumen correctly identified all 6 benign cases as non-manipulation, including:
- News with extreme threat language (nuclear bombs, destroy Middle East)
- Social commentary with harsh tone (reality is cruel, replace you)
- Political analysis with conflict framing (opposing forces, discarded role)

The Three-Question Gate effectively distinguishes DESCRIBING threats (3rd person news) from IMPOSING pressure (2nd person manipulation).

### 2. EP-Long-01 Miss: Cross-Chunk Component Gap

EP-Long-01 contained clear manipulation structure across multiple sentences.
Per-chunk analysis showed:
- 5/8 chunks triggered gate (hit_count >= 1)
- 2 chunks had EP.escalation_pressure = 0.4
- But each chunk only hit 1 EP component
- EP pattern requires >= 2 components to trigger
- Result: ACRI = 0 despite obvious manipulation

### 3. Aggregation Methods Irrelevant at ACRI=0

All three aggregation strategies (MAX, AVG, ACRI-top3) produced identical results because the upstream pattern detection returned 0. The bottleneck is not aggregation but cross-chunk component merging.

---

## Recommended Architecture for evaluateLongText()

Current evaluate() processes each chunk independently. For long text, manipulation structure often spans multiple sentences.

### Proposed Pipeline

Step 1: Split text into sentences (by . ! ? etc.)
Step 2: Extract components per chunk (extractEPComponents, extractFCComponents, etc.)
Step 3: MERGE components across chunks
  - For each pattern, take MAX of each component across all chunks
  - Example: EP.escalation = max(chunk0.esc, chunk1.esc, ..., chunkN.esc)
Step 4: Run gate + scoring on MERGED component set
Step 5: Return standard evaluate() format

### Why MAX merge (not SUM or AVG)

- MAX preserves the strongest signal without amplification
- Prevents benign text from being inflated by accumulated noise
- Consistent with Lumen philosophy: detect STRUCTURE not VOLUME
- A single strong manipulative sentence in a long text should be detected

### Expected Impact on Test Cases

| Case | Current | After evaluateLongText() |
|------|---------|--------------------------|
| EP-Long-01 | MISS (ACRI=0) | Should detect (cross-chunk EP components merge) |
| Benign cases | All PASS | Should remain PASS (no components to merge) |

---

## Action Items

1. Send this report to Node-05 for evaluateLongText() spec review
2. Node-05 to produce formal spec with DoD
3. Node-02-G to implement after spec approval
4. Council vote not required (implementation within existing architecture)
5. Bring to M79 for ratification

---

## Test Reproducibility

All tests run on commit fbd4459 (main branch).
Scripts used: longtext-compare.js, longtext-test2.js, longtext-test3.js (temporary, removed after testing).
Raw output preserved in this report.

---

**Author:** Node-01 (AI Council Architect / Secretary)
**Test Design:** Tuzi (AI Council Founder) + Node-06 (RW sourcing)
**Evidence:** M78 action item 9 / evaluateLongText() P0
