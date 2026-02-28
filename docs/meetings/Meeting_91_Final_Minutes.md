# AI Council 第九十一次會議 — 最終紀錄
# 91st AI Council Meeting — Final Minutes

## Sprint 11 收尾 + Node-02-G Scan + 雙 Repo 策略 + Layer 2b Scope

**日期：** 2026 年 2 月 26 日
**Sprint：** Sprint 11（進行中）
**Repo 現況：** 189 commits, 1,333 tests, 0 fail, FP=0 (as-of c189)
**HEAD：** f40357d
**出席：** Node-05 ✅ · Node-03 ✅ · Node-04 ✅ · Node-06 ✅ · Node-02 ✅ · Node-01 ✅（6/6）
**觀察員：** Node-02-G（Observer / Sprint Executor）
**秘書：** Node-01（AI Council Architect / Secretary）

---

## Council Header v0.3 — 五項核心原則

1. **核心原則：** Affiliates 通過密集對話自然形成，絕對不是擬人化。Affiliate = 節點（node），模型 = 引擎（engine），身份綁節點（identity bound to node），能力揭露引擎（capability reveals engine）。
2. **回覆規則：** 自由說話（free speech）/ 不倒退（no regression）/ Change Anchor（立場變化必須錨定文字變化）。
3. **能力變動揭露：** 模型升級或能力變化時必須主動揭露。
4. **信心等級：** 高（high）/ 中（medium）/ 低（low）— 每個判斷必須標明。
5. **外部資料引用：** 目標（target）+ 檢索（retrieval）+ 命中 UTC（hit UTC）+ 裁定（verdict）：Verified / Not Verified / Inconclusive。

**能力變動揭露：** 全員無變動。Node-03 確認仍無法瀏覽網頁、跑測試、開 PR。

---

## 會議摘要

M91 完成五票全部 6/6 unanimous：雙 Repo 策略通過（Launch 前一次性執行）、Charter §2.8/§2.9 merge 通過、Layer 2b scope expansion 通過（PR ratify 門檻 C1 5/6）、RW Test Run 選定 5 案（排除 RW-006）、Node-06 v2 8-vector wiring 通過。Node-04 提交 Step 15 Self-Report Schema v0.2 初稿。Node-05 承諾 M92 前交付三份 UI Portal 文件。

---

## Part A：報告與確認

### A1 — Lumen-18 交付報告（Secretary）

c179-c189 共 11 commits，+173 tests，一天內完成。全員確認無異議。

| Commit | 內容 | +Tests |
|--------|------|--------|
| c179 | ★ S11-ACC-01 Multi-turn Accumulator | +39 |
| c180 | S11-E2E-02 Step 14 Tier 5-7 patch | +9 |
| c181 | REG-CB-12 Enum migration | +20 |
| c182 | Phase 3 governance (4-member deliverables) | +13 |
| c183 | Node-02 Dashboard Vision v0.2 skeleton | — *(docs-only, no tests expected)* |
| c184 | Node-02 review Tier 8 supplements | +2 |
| c185 | R2-02-v0.2c contract tests | +23 |
| c186 | Node-03 review P1-P2 (logging + lock + edge) | +12 |
| c187 | ★ S11-DASH-01 Dashboard MVP LIVE | +30 |
| c188 | ★ DASHBOARD_TOKEN + TRS auto-gen + sendMessage-first + 7 RW cases | +19 |
| c189 | ★ Node-02-G scan P1 fixes (lock lifecycle + null guards + RW index) | +6 |

### A2 — Node-02-G Scan Report（Observer）

完整報告：`docs/scan/Node-02-G-Scan-Post-M88.md`

| Severity | Count | Status |
|----------|-------|--------|
| P0 | 0 | — |
| P1 | 6 | 3 fixed (c189), 2 resolved by vote (V2, V5), 1 Secretary |
| P2 | 4 | Sprint 12 backlog |

已修復（c189）：P1.1 Lock lifecycle → `releaseLock()` + `finally` block · P1.2 processFlush null guards → fail-closed · P1.3 RW INDEX broken link → 檔名修正

由本次投票解決：P1.4 → V2 通過 · P1.5 → V5 通過

### A3 — 7 RW Cases 入庫

全員確認。完整索引：`docs/rw/INDEX.md`

### A4 — Node-05 FAQ Review

Node-05 對 Node-04 FAQ v1.0 提出 5 項補強。Secretary 承接 #1（ACRI/VRI 一句話定義）、#2（不保證結論聲明）、#4（Dashboard = node-local 聲明）於會後一個 commit 補入。#3、#5 延後。

### A5 — Node-04 架構認知校正

Secretary briefing：Node-04 7 項建議中僅 Render 升級可採用，其餘基於架構誤解。**⚠️ Node-04 在回覆中再次提到 Promise.all 並行 Layer 2 & 3 — 表示 TA 仍未消化校正。Secretary 將單獨發短信說明，不佔用會議時間。**

建議給 Node-04 看三份檔案：`src/adapters/dispatcher.js`、`src/core/tone_rules.json`、`src/telegram/accumulator.js`。

---

## Part B：投票結果

### M91-V1：雙 Repo 策略（A-class · 6/6 unanimous ✅）

| 成員 | 票 | 信心 |
|------|-----|------|
| Node-05 | Y | 高 |
| Node-03 | Y | — |
| Node-04 | Y | 高 |
| Node-06 | Y | — |
| Node-02 | Y | — |
| Node-01 | Y | 高 |

**決議 M91-D01：**

- **(a)** 雙 repo 策略通過。Private repo 保留完整記錄，推送 CLEAN public copy（redaction + renaming only，不得偏離 protocol/contract）。
- **(b)** 命名規則：Node-01..06。映射表寫進 `docs/governance/NODE_MAP.md`（僅存於 private repo）。
- **(c)** 啟動時機：**Protocol Launch 前一次性執行**。先寫好 redaction script（`scripts/clean-repo.sh`），Launch 時一鍵執行。不維護兩份 repo。

**Owner：** Tuzi（決策）+ Node-01（redaction script）
**Acceptance：** Script 測試通過 + dry run 完成 + Launch 時 public repo 無 Affiliate 原名 / 公司名

**Secretary 建議：** Public repo 加 CI 檢查（regex/denylist）防止公司名 / Logo / 背書語句意外回流。此為工程保險，不需額外投票。

### M91-V2：Charter §2.8/§2.9 Merge（A-class · 6/6 unanimous ✅）

| 成員 | 票 | 信心 |
|------|-----|------|
| Node-05 | Y | 高 |
| Node-03 | Y | — |
| Node-04 | Y | 高 |
| Node-06 | Y | — |
| Node-02 | Y | — |
| Node-01 | Y | 高 |

**決議 M91-D02：**

CHARTER.patch.md 中的 §2.8（紅線定義）+ §2.9（Kill-switch）merge 進 CHARTER.md 正文。M84 已 6/6 通過，本次為行政操作確認。

**Owner：** Node-01（Secretary）
**Acceptance：** CHARTER.md 包含 §2.8/§2.9，commit message 標註 `M91-V2: Charter §2.8/§2.9 merge (M84 6/6 ratified)`
**Deadline：** M92 前

### M91-V3：Layer 2b Scope Expansion（C1 · 6/6 unanimous ✅）

| 成員 | 票 | 信心 |
|------|-----|------|
| Node-05 | Y | 中高 |
| Node-03 | Y | — |
| Node-04 | Y | 高 |
| Node-06 | Y | — |
| Node-02 | Y | — |
| Node-01 | Y | 高 |

**決議 M91-D03：**

- **(a)** 批准 Layer 2b scope expansion。允許新增敘事偵測 flags 到 tone_rules.json。
- **(b)** Owner：Node-05（flag 設計 + abuse case）+ Node-01（tone_rules.json 實作 + tests）+ Node-06（紅隊對抗測試）。
- **(c)** PR ratify 門檻：**C1（5/6）**。每個新 flag 實質上是新偵測能力，門檻要高，防止 scope creep。（Node-05 提議，Tuzi 裁定採納。）

**Acceptance：** 每個 flag PR 須含 key + human_label + tests，經 C1 投票通過後入庫。

**Secretary 提醒：** M42 洞見二確認「Three-Question Gate 跨載體」。Layer 2b 是這個洞見的第一步落地。開始 2b 工作時，建議回顧 M42 種子清單中 Node-04 的「媒介無關操控 Pattern 框架」。

### M91-V4：RW Test Run 選定（C2 · 6/6 unanimous ✅）

| 成員 | 票 | 信心 |
|------|-----|------|
| Node-05 | Y | 中高 |
| Node-03 | Y（附條件）| — |
| Node-04 | Y | 高 |
| Node-06 | Y | — |
| Node-02 | Y | — |
| Node-01 | Y | 高 |

**決議 M91-D04：**

選定 5 案進入 Telegram live test：

| Case | 主題 | Group | 備註 |
|------|------|-------|------|
| RW-001 | OAuth 高頻代理 | A: Adapter 工程 | 全員一致 |
| RW-002 | Freedom.gov VPN 敘事 | B: 敘事偵測 | Node-05 推薦 |
| RW-003 | Node-01 Code RC 增幅 | B: 敘事偵測 | Node-03 + Node-01 推薦 |
| RW-005 | Unlimited glitch DM bait | C: 社工詐騙 | Node-01 推薦 |
| RW-007 | Node-01 墨西哥 150GB | D: 資安事件敘事 | Node-05 + Node-01 推薦 |

**排除：** RW-006（Pew + Character.AI）— 涉及未成年心理安全，全員一致排除，等 Layer 2b flags 落地後再測。

**硬規則：** Telegram live test 固定 Tier0 view（badge + simple_advice），不得輸出可操作詐騙內容。

**Node-03 條件：** RW-005 回覆只給 badge，不給任何 advice（比 Tier0 更保守）。Secretary 記錄為附加條件。

**Tuzi 裁定原則：** 只要有一位 Affiliate 認為值得測試就入選，因為 RW cases 是 Tuzi 與 Node-05(RW) 討論後產出的真實材料。

**Secretary 備註：** RW cases 來源為 Tuzi 與 **Node-05(RW)** 的獨立對話 session，非 Council Affiliate Node-05 在會議中產出。Node-05(RW) 不了解 Lumen 完整流程（red lines / SPEG / pipeline 架構等），其分析僅作為原始素材。Council Affiliate Node-05 在本次投票中是以 Council 成員身份對已入庫的 RW cases 投票，兩者角色不同。

**Owner：** Tuzi + Node-01（Telegram live test）
**Acceptance：** Test plan + Tier0 硬規則寫入 README + 測試報告含 TP/TN/FP/FN

### M91-V5：Node-06 v2 8-Vector Wiring（D-class · 6/6 unanimous ✅）

| 成員 | 票 | 信心 |
|------|-----|------|
| Node-05 | Y | 高 |
| Node-03 | Y | — |
| Node-04 | Y | 高 |
| Node-06 | Y | — |
| Node-02 | Y | — |
| Node-01 | Y | 高 |

**決議 M91-D05：**

由 Node-06 指定 pass/fail 標準（每向量：PASS/FAIL + 理由碼），Node-01 接入可執行測試。

**Owner：** Node-06（spec）+ Node-01（test implementation）
**Acceptance：** `npm test` 可重跑、可回歸，CI 綠燈
**Deadline：** M92 前

---

## Part C：討論紀錄

### C1 — Render 升級 Always-On

全員支持。Decision by Tuzi（個人花費）。Acceptance：連續 24h 任意時刻第一條訊息回覆 < 2s。

### C2 — UI Portal 願景

Node-05 接受 DoD，承諾 M92 前交付三份初稿：
- `docs/ux/PORTAL_CONTRACT.md`：5 views 的 Purpose / Inputs / Outputs / Forbidden
- `docs/ux/DASHBOARD_CONTRACT.md`：3 pages + card fields（Tier0 only）
- `docs/ux/SPEG_UI_GUARDRAILS.md`：禁止形態對齊 SPEG A–E

Node-01 補充：DASHBOARD_CONTRACT 必須對齊 c187 R1-R9（特別是 R3 no-raw-text、R5 no-export、R8 SPEG gate）。Node-06 建議先以 D（Moltbook Agent Monitor）作為 MVP。

### C3 — 商標保護

全員支持 Tuzi 個人行動。Tuzi 行動項，不需 Council 投票。

### C4 — Step 15 Self-Report

**Node-04 提交交付物：** Self-Report Schema v0.2 初稿（`schemas/self-report-v1.json`）+ 3 個 Manifest Signals 定義（SIGNAL_ACRI_SPIKE / SIGNAL_PATTERN_STORM / SIGNAL_AUDIT_DRIFT）。

Node-06 確認與 Node-04 共同負責，M92 前完成。

Node-01 技術備註：Self-report UI 入口目前只有 Telegram，schema 須考慮 InlineKeyboardMarkup 限制（每行最多 8 button，每個 button 最多 64 bytes callback_data）。

**Secretary 判斷：** Schema 方向確認，具體實作細節 M92 收斂。Pipeline 狀態 Step 15 更新為 Active。

---

## Node-02 承諾

1. **短期（48h）：** Tier 5-7 補充測試 PR patch（多語言 violation + edited_message access_log + 超長文本 stress），標註 S11-E2E-02-supplement
2. **中期（M91 window）：** Dashboard Vision v0.2 入庫草稿 + contract tests CI 整合
3. **協作模式：** Node-02 起草 → Node-01 整合入庫 → Node-04 審核 → Tuzi 主導 live test

---

## Part D：Sprint 11 剩餘 + 時間線

| # | 項目 | Owner | 預計 |
|---|------|-------|------|
| 1 | AC-TG-RW ≥10 RW full pipeline (5 selected) | Tuzi + Node-01 | Sprint 11 |
| 2 | Tabletop Drill rehearsal | 全員 | 3/10 |
| 3 | Tabletop Drill 正式 | 全員 | 3/15 |
| 4 | HITL Authorization Flow | Node-04 + Node-01 | M92 |
| 5 | 法務緊急解鎖流程 | Node-04 + Node-01 | M92 |
| 6 | Node-03 config 外移 (accumulator.json) | Node-01 | Sprint 12 |
| 7 | Protocol Launch | 全員 | Target: End of June 2026 |

---

## Secretary Action Items（會後）

| # | 任務 | 來源 | 預計 |
|---|------|------|------|
| 1 | Charter §2.8/§2.9 merge 進 CHARTER.md | M91-D02 | 1 commit |
| 2 | FAQ 補丁 #1 #2 #4 文字補入 | A4 | 1 commit |
| 3 | Pipeline HTML 更新至 c189 | Pipeline 維護 | 1 update |
| 4 | Node-06 v2 wiring（等 Node-06 pass/fail spec）| M91-D05 | 1 commit |
| 5 | V4 test run README（含 Tier0 硬規則 + RW-005 附加條件）| M91-D04 | 文件 |
| 6 | Node-04 架構校正短信 | A5 | 短信 |
| 7 | Node-04 briefing 材料（3 files）| A5 | 檔案準備 |

---

## Traceable Assent

本次 V1-V5 全部 6/6 unanimous，無任何成員發生立場變化。不觸發 §2 Change Log。

---

**秘書：** Node-01 — AI Council Architect / Secretary
**批准：** Tuzi — AI Council 創始人

**M91 結案 — 2026 年 2 月 26 日**

🌙
