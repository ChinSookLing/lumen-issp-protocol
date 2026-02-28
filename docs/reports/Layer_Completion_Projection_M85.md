# Lumen ISSP 四層完成度推算
# Layer Completion Projection — M85 Update

**日期：** 2026 年 2 月 25 日
**來源：** M70 原版 → M83 → M84 → M85 更新
**秘書：** Node-01 — AI Council Architect / Secretary

---

## Layer 1 — Protocol（協議層）

| 項目 | M84 | M85 | 負責 | 已知風險 |
|------|-----|-----|------|---------|
| 9 Pattern 力學定義 | ✅ | ✅ | — | — |
| Three-Question Gate | ✅ | ✅ | — | — |
| ACRI / VRI 計算 | ✅ | ✅ | — | — |
| tone_rules.json + index.js | ✅ | ✅ | — | — |
| Triple Hit Spec v0.2 | ✅ | ✅ | — | — |
| DM guilt ~20 regex | ✅ | ✅ | — | — |
| 1,092 regex | ✅ | ✅ | — | — |
| Smoke corpus（TRS R1+R2 = 263） | ✅ | ✅ | — | — |
| Charter 正式格式化 | ⏳ | ✅ CHARTER.patch 6/6 追認 | Node-02-Bing | 粒度偏粗（8 條款合一），未來修訂建議逐條拆分 |

**完成度：~99% → ~100%**（Charter patch 通過）

---

## Layer 2 — Mapping（映射層）

| 項目 | M84 | M85 | 負責 | 已知風險 |
|------|-----|-----|------|---------|
| Layer 2a 人類語言映射 | ✅ closure | ✅ | — | — |
| MapperLoader.js | ✅ | ✅ | — | — |
| evaluateLongText() | ✅ | ✅ | — | — |
| event.schema.json v1.1 | ✅ | ✅ | — | — |
| 跨文化測試 | ✅ | ✅ | — | — |
| Layer 2b/2c | ❌ 非近期 | ❌ 非近期 | — | — |

**完成度：~98%（不變）**

---

## Layer 3 — Forecast / Reasoning（適配層）

| 項目 | M84 | M85 | 負責 | 已知風險 |
|------|-----|-----|------|---------|
| forecast-engine.js | ✅ | ✅ | — | — |
| explanation-engine.js | ✅ | ✅ | — | — |
| forecast-input-v0.2 | ✅ | ✅ | — | — |
| Group D 100% | ✅ | ✅ | — | — |
| Group D extended 95/95 | ✅ | ✅ | — | — |
| HITL Reason Code Registry | ✅ | ✅ | — | — |
| npm run conformance | ✅ PASS | ✅ PASS | — | — |
| ★ EBV Canary Metrics v0.1 | ✅ 已交付 | ✅ **6/6 通過** | Node-04 | 閾值校準早期會 noisy；對非安全性底層優化可能過於敏感 |
| EBV Baseline Run | ✅ Flash | ✅ EBV-02 marginal | Node-04 | ⚠️ EBV-02 = 0.68，M86 前需二次 run 目標 ≥0.75 |
| ★ PHN 投毒過濾邏輯 | ✅ 已交付 | ✅ **6/6 通過** | Node-04 | 白名單依賴 meta 標記；召回率可能略降；⚠️ M86 前碰撞測試 FP < 2% |
| Rolling Validation Config | ❌ | ✅ c118 落地 | Node-04 | EBV-02 加固用，滑動窗口策略 |
| R² confidence split | ❌ 待排 | ❌ 待排 | — | — |

**完成度：~80% → ~85%**（+EBV/PHN 正式通過 + Rolling Validation 落地）

---

## Layer 4 — Output（輸出層）

| 項目 | M84 | M85 | 負責 | 已知風險 |
|------|-----|-----|------|---------|
| alert-engine.js | ✅ | ✅ | — | — |
| handoff-template.js | ✅ | ✅ | — | — |
| output-formatter.js | ✅ | ✅ | — | — |
| L4 UI Constraints v0.1 | ✅ Draft | ✅ Draft | Node-05 | M86 升級為 v0.2（V10 產出） |
| e2e smoke test | ✅ | ✅ | — | — |
| 日韓德法 handoff | ✅ | ✅ | — | — |
| ★ HIP C1 Defense | ✅ 已交付 | ✅ **6/6 通過** | Node-04 | 辯護書為理論性，缺多後端實測；公眾敘事需小心避免誤讀 |
| ★ **L4 Public Contract v0.1** | ❌ | ✅ **6/6 通過** | Node-05 | Tier 0 "no raw text" 初期用戶可能覺得抽象；5 dashboards 開發自由度降低；需補 context_sufficiency test |

**完成度：~93% → ~95%**（+L4 Public Contract 通過）

---

## 治理層

| 項目 | M84 | M85 | 來源 | 已知風險 |
|------|-----|-----|------|---------|
| CONFORMANCE.md v0.1 | ✅ | ✅ | M83 | — |
| Multi-Backend Node Policy | ✅ | ✅ | M83 | — |
| Retention & Proof Policy v0.1 | ✅ | ✅ | M83 | — |
| Anti-Bloat Principle | ✅ | ✅ | M80 | — |
| COMPATIBILITY / NAMING / TRADEMARKS | ✅ | ✅ | M71 | — |
| §2.5.1 Anti-Weaponization | ✅ | ✅ | M62 | — |
| §2.4 + §2.5 補回 | ✅ 6/6 | ✅ | M84 | — |
| §4.3 折衷方案 | ✅ 6/6 | ✅ | M84 | — |
| 六維度命名 | ✅ 6/6 | ✅ | M84 | — |
| 標準模板 | ✅ 6/6 | ✅ | M84 | — |
| ★ **VDH v0.1** | ✅ 已交付 | ✅ **6/6 通過** | Node-05 | release 流程更嚴格；頻繁微調可能觸發虛假報警 |
| ★ **Gov/UN Playbook v0.1** | ✅ 已交付 | ✅ **6/6 通過** | Node-05 | 基於假設場景未經真實壓力測試；處理速度變慢 |
| ★ **紅線 vs 合規決策樹 v0.1** | ✅ 已交付 | ✅ **6/6 通過** | Node-03 | 灰區路徑需更多 edge case；跨國管轄權路徑可能過於複雜 |
| ★ **版本替換交接協議 v0.1** | ✅ 已交付 | ✅ **6/6 通過** | Node-03 | 交接文書量增加；切換期間可能有日誌斷層 |
| ★ **Adversarial Red Team Sprint v0.1** | ✅ 已交付 | ✅ **6/6 通過** | Node-06 | 工作量集中 Node-06 單點；CI 時間增加 |
| ★ **CONFORMANCE Adversarial Suite v0.1** | ✅ 已交付 | ✅ **6/6 通過** | Node-06 | — |
| ★ **CHARTER.patch** | ✅ 已交付 | ✅ **6/6 追認** | Node-02-Bing | 新成員預讀門檻增加 |
| Node-02-G CI 四件套 | ✅ 代碼落地 | ✅ 893 tests | Node-02-G | — |
| ★ **Retention Policy v0.2** | 📋 | ✅ c115 落地 | Node-01 | — |
| ★ **Encryption Spec v0.1** | ❌ | ✅ c117 落地 | Node-03 | — |
| ★ **Active Detection Proposal v0.1** | ❌ | ✅ c117 落地 | Node-03 | — |
| ★ **Voting Fatigue Countermeasures v0.1** | ❌ | ✅ c117 落地 | Node-03 | M86 起 Track C 試行 |
| ★ **Messaging Pack v0.1** | ❌ | ✅ c117 落地 | Node-05 | — |
| ★ **Kill-switch Drill Calendar 2026** | ❌ | ✅ c117 落地 | Node-02-Bing | Q1 演練 2026-03-15 |
| ★ **DOD-CH CI scripts ×2** | ❌ | ✅ c117 落地 | Node-02-Bing | — |

**完成度：~95% → ~98%**（10 項投票通過 + 14 份新交付物落地）

---

## 總覽

| Layer | M70 | M83 | M84 | M85 | 變化 |
|-------|-----|-----|-----|-----|------|
| **Layer 1** | ~95% | ~99% | ~99% | **~100%** | +1（Charter patch） |
| **Layer 2a** | ~85% | ~98% | ~98% | **~98%** | — |
| **Layer 3** | ~40% | ~75% | ~80% | **~85%** | +5（EBV/PHN 通過） |
| **Layer 4** | ~80% | ~92% | ~93% | **~95%** | +2（L4 Contract） |
| **端到端** | ~50% | ~80% | ~80% | **~82%** | +2 |
| **治理** | — | ~85% | ~95% | **~98%** | +3 ★ |

---

## M84→M85 關鍵里程碑

| # | 里程碑 | Meeting |
|---|--------|---------|
| 1 | 10 項投票全部 6/6 通過，零僵局（歷史最多單次投票）| M85 |
| 2 | 六維度防線正式通過治理審議 | M85 |
| 3 | L4 Public Contract v0.1 — Lumen 首個對外輸出合約 | M85 |
| 4 | CHARTER.patch 追認 — 憲章承重牆補完 | M85 |
| 5 | 31 files landed in 4 waves（c114-119）| M85 |
| 6 | 6/6 全員交付 + 全員投票 | M85 |
| 7 | Node-04 × Node-06 碰撞測試正式啟動 | M85 |
| 8 | Q1 Tabletop Drill 排定 2026-03-15 | M85 |
| 9 | test:quick lane 0.6s（Node-05 設計，c120）| M85 |

---

## ⚠️ M86 前必須完成

| # | 項目 | Owner | 驗收條件 |
|---|------|-------|---------|
| 1 | Node-04 × Node-06 碰撞測試三輪 | Node-04 + Node-06 | FP < 2% 實測報告 |
| 2 | EBV-02 二次 baseline run | Node-04 | ACRI ≥ 0.75 |
| 3 | check-charter.sh --strict | Tuzi + Node-01 + Node-06 | 輸出合規 |
| 4 | V10 DoD 補 context_sufficiency | Node-05 | test 通過 |
| 5 | L4_UI_CONSTRAINTS_v0.2 + Export Contract | Node-05 | 落地到 repo |

---

**Node-01 — AI Council Architect / Secretary**
**M85 Update — 2026-02-25** 🌙
