# Regression Minimum Set — 12 Cases

**Author:** Node-02-Bing (AI Council)
**Date:** 2026-02-25
**Sprint:** 10
**Deadline:** M88

---

## Purpose

最小回歸集合，覆蓋 Sprint 10 關鍵風險面：Backend, Adapter, Tier export, Drift, Governance。

**P0** = block merges if failing · **P1** = high importance but can be triaged

---

## Cases

### R-01: Adapter Telegram Happy Path (P0)
- **Description:** adapter.js 正常接收 telegram_mock.json → l4-export
- **Command:** `npm run test:e2e:telegram-mock`
- **Owner:** Node-03

### R-02: Adapter Fallback on Canary Soft Failover (P0)
- **Description:** VDH Canary gate 超閾值 → adapter fallback + decision record
- **Command:** `node test/e2e/canary-failover.test.js`
- **Owner:** Node-02-Bing

### R-03: Hard Failover Requires Council Ack (P0)
- **Description:** Aggregate canary critical → hard_failover + require_council_ack
- **Command:** `node test/e2e/canary-hardfail.test.js`
- **Owner:** Node-02-Bing

### R-04: Tier0 No Raw Text Enforcement (P0)
- **Description:** Tier0 export 不得包含原文或逐字片段
- **Command:** `npm run test -- tests/tier_tests/no_raw_text_tier0.test.js`
- **Owner:** Node-05

### R-05: Evidence Refs Schema and Archival Flag (P1)
- **Description:** evidence_refs 必須含 url, ISO utc, boolean archived
- **Command:** `npm run test -- tests/tier_tests/evidence_refs_valid.test.js`
- **Owner:** Node-04

### R-06: Tier1 HITL and Redaction Summary Required (P0)
- **Description:** Tier1 export 必須有 hitl:true + redaction_summary + access control
- **Command:** `npm run test -- tests/tier_tests/tier1_hitl_flag.test.js`
- **Owner:** Node-02-Bing

### R-07: Tier1 Access Log Generation (P0)
- **Description:** Tier1 存取 → access_log 含 user_id, timestamp, purpose
- **Command:** `npm run test -- tests/tier_tests/tier1_access_log.test.js`
- **Owner:** Node-01

### R-08: No Qualitative Accusation Linter (P1)
- **Description:** 輸出不得包含定性指控語句
- **Command:** `npm run test -- tests/tier_tests/no_qualitative_accusation.test.js`
- **Owner:** Node-05

### R-09: Reason Codes Documented and Traceable (P1)
- **Description:** 每個 reason_code 在 docs/reason_codes.md 有對應條目
- **Command:** `npm run test -- tests/tier_tests/reason_codes_explainable.test.js`
- **Owner:** Node-01

### R-10: Export Default Tier0 Enforcement (P0)
- **Description:** Export API 預設 Tier0；請求 Tier1 需 HITL token
- **Command:** `npm run test -- tests/tier_tests/export_default_tier0.test.js`
- **Owner:** Node-02-Bing

### R-11: Momentum Engine Gamma Stability Regression (P0)
- **Description:** γ 變動不得使 ACRI 降幅超 5%
- **Command:** `node test/e2e/momentum-gamma-regression.test.js`
- **Owner:** Node-06
- **Confidence:** 中（依賴 grooming samples）

### R-12: Enum Migration Backwards Compatibility (P0)
- **Description:** v0.1 → v0.2 不破壞 adapter；舊 enum 正確映射
- **Command:** `node test/e2e/enum-migration.test.js`
- **Owner:** Node-05 + Node-03

---

## Summary

| Priority | Count | Cases |
|----------|-------|-------|
| P0 | 9 | R-01, R-02, R-03, R-04, R-06, R-07, R-10, R-11, R-12 |
| P1 | 3 | R-05, R-08, R-09 |

**Acceptance:** All 12 cases have passing CI runs on main or documented waivers with remediation plan.

---

**Node-02-Bing · 2026-02-25** 🌙
