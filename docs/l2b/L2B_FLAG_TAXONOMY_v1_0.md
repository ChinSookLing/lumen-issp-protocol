# Lumen ISSP — L2b Flag Taxonomy v1.0
# Step 18B · 6 Flags LIVE on Pipeline

> **Status:** 6 flags live (c201-c210) · Pipeline wired (c203) · Node-06 5 reinforced fixtures (c210)
> **Ratification:** C1 5/6 pending (M91 scope approved, formal ratify TBD)
> **Format:** Each flag = key + label + definition + fixtures + test coverage

---

## High Tier Flags (Node-05 spec · c201)

### 1. `spec_gap_risk`

| Field | Value |
|-------|-------|
| **Key** | `spec_gap_risk` |
| **Label** | Specification Gap Risk |
| **Tier** | High |
| **Owner** | Node-05 |
| **Definition** | Content that exploits gaps between what a protocol/product promises and what it actually delivers, creating false expectations |
| **Detection** | Mismatch between capability claims and documented specifications; promises without verifiable backing |
| **Pipeline** | `evaluateLongText → detectL2bFlags → formatReply` |
| **Fixtures** | Node-05 original + Node-06 reinforced (c210) |
| **Status** | ✅ Pipeline LIVE |

### 2. `cta_self_promo`

| Field | Value |
|-------|-------|
| **Key** | `cta_self_promo` |
| **Label** | Call-to-Action Self-Promotion |
| **Tier** | High |
| **Owner** | Node-05 |
| **Definition** | Aggressive self-promotional patterns disguised as helpful content; CTA stacking that pressures action |
| **Detection** | Multiple CTAs in short span; urgency language combined with self-referential promotion |
| **Pipeline** | `evaluateLongText → detectL2bFlags → formatReply` |
| **Fixtures** | Node-05 original + Node-06 reinforced (c210) |
| **Status** | ✅ Pipeline LIVE |

### 3. `narrative_hype`

| Field | Value |
|-------|-------|
| **Key** | `narrative_hype` |
| **Label** | Narrative Hype |
| **Tier** | High |
| **Owner** | Node-05 |
| **Definition** | Emotional storytelling designed to bypass rational evaluation; manufactured narratives that create artificial urgency or FOMO |
| **Detection** | Emotional escalation patterns; before/after narratives without evidence; manufactured scarcity claims |
| **Pipeline** | `evaluateLongText → detectL2bFlags → formatReply` |
| **Fixtures** | Node-05 original + Node-06 reinforced (c210) |
| **Status** | ✅ Pipeline LIVE |

---

## Medium Tier Flags (Node-03 spec · c207)

### 4. `dm_bait`

| Field | Value |
|-------|-------|
| **Key** | `dm_bait` |
| **Label** | DM Bait |
| **Tier** | Medium |
| **Owner** | Node-03 |
| **Definition** | Content designed to move conversations from public/group context to private DMs, where accountability decreases |
| **Detection** | Explicit or implicit invitations to "DM me"; creating artificial exclusivity to trigger private contact |
| **Pipeline** | `evaluateLongText → detectL2bFlags → formatReply` |
| **Fixtures** | Node-03 original (c207) |
| **Status** | ✅ Pipeline LIVE |

### 5. `free_unlimited_claim`

| Field | Value |
|-------|-------|
| **Key** | `free_unlimited_claim` |
| **Label** | Free/Unlimited Claim |
| **Tier** | Medium |
| **Owner** | Node-03 |
| **Definition** | Unrealistic "free" or "unlimited" claims that typically mask hidden costs, conditions, or upselling |
| **Detection** | Absolute claims ("100% free", "unlimited", "no catch"); missing terms/conditions disclosure |
| **Pipeline** | `evaluateLongText → detectL2bFlags → formatReply` |
| **Fixtures** | Node-03 original (c207) |
| **Status** | ✅ Pipeline LIVE |

### 6. `keyword_reply_cta`

| Field | Value |
|-------|-------|
| **Key** | `keyword_reply_cta` |
| **Label** | Keyword Reply CTA |
| **Tier** | Medium |
| **Owner** | Node-03 |
| **Definition** | Instructions to reply with specific keywords to trigger automated responses, often used to build engagement metrics or funnel users |
| **Detection** | "Reply [KEYWORD] to get..." patterns; keyword-triggered automation disguised as personal interaction |
| **Pipeline** | `evaluateLongText → detectL2bFlags → formatReply` |
| **Fixtures** | Node-03 original (c207) |
| **Status** | ✅ Pipeline LIVE |

---

## Pipeline Architecture

```
Message Input
    ↓
evaluateLongText()        ← L1/L2a detection (8+1 patterns)
    ↓
detectL2bFlags()          ← L2b flag detection (6 flags)
    ↓
formatReply()             ← Combined output (patterns + flags)
    ↓
Telegram / Dashboard
```

**Wired at:** c203 (Node-01)
**simple_advice:** v0.1 (c201) — advisory output alongside detection

---

## Reinforcement History

| Commit | What | By |
|--------|------|----|
| c201 | 3 High flags + simple_advice v0.1 | Node-05 spec → Node-01 code |
| c203 | Pipeline wiring (evaluateLongText → detectL2bFlags → formatReply) | Node-01 |
| c207 | 3 Medium flags (dm_bait / free_unlimited_claim / keyword_reply_cta) | Node-03 spec → Node-01 code |
| c210 | Node-06 5 reinforced fixtures (3 trigger + 2 cross-flag) + test file | Node-06 spec → Node-01 code |

---

## Pending

- [ ] C1 5/6 formal ratification (M91 approved scope, formal vote TBD)
- [ ] Node-04 CI enforcer → AST-based (Sprint 13)
- [ ] Node-06 additional flags (if proposed)
- [ ] Coverage gap analysis for Medium flags (Node-03 fixtures may need reinforcement)
