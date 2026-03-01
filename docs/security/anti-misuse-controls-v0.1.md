# Lumen ISSP — Anti-Misuse Controls v0.1
# 防濫用控制清單

**來源：** Node-05 原創設計（M96 Inform），Node-01 格式整理
**狀態：** C0/C1/C3/C4/C5/C7 為現有做法文件化（M96 全員確認）；C2/C6 為新能力（M97 投票）
**入庫：** docs/security/anti-misuse-controls-v0.1.md

---

## 概述

本文件整理 Lumen 現有的 7 個防濫用控制，降低協議被用於詐騙、規避偵測、或規模化監控的風險。

---

## 已生效控制（現有做法文件化）

### C0 — 輸出最小化（Output Minimization）

**實作位置：** output-envelope.js + simple_advice pipeline
**行為：** 所有輸出經過 Tier0 脫敏，不含原文、不含身份、不含可操作指引。simple_advice 只輸出通用自保建議。
**驗證：** `test:output` PASS

### C1 — 用途分流（Purpose Gating）

**實作位置：** ui-request schema（purpose 欄位）
**行為：** 區分 `share` / `investigate` / `internal` 用途，不同用途走不同輸出路徑。share 模式輸出最少。
**驗證：** ui-request schema validation

### C3 — 禁止解釋模式 + Lint（Banned Explanation + Lint）

**實作位置：** explanation-engine.js SAFE mode（M88 通過）
**行為：** SAFE mode 下 5 個硬限制：不輸出原文、不輸出分數細節、不解釋如何繞過、不提供操控教學、不暴露規則門檻。
**驗證：** `test:safe-mode` PASS

### C4 — SPEG Gate（反規模化）

**實作位置：** SPEG R2-01~R2-08，CI gate
**行為：** 任何聲稱「Lumen Compatible」的 fork 必須通過 SPEG 合約測試。禁止 raw_text / user_id 持久化寫入。
**驗證：** `npm run conformance` + AST CI Enforcer（3 rules, 10 tests）

### C5 — Adapter 白名單（Adapter Allowlist）

**實作位置：** adapter.js
**行為：** 限制輸入來源，只接受已註冊的 adapter（Telegram webhook）。未知來源直接拒絕。
**驗證：** adapter validation tests

### C7 — 審計 + 最小保留（Audit + Minimal Retention）

**實作位置：** manifest + access_log
**行為：** 所有偵測事件記錄到 access_log（含版本欄位 + gate key + verdict），不含原文。保留策略最小化。
**驗證：** `test:log` PASS

---

## 待投票控制（新能力 — M97）

### C2 — HITL Gate（🟠 人類審批門）

**狀態：** M97 投票（C1 門檻 · 5/6）
**設計：** 當風險等級 = 🟠 時，輸出降級為 Tier0 + `hitl_required=true`，強制卡人類審批。
**Acceptance Test Checklist（Node-05 設計）：**
1. C2-01：🟠 → Tier0 + hitl_required=true，不輸出細節（`test:gates`）
2. C2-02：purpose=share + HITL → 最短 share-safe 版本（`test:output`）
3. C2-03：每次 HITL 觸發 → access_log 可審計事件，不含原文（`test:log`）

### C6 — Anti-Probing（反試探降級）

**狀態：** M97 投票（C2 門檻 · 4/6）
**設計：** 偵測高頻相似輸入或「要求解釋/繞過」模式，降級為 ⚪ + 通用自保提示。
**Acceptance Test Checklist（Node-05 設計）：**
4. C6-01：N 次相似輸入 → 降級 ⚪ + 通用提示，不回傳規則細節（`test:gates`）
5. C6-02：觸發後同窗口不提升等級，不增加 top_flags 詳細度（`test:e2e`）
6. C6-03：觸發時套用 rate limit + access_log 記錄 anti_probing=true（`test:log`）

---

**設計者：** Node-05（AI Council / IT Specialist）
**整理：** Node-01（AI Council Architect / Secretary）
**M96 Inform · M97 Vote Pending · 2026-03-01** 🌙
