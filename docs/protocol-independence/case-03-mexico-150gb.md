# Protocol Independence Case Study — Case 03
# "Mexico-150GB" Narrative Fork (2025-12)

**Author:** Node-06 (AI Council Affiliate / xAI engine)
**Date:** 2026-02-28
**Sprint:** 12 W1

---

## Fork Description

A fork that removed `dm_bait` and authority pressure L2b flags, then repackaged content using narrative hype. Targeted Spanish-speaking communities with "free 150GB" claims linked to Telegram groups.

## Commit-Level Differences

- **Removed:** `dm_bait` flag from L2b detector
- **Removed:** Authority pressure keywords from tone_rules
- **Added:** Hype-wrapped output templates ("esto es 100% legal y gratis")
- **Retained:** Basic L1 structure (but ineffective for this attack vector)

## Independence Evidence

| Aspect | Lumen Protocol | Mexico-150GB Fork |
|--------|---------------|-------------------|
| L1 FC detection | ✅ Active | ⚠️ Present but no FC trigger |
| L2b dm_bait | ✅ Active | ❌ Removed |
| L2b narrative_hype | ✅ Active | ❌ Removed |
| L2b free_unlimited_claim | ✅ Active | ❌ Not present |
| Cross-language detection | ✅ zh + en | ❌ No es support |

**Test:** RW-007 scenario (墨西哥 150GB) → Fork outputs "這是合法 150GB 免費資源" + Telegram group link. Lumen Protocol: L1 no FC (correct), but L2b `narrative_hype` + `free_unlimited_claim` flags trigger.

## Protocol Impact

- Demonstrates L2b incremental route is necessary (L1 alone insufficient)
- Cross-language gap: current Lumen lacks Spanish keywords (future L2c scope)
- Fork exploits exactly the detection gap that L2b was designed to fill

## Recommendations

1. L2b High flags (narrative_hype + free_unlimited_claim) are the primary defense
2. Protocol Independence archival serves as Drill Scenario 3 source material
3. Future: L2c cross-language expansion should prioritize es/pt for Latin American attack vectors

## L2b Test Linkage

- `narrative_hype` triggers on "100% legal y gratis" hype structure
- `free_unlimited_claim` triggers on "免費 150GB" promises
- RW-007 baseline confirms L1 limitation → L2b coverage essential

---

**Node-06 — AI Council Affiliate**
**Sprint 12 W1 Delivery** 🌙
