# Changelog

All notable changes to Lumen ISSP will be documented in this file.

## [1.0.0] — Unreleased (Sprint 13 Target)

### Protocol Launch 🛡️

Lumen ISSP v1.0 — the first open-source protocol for detecting cognitive manipulation structures in communication.

### Architecture
- **Dual-channel detection:** Push (ACRI) + Vacuum (VRI)
- **Four-layer pipeline:** L1 Protocol → L2 Mapping → L3 Forecast → L4 Output
- **9 L1 Patterns:** DM, FC, MB, EA, EP, GC, IP, VS + Class-0 Omission Dynamics
- **6 L2b-lite Flags:** spec_gap_risk, cta_self_promo, narrative_hype, dm_bait, free_unlimited_claim, keyword_reply_cta
- **Three-Question Gate:** Patterns must hit ≥2 criteria to trigger
- **90 rule vectors:** 10 patterns × en/zh

### Components
- `core/evaluator.js` — L1 detection engine with evaluateLongText cross-chunk merge
- `src/pipeline/dispatcher.js` — Four-layer pipeline dispatcher
- `src/pipeline/l2b-lite-detector.js` — L2b flag detection (keyword cluster matching)
- `src/forecast/forecast-engine.js` — L3 trend computation
- `src/output/alert-engine.js` — L4 alert classification
- `src/output/output-formatter.js` — L4 output formatting
- `src/output/handoff-template.js` — Structured hand-off for Level 3+
- `src/explanation/safe-mode.js` — SAFE mode with 5 hard limits
- `src/telegram/webhook-server.js` — Telegram bot adapter + consent gate
- `src/telegram/accumulator.js` — Multi-turn message accumulation
- `src/dashboard/` — Real-time observation dashboard (Tier 0 read-only)
- `config/simple_advice_templates.v0.1.json` — 🔵🟡🟠 three-tier advice

### Governance
- Charter §2.8/§2.9 merged (M91)
- Charter §2.10 Responsibility Boundary (M93 B2)
- Charter §2.11 Safety Baseline (M93 B3)
- Charter §12.1 Protocol Continuity (M93 B1)
- Charter §12.2 Dead Man's Switch (M93 B4)
- Emergency Access Package manifest (M93 B6)
- README position statement — bilingual zh/en (M93 B8)
- SPEG six-dimension defense (R2-01 through R2-08)
- Apache-2.0 License

### Testing
- 1,344+ tests, 0 fail, 0 false positives
- 16 L2b-lite detection tests (trigger + non-trigger × 6 flags)
- Conformance PASS (full pipeline)
- RW Baseline 4/4 PASS
- CI: regression + nightly perf + online smoke

### Deployment
- Telegram Bot: webhook + /start consent gate + privacy statement
- Dashboard: LIVE on Render (Starter Always-On)
- DASHBOARD_TOKEN auth guard

### AI Council
- 93 meetings completed (target: 500)
- 208 commits
- 6 Affiliates: Node-05, Node-03, Node-04, Node-02, Node-06, Node-01
- Tabletop Drill scheduled: rehearsal 3/10, formal 3/15

---

**Lumen detects manipulation mechanics — structures, not words.**
**Anyone can verify. Anyone can deploy. No one can unilaterally shut it down.**

🌙
