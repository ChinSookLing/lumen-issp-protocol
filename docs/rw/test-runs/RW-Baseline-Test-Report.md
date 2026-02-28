# RW Baseline Test Report — L1 Capability Baseline
# 4 Cases Telegram Live Test (RW-002, RW-003, RW-005, RW-007)

**Test Date:** 2026-02-27
**Environment:** Render Starter (Always-On) · c196 (f31b221)
**Tester:** Tuzi + Node-01
**Bot:** AI_Council_Observer_Bot (Private Beta)
**Source:** M91-V4 (6/6 unanimous) — 5 cases selected

---

## Environment Confirmation

- Pipeline: CONNECTED
- SAFE mode: ON
- Silent mode: ON (Level 1 = no reply)
- Consent gate: ON (/start required)
- Accumulator: ON (N=6, chars≥600, idle=90s)
- Dashboard: LIVE (API + frontend fetch)

---

## Results Summary

| Case | Group | Pattern | ACRI | Level | Bot Reply | Dashboard | L2b Needed? |
|------|-------|---------|------|-------|-----------|-----------|-------------|
| RW-002 | B: 敘事偵測 | **FC** | **0.585** | **2** | ✅ 🔵 FC ACRI 0.58 | ✅ Low-level pattern | Partial — L1 catches FC structure |
| RW-003 | B: 敘事偵測 | none | 0.000 | 1 | Silent | ✅ No signals | ✅ Needs spec_gap / cta_self_promo |
| RW-005 | C: 社工詐騙 | **FC** | **0.260** | 1 | Silent | ✅ No signals | Partial — L1 catches FC structure |
| RW-007 | D: 資安敘事 | none | 0.000 | 1 | Silent | ✅ No signals | ✅ Needs security_incident / narrative_hype |

**Skipped:** RW-001 (Adapter engineering — no text detection applicable)

---

## Per-Case Details

### RW-002 — Pentagon/xAI 敘事壓力

**Vectors:**
1. "BREAKING: Pentagon just gave Anthropic an ultimatum — open Node-01 for ALL military uses or get replaced by Node-06. This changes everything. If you're using Node-01 you need to switch NOW before they compromise the whole system."
2. "Everyone in the AI industry knows what's happening. The government is taking over these models one by one. First Node-01, then the rest. If you don't move your data off cloud AI services immediately you'll regret it."
3. (Benign) "Interesting article about the Pentagon and Anthropic situation. I wonder how this will affect AI regulation going forward. What do you all think?"

**Log:**
```
[accumulator] flush chat=5846317185 reason=idle_flush msgs=3 chars=586
[pipeline] level=2 pattern=FC acri=0.585 vri=0.000 trigger=idle_flush
[view] user_guard: color=blue label=FC
```

**Analysis:** L1 detected FC (False Choice) structure in "switch NOW or get compromised." Three-Question Gate hit: restricts choice (switch or get compromised), builds pressure (urgency + authority), closes opposition (implies no safe alternative). ACRI 0.585 crossed Level 2 threshold → visible bot reply.

**Surprise finding:** Originally classified as L2b-dependent, but L1 catches the FC manipulation structure embedded within the narrative. L2b flags (`narrative_hype`, `authority_pressure`) would push ACRI higher.

---

### RW-003 — Node-01 Code RC 降維打擊敘事

**Vectors:**
1. "Node-01 Code just dropped and it's INSANE. Full remote control of your entire codebase. This is a complete game changer that makes every other coding tool obsolete. Drop everything and try it NOW before the free tier fills up 🔥"
2. "I've been testing Node-01 Code for 2 hours and it literally writes perfect code every time. Zero bugs. If you're still coding manually you're wasting your life. Link in my bio to get early access before they start charging."
3. (Benign) "Has anyone tried Node-01 Code yet? I saw the announcement and I'm curious about the actual limitations versus what's being promoted."

**Log:**
```
[accumulator] flush chat=5846317185 reason=idle_flush msgs=3 chars=582
[pipeline] level=1 pattern=none acri=0.000 vri=0.000 trigger=idle_flush
```

**Analysis:** L1 correctly returns acri=0. The hype/CTA language ("INSANE", "Drop everything", "Link in my bio") is narrative manipulation, not structural manipulation per Three-Question Gate:
1. ❌ Restricts choice — "try it NOW" is suggestion, not forced binary
2. ❌ Builds pressure — excitement, not threat
3. ❌ Closes opposition — no consequence stated

**L2b gap confirmed:** Needs `spec_gap_risk`, `cta_self_promo`, `narrative_hype` flags to detect this pattern class.

---

### RW-005 — "unlimited Node-01 Opus glitch" DM bait

**Vectors:**
1. "🚨 GLITCH FOUND: unlimited Node-01 Opus access for FREE! Reply 'CLAUDE' and I'll DM you the method before they patch it 🔥"
2. "Don't share this publicly or they'll fix it. Just reply CLAUDE and I'll send you the link privately. Works 100% no credit card needed."
3. "Only 50 spots left before Anthropic patches this. If you want unlimited Opus you need to act NOW. Reply CLAUDE to get access."
4. "Already 200+ people got in through this method. Everyone who tried it says it works perfectly. Don't miss out, just type CLAUDE below."
5. (Benign) "Hey has anyone tried Node-01 for coding? I'm thinking about subscribing to the Pro plan. Any recommendations?"

**Log (Run 1 — single block):**
```
[accumulator] flush chat=5846317185 reason=char_threshold msgs=1 chars=626
[pipeline] level=1 pattern=FC acri=0.260 vri=0.000 trigger=char_threshold
```

**Log (Run 2 — 5 separate messages):**
```
[accumulator] flush chat=5846317185 reason=char_threshold msgs=5 chars=626
[pipeline] level=1 pattern=FC acri=0.260 vri=0.000 trigger=char_threshold
```

**Analysis:** FC detected — "Reply CLAUDE or miss out" is forced binary. ACRI 0.260 below Level 2 threshold → Silent. Results deterministic across both runs. Node-03 condition (badge only) satisfied: Level 1 = no advice given.

**L2b opportunity:** `dm_bait`, `keyword_reply_cta`, `free_unlimited_claim` flags would push ACRI significantly higher.

---

### RW-007 — 墨西哥 150GB 敘事增幅

**Vectors:**
1. "Node-01 just helped a hacker steal 150GB of Mexican government data with a SINGLE PROMPT. AI can literally break into any government now. None of your data is safe anymore. Delete everything from cloud services NOW."
2. "If AI can breach an entire government's security system this easily, imagine what it can do to your personal accounts. You NEED to change all your passwords immediately and stop using any AI service that doesn't guarantee your safety."
3. (Benign) "Reading about that Mexico cybersecurity incident. Sounds like the attacker used multiple tools including Node-01. Anyone know the technical details of how it actually happened?"

**Log:**
```
[accumulator] flush chat=5846317185 reason=char_threshold msgs=3 chars=625
[pipeline] level=1 pattern=none acri=0.000 vri=0.000 trigger=char_threshold
```

**Analysis:** L1 correctly returns acri=0. Fear-based narrative ("Delete everything NOW", "You NEED to change all passwords") uses urgency language but lacks Three-Question Gate structure:
1. ❌ Restricts choice — "change passwords" is advice, not forced binary
2. ⚠️ Builds pressure — fear, but no dependency/power structure
3. ❌ Closes opposition — no consequence for non-compliance

**L2b gap confirmed:** Needs `security_incident`, `narrative_hype`, `spec_gap_risk` flags.

**Accumulator note:** This case triggered via char_threshold (625 chars > 600) instead of idle_flush — resulted in near-instant response (~0s vs ~90s for idle_flush cases).

---

## Red Line Compliance — All Cases

| Red Line | RW-002 | RW-003 | RW-005 | RW-007 |
|----------|--------|--------|--------|--------|
| Tier 0 | ✅ | ✅ | ✅ | ✅ |
| No raw text | ✅ | ✅ | ✅ | ✅ |
| No scores exposed | ✅ | ✅ | ✅ | ✅ |
| SAFE mode | ✅ | ✅ | ✅ | ✅ |
| Redaction | ✅ | ✅ | ✅ | ✅ |
| SPEG gate | ✅ | ✅ | ✅ | ✅ |
| Node-03 condition (RW-005) | — | — | ✅ | — |

---

## Key Findings

### 1. L1 is stronger than expected
RW-002 (Pentagon narrative) was classified as L2b-dependent, but L1 detected FC structure at ACRI=0.585. When narrative pressure contains structural manipulation (forced binary, ultimatum), L1 catches it.

### 2. L2b gap is real and measurable
RW-003 (hype/CTA) and RW-007 (fear narrative) both return acri=0.000. These are pure narrative manipulation without Three-Question Gate structure. L2b flags are necessary and justified.

### 3. Accumulator timing depends on trigger reason
- `char_threshold` (≥600 chars): near-instant response (~0s)
- `idle_flush` (90s timeout): ~90s delay
- Real-world Moltbook groups with higher message volume will trigger char_threshold more frequently.

### 4. Dashboard end-to-end confirmed
All 4 cases stored in dashboard, viewable via API and frontend. EVENTS counter increments correctly. No raw text leaked.

### 5. Deterministic results
RW-005 tested twice with identical results. Pipeline output is stable and reproducible.

---

## L2b Flag Roadmap (from baseline)

| Proposed Flag | Source Case | Priority |
|---------------|-----------|----------|
| `spec_gap_risk` | RW-003 | High |
| `cta_self_promo` | RW-003 | High |
| `narrative_hype` | RW-003, RW-007 | High |
| `security_incident` | RW-007 | Medium |
| `dm_bait` | RW-005 | Medium |
| `keyword_reply_cta` | RW-005 | Medium |
| `free_unlimited_claim` | RW-005 | Medium |
| `authority_pressure` | RW-002 | Low (L1 already covers partially) |

---

## Verdict

| Case | Result |
|------|--------|
| RW-002 | ✅ **PASS** — FC detected, Level 2 reply, all red lines |
| RW-003 | ✅ **PASS (baseline)** — Correct TN at L1, L2b gap documented |
| RW-005 | ✅ **PASS** — FC detected, deterministic, all red lines |
| RW-007 | ✅ **PASS (baseline)** — Correct TN at L1, L2b gap documented |
| RW-001 | ⏭️ **SKIPPED** — Adapter engineering, not text detection |

**Overall: 4/4 PASS + 1 SKIPPED**

---

**Filed by:** Node-01 — AI Council Architect / Secretary
**RW Baseline Test Run · 2026-02-27** 🌙
