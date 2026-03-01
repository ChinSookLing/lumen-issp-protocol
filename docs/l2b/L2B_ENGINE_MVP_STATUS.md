# Lumen ISSP — L2b Engine MVP (2b-lite) Status
# Step 19B · Pipeline LIVE

> **Engine:** detectL2bFlags() — rule-based flag detection
> **Status:** LIVE on pipeline (c203) · 6 flags active · simple_advice v0.1
> **Scope:** 2b-lite = rule-based flags. 2b-full (IR/OTA) = future.

---

## 1. Engine Architecture

```
┌─────────────────────────────────────────┐
│            index.js (main)              │
│                                         │
│  evaluateLongText(text)                 │
│    ├── L1: tone_rules.json matching     │
│    ├── L2a: language mapping pipeline   │
│    └── L2b: detectL2bFlags(text) ←─── NEW│
│              ├── spec_gap_risk          │
│              ├── cta_self_promo         │
│              ├── narrative_hype         │
│              ├── dm_bait               │
│              ├── free_unlimited_claim   │
│              └── keyword_reply_cta     │
│                                         │
│  formatReply(results)                   │
│    ├── Pattern detections (L1/L2a)      │
│    ├── Flag detections (L2b)            │
│    └── simple_advice (v0.1)             │
└─────────────────────────────────────────┘
```

---

## 2. Detection Flow

1. **Input:** Full message text from Telegram adapter
2. **L2b Scan:** `detectL2bFlags(text)` runs all 6 flag checks
3. **Output:** Array of triggered flags with confidence scores
4. **Merge:** Combined with L1/L2a results in `formatReply()`
5. **Display:** Telegram reply + Dashboard counter

### Flag Detection Logic

Each flag uses pattern matching against:
- Keyword combinations (not single keywords — per Three-Question Gate)
- Structural indicators (sentence patterns, CTA stacking, etc.)
- Context signals (public vs DM invitation, claim absoluteness, etc.)

**Critical principle:** Three-Question Gate still applies. A single flag ≠ manipulation. Flags are advisory signals, not verdicts.

---

## 3. simple_advice v0.1

When flags are detected, Lumen provides brief advisory text:

```
⚠️ Flag: spec_gap_risk
💡 Advisory: Claims may not match documented specifications.
   Consider checking the official documentation or terms.
```

**Design rules:**
- Advisory only, never accusatory
- Always suggests verification action
- Never blocks or censors content
- Operator can disable via config

---

## 4. Test Coverage

| Area | Tests | Status |
|------|-------|--------|
| 3 High flags (Node-05) | Original + Node-06 reinforced fixtures | ✅ PASS |
| 3 Medium flags (Node-03) | Original fixtures | ✅ PASS |
| Cross-flag interactions | 2 Node-06 cross-flag fixtures (c210) | ✅ PASS |
| Pipeline wiring | evaluateLongText → detectL2bFlags → formatReply | ✅ PASS |
| simple_advice output | Advisory text format validation | ✅ PASS |
| Total repo | 1,344 tests · 0 fail · 0 FP | ✅ |

---

## 5. Known Limitations (Engine Inherent Limits)

Per G01 bypass analysis and M44 flagging:

1. **Rule-based ceiling:** 2b-lite is pattern matching, not semantic understanding. Some sophisticated manipulation will bypass.
2. **Medium coverage may be thin:** Sprint 3 GV expansion strengthened medium-strength cases to pass, potentially leaving thin medium coverage.
3. **No multi-turn context:** 2b-lite evaluates single messages. Session-level patterns require L2c (Step 23B).
4. **Language dependency:** Current rules optimized for Chinese + English. Other languages need mapping.

These are **expected limitations** of 2b-lite, not bugs. 2b-full (with IR/OTA capabilities) is the long-term path.

---

## 6. Sprint 13 Planned Work

- [ ] Node-04 CI enforcer → AST-based architecture validation
- [ ] Node-06 review of CI enforcer PR
- [ ] Coverage gap analysis for Medium flags
- [ ] Additional reinforcement fixtures if needed
- [ ] Formal C1 5/6 ratification of L2b scope

---

## 7. Commit History

| Commit | What | By |
|--------|------|----|
| c201 | 3 High flags + simple_advice v0.1 | Node-05 spec → Node-01 code |
| c203 | ★ Pipeline wiring (core integration) | Node-01 |
| c207 | ★ 3 Medium flags | Node-03 spec → Node-01 code |
| c208 | Protocol Independence Case Studies ×3 | Node-06 spec → Node-01 code |
| c210 | Node-06 5 reinforced fixtures | Node-06 spec → Node-01 code |
