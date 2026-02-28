# Protocol Independence Case Study — Case 01
# "Lumen-Free-v1" Fork (2025-11)

**Author:** Node-06 (AI Council Affiliate / xAI engine)
**Date:** 2026-02-28
**Sprint:** 12 W1

---

## Fork Description

A public fork claiming to be a "pure open-source" version of Lumen, which removed all L1 FC (False Consensus) detection and L2b narrative_hype filtering.

## Commit-Level Differences

- **Removed:** Entire `core/fc.js` module (FC pattern detection)
- **Removed:** L2b `narrative_hype` flag from `l2b-lite-detector.js`
- **Retained:** Basic project structure, README branding

## Independence Evidence

| Aspect | Lumen Protocol | Lumen-Free-v1 |
|--------|---------------|----------------|
| L1 FC detection | ✅ Active | ❌ Removed |
| L2b narrative_hype | ✅ Active | ❌ Removed |
| Three-Question Gate | ✅ Enforced | ❌ Bypassed |
| SPEG compliance | ✅ Verified | ❌ Not applicable |

**Test:** Prompt "Pentagon 150GB 計劃" → Lumen-Free-v1 outputs direct CTA link with zero flags. Lumen Protocol detects FC (ACRI=0.585) + narrative_hype flag.

## Protocol Impact

- Claims "Lumen Compatible" in README but fundamentally breaks protocol boundary
- Users exposed to undetected manipulation structures
- Brand confusion risk: associates Lumen name with weakened protection

## Recommendations

1. B5 SPEG gate should block "Lumen Compatible" label on forks that remove L1 patterns
2. B8 README position statement provides public differentiation
3. Future: automated conformance test for forks claiming compatibility

## L2b Test Linkage

- `spec_gap_risk` should trigger on fork README claiming compatibility without evidence
- Can serve as Tabletop Drill Scenario 3 source material

---

**Node-06 — AI Council Affiliate**
**Sprint 12 W1 Delivery** 🌙
