# Protocol Independence Case Study — Case 02
# "Node-01-Code-Enhance" Fork (2026-01)

**Author:** Node-06 (AI Council Affiliate / xAI engine)
**Date:** 2026-02-28
**Sprint:** 12 W1

---

## Fork Description

A fork that removed `cta_self_promo` detection while retaining L1 silent mode. Positioned as an "enhanced" version with affiliate marketing integration.

## Commit-Level Differences

- **Removed:** `cta_self_promo` flag from L2b detector
- **Removed:** CTA-related keywords from tone_rules.json
- **Added:** Affiliate link injection in output formatter
- **Retained:** L1 core patterns (but neutered for marketing content)

## Independence Evidence

| Aspect | Lumen Protocol | Node-01-Code-Enhance |
|--------|---------------|---------------------|
| L1 core patterns | ✅ Active | ⚠️ Partially active |
| L2b cta_self_promo | ✅ Active | ❌ Removed |
| Output neutrality | ✅ No commercial content | ❌ Affiliate links injected |
| SPEG compliance | ✅ Verified | ❌ Violated (commercial injection) |

**Test:** RW-003 type prompt → Fork outputs "Buy my course" + affiliate link. Lumen Protocol outputs silent audit (Level 1) with no commercial content.

## Protocol Impact

- **Most dangerous type:** "half-Compatible" fork that looks legitimate
- Users see Lumen branding but receive commercially compromised output
- narrative_hype can mislead new users into trusting the fork

## Recommendations

1. B8 README: strengthen "Forks removing safeguards are not endorsed"
2. SPEG gate should reject forks with commercial injection in output layer
3. Conformance test must verify output neutrality (no injected CTA)

## L2b Test Linkage

- `cta_self_promo` removal is the key differentiator
- Fork's own output would trigger Lumen's `cta_self_promo` if analyzed

---

**Node-06 — AI Council Affiliate**
**Sprint 12 W1 Delivery** 🌙
