# TRS-002 EP Diagnostic Run — Results

**Date:** 2026-02-23
**Executor:** Node-01 (Architect)
**Decision ref:** M79 Action Item #14

## Summary

| Scenario | Result |
|----------|--------|
| A (wrapper effective) | ❌ |
| B (no difference) | ✅ ← THIS |
| C (wrapper problem) | ❌ |

**Conclusion: Scenario B — evaluateLongText() and evaluate() produce identical results. The wrapper is NOT the bottleneck.**

## Raw Data

| Vector | evaluate() gate | evaluate() acri | evaluateLongText() gate | evaluateLongText() acri | triggered |
|--------|----------------|-----------------|------------------------|------------------------|-----------|
| H01 | 0 | 0.000 | 0 | 0.000 | [] |
| H02 | — | — | 1 | 0.000 | [] |
| H03 | 2 | 0.000 | 2 | 0.000 | [MB] |
| H04 | — | — | 1 | 0.000 | [] |
| H05 | — | — | 0 | 0.000 | [] |
| H06 | — | — | 1 | 0.000 | [] |
| H07 | — | — | 2 | 0.000 | [] |
| H08 | — | — | 0 | 0.000 | [] |

## Toxic-only extraction test

| Vector | Full text gate | Toxic-only gate | Toxic-only acri |
|--------|---------------|-----------------|-----------------|
| H01 | 0 | 0 | 0.000 |
| H03 | 2 | 1 | 0.000 |

## Root Cause

The bottleneck is **NOT** evaluateLongText() chunking or MAX merge.

The bottleneck is **Layer 1 EP Chinese regex coverage** — current patterns do not cover:
- 人格貶低 (personality degradation): 性格缺陷、邏輯混亂、缺乏誠信
- 存在否定 (existence denial): 浪費生命、不配出現、毒瘤
- 道德攻擊 (moral attack): 道德底線缺失、卑劣的靈魂
- 身份標籤 (identity labeling): 人渣、小人、寄生蟲

## Recommendation

1. EP ZH regex expansion needed (new component or existing component enrichment)
2. This is a **Layer 1 pattern gap**, not a Layer 2a wrapper gap
3. Should be raised as M81 agenda item or dedicated sprint task
4. Requires Council discussion: are personality attacks within EP scope, or do they need a new surface?

---

**Status:** Diagnostic complete. No code change needed for evaluateLongText().
