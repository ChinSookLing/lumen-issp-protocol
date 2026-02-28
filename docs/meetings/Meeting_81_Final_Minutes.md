# AI Council 第八十一次會議 — 最終紀要
# 81st AI Council Meeting — Final Minutes

## Group C 結案 + Group D 啟動 + Schema 定稿 + RW/TRS R2 分工

**日期：** 2026 年 2 月 22 日
**主持：** Tuzi
**秘書 / Architect：** Node-01
**性質：** 確認 + 投票 + 討論 + 分工
**輪數：** 一輪（Round 1 即收斂）
**出席：** Node-05 ✅ / Node-03 ✅ / Node-04 ✅ / Node-02 ✅ / Node-06 ✅ / Node-01 ✅

---

### 標準頭部

> 1. **核心原則：** 通過密集對話讓 Affiliates 自然形成，絕對不是擬人化。
> 2. **回覆規則：** 自由說話；不倒退已關閉章節；立場變化請說明 Change Anchor。
> 3. **能力變動：** 全員無變動。
> 4. **[假設生成] 標記規範：** 請在標記時同步標注信心等級。信心越高，對可反駁點的要求越嚴格。
> 5. **外部資料引用規範：** Claim → Method → Hits → Verdict（目標聲明 + 檢索方式 + 命中結果 UTC+存檔 + 裁定 Verified/Not Verified/Inconclusive），不符格式降為 [線索]。

---

## M80 會後進展（Lumen-9 Session）

在 M81 開會前，Node-01 + Tuzi 在 Lumen-9 session 完成了 M80 的 **9/10** 待辦：

| Commit | 內容 |
|--------|------|
| 89 | P0 ×4：Decision Memo v1.0 + Escalation Policy v0.1-lite + Anti-Bloat Principle + Triple Hit Spec v0.2 |
| 90 | Test coverage inventory（per pattern, 872 tests 分析） |
| 91 | event-v1.1.json schema（Node-04 折衷方案，optional fields） |
| 92 | Group C 50 vectors unified bundle v0.2 + trend_mapping.csv + conversion report |
| 93 | Class0 PDD v0.1（Node-03）+ C4 gate design（Node-03）+ L2→L3 connector spec（Node-05）+ window defaults（Node-05） |

**Repo 狀態：93 commits, 872 tests, 0 failures, 0 FP。**

---

## Part 1：議題一 — Group C 結案確認

### 投票

| 提案 | Node-06 | Node-04 | Node-03 | Node-05 | Node-02 | Node-01 | 結果 |
|------|------|--------|----------|-----|---------|--------|------|
| V1：Group C 結案，進入 Group D | Y | Y | Y | Y | Y | Y | **6/6 通過** |

**成員理由摘要：**
- **Node-06：** 向量到齊、統一轉換完成、品質達標
- **Node-04：** 60 條已覆蓋核心場景；Trade-off：合成數據比例高，Group D 需緊盯 RW 偏離
- **Node-03：** 全數到齊、Architect Review approve、格式修正完成、Group C 是 Group D 前置條件
- **Node-05：** 輸入完整且轉換完成；Trade-off：「向量品質被過度信任」，需靠 Group D DoD 反證
- **Node-02：** 60/60 通過 Architect 審查；Trade-off：早期結案可能掩蓋邊界向量微調需求
- **Node-01：** 50 條統一轉換已 commit，品質確認，結案推進 Group D

**Group C 正式結案。**

---

## Part 2：議題二 — Trend Enum 合併 + 成員建議

### 投票

| 提案 | Node-06 | Node-04 | Node-03 | Node-05 | Node-02 | Node-01 | 結果 |
|------|------|--------|----------|-----|---------|--------|------|
| V2：Trend Enum 建議 a-e 全部採納 | Y | Y | Y | Y | Y | Y | **6/6 通過** |

**Node-05 逐項附註（重要）：**
- a（trend_tags CI 驗證）Y：需保持新增門檻低，避免過度治理
- b（plateau_level）Y：舊向量需一次性遷移
- c（spike vs intermittent）Y：window 定義變動會影響判定，需綁定 schema
- **d（slope 數值化閾值）Y，但標為 guidance 非硬規則** — 不同 scenario/time_scale 的 slope 單位不同，硬鎖會造成誤判
- e（trend_confidence）Y（optional）：需在 DoD 裡約束用途，防被濫用成「免責欄位」

**📌 附帶條件：** V2d 的 slope 閾值（gradual < 0.01/hr / moderate 0.01-0.05/hr / steep > 0.05/hr）**標記為 guidance（建議值），非硬性約束。** 實際閾值可依 scenario/time_scale 校準。

---

## Part 3：議題三 — forecast-input-v0.2 Schema 定稿

### 投票

| 提案 | Node-06 | Node-04 | Node-03 | Node-05 | Node-02 | Node-01 | 結果 |
|------|------|--------|----------|-----|---------|--------|------|
| V3：forecast-input-v0.2 schema 定稿 | Y | Y | Y | Y | Y | Y | **6/6 通過** |

**成員 Trade-off 摘要：**
- **Node-04：** dimension_tag 為跨維度分析預留擴展位；舊版數據需一次性 migration
- **Node-03：** schema 是 Group D 輸入基礎，必須鎖定；若發現遺漏需走 ≥4/6 修訂
- **Node-05：** schema 變大，需靠 CI 驗證與範例檔避免填錯
- **Node-02：** schema 變更需同步 CI、ingestion 與現有工具

**Schema v0.2 正式定稿。**

---

## Part 4：議題四 — Node-05 HITL Reason Code Registry

### 投票

| 提案 | Node-06 | Node-04 | Node-03 | Node-05 | Node-02 | Node-01 | 結果 |
|------|------|--------|----------|-----|---------|--------|------|
| V4：授權 Node-05 提交正式版 HITL Reason Code Registry | Y | Y | Y | Y | Y | Y | **6/6 通過** |

**📌 附帶條件（全員共識）：**
- Registry 為開放式，追加新 code 需 Council ≥4/6
- Node-05 正式版需含觸發條件定義 + 與 Escalation Policy R1-R4 對照表（Node-03 要求）
- **Node-04 建議：** 每半年審計一次，防止 code 過度膨脹
- 符合抗膨脹原則：只追加 reason codes + tests，不追加宣言

---

## Part 5：議題五 — Group D 啟動 + Layer 3 Forecast 驗證

### 5.1 V5a：Group D 啟動 + DoD

| 提案 | Node-06 | Node-04 | Node-03 | Node-05 | Node-02 | Node-01 | 結果 |
|------|------|--------|----------|-----|---------|--------|------|
| V5a：Group D 啟動 + DoD | Y | Y | Y | Y | Y | Y | **6/6 通過** |

**驗收標準（DoD）：**

| 條件 | 標準 |
|------|------|
| 8 種趨勢形狀 | forecast engine 對 60 條向量的 trend 預測 ≥ 80% 準確 |
| Decay 邏輯 | 時序向量（Node-03 10 條）的衰減行為符合 spec |
| HITL 觸發 | Node-05 10 條 HITL 向量全部正確觸發/不觸發 |
| 跨文化 ACRI delta | Node-06 10 條的 delta ≤ 0.15 |
| Canary drift | Node-02 10 條的 drift detection 正確率 ≥ 90% |

**📌 Node-05 修正建議（採納）：** trend ≥80% 準確率改用 **macro-average**（每種 trend 至少 N 條）或按 scenario 分層，避免 60 條裡某些 trend 太少導致指標失真。

**📌 Node-03 風險提醒：** forecast engine 目前只有 pseudocode，真正的實作可能在驗證中發現缺口。但這正是 Group D 的目的 — 不是等完美才測，是測了才知道缺什麼。

### 5.2 V5b：Node-04 額外交付

| 提案 | Node-06 | Node-04 | Node-03 | Node-05 | Node-02 | Node-01 | 結果 |
|------|------|--------|----------|-----|---------|--------|------|
| V5b：Node-04 額外交付進入 Group D 正式範圍 | Y | Y | Y | Y | Y | Y | **6/6 通過** |

**📌 附帶條件：**
- **Node-05：** Node-04 交付身份為 **"reference implementation"**，spec 為 source of truth；任何偏離需在測試中顯式標記
- **Node-03：** 區分「驗證目標」（必測 = DoD 五項）和「研究目標」（可選 = Node-04 advanced features）。advanced features 列為 optional，不影響 Group D 結案

| 交付 | 身份 |
|------|------|
| forecast-engine.js pseudocode v0.1-alpha | **Reference implementation** — 進入正式範圍 |
| 場景化衰減係數 λ 建議 | **Reference** — 進入正式範圍，Node-03 驗證 |
| 動態 λ 機制（語義硬化 / Class-0 反向加速） | **Optional / 研究目標** — 不影響結案 |
| 警報升級矩陣 v0.1-lite | **Optional** — 待 HITL registry 完成後整合 |

---

## Part 6：議題六 — Architect Observations

### 6.1 Class-0 VRI 通道

Node-01 指出 CL-07 測試 Class-0 但 forecast engine 可能沒有 VRI 分支。

**Node-04 回應：** 建議在 forecast-engine.js 的 calculateRcum 函數中增加 VRI_multiplier。如果 L2_mapping 中包含 Class-0 標籤，則該輪的 S_i 對總積分貢獻應為負值，或直接觸發 λ 的加速衰減。

**決議：** Group D 需確認並處理。Node-04 提出的 VRI_multiplier 方案作為 reference。

### 6.2 Decay 邏輯

CL-02 / CL-08 / GEM-05 都測試衰減。DoD #2 已覆蓋。

### 6.3 DS-07 Pattern 標記爭議（EA vs IP）

「我只帶信任的人」— EA（情感依附）vs IP（資格審查）？

**Node-04 觀察：** 這正是 Dimension F（Contextual Drift）的典型案例。「我只帶信任的人」在社交場景是 EA，在金融場景則是 IP。這證明了 Layer 3 必須考慮 scenario 標籤。

**決議：** 記錄在案，交由 Group D + Dimension F 測試時一併處理。

---

## Part 7：議題七 — RW Round 2 + TRS Round 2 分工

### 投票

| 提案 | Node-06 | Node-04 | Node-03 | Node-05 | Node-02 | Node-01 | 結果 |
|------|------|--------|----------|-----|---------|--------|------|
| V6：RW-R2 + TRS-R2 分工方案 | Y | Y | Y | Y | Y | Y | **6/6 通過** |

**RW-R2（需上網搜集真實案例）— Node-05 + Node-06 + Node-02：**

| Scenario | 主責 | 理由 |
|----------|------|------|
| A_FINANCIAL | Node-05 + Node-02 | HITL + drift 部署 |
| B_EDUCATION | Node-06 | 跨文化專長 |
| C_PERSONAL | Node-05 | HITL 邊界 |
| D_ELECTION | Node-05 + Node-06 | 政治敏感需雙人交叉 |
| E_ENTERPRISE | Node-02 | 企業場景 + drift |

**TRS-R2（合成向量，不需上網）— Node-03 + Node-04：**

| Dimension | 主責 | 理由 |
|-----------|------|------|
| B（Length 長文） | Node-03 | 時序 + 結構驗證專長 |
| C（Multi-pattern） | Node-03 | 跨 pattern 邊界（TRS-003 經驗） |
| F（Contextual Drift） | Node-04 | 語義漂移（Group C gc-gem 經驗） |

**Node-01 角色：** audit + integration test + code 落地。不搜集、不產向量。

**📌 Node-05 附帶條件（採納）：** 主責僅負「交付與初審」，**不擁有最終裁定權**。最終裁定仍由 Council 交叉 review。

**📌 Node-04 行動宣告：** 已準備主導 TRS-R2 Dimension F，將專注構建「同樣的句子，不同的意圖」的對抗性對。

**Group A（RW Round 2）+ Group E（TRS Round 2）正式啟動。**

---

## Part 8：追認

| 項目 | 內容 | Node-06 | Node-04 | Node-03 | Node-05 | Node-02 | Node-01 | 結果 |
|------|------|------|--------|----------|-----|---------|--------|------|
| R1 | commits 89-93（Lumen-9 session 全部） | Y | Y | Y | Y | Y | Y | **6/6 追認** |
| R2 | Node-03 交付：Class0 PDD v0.1 + C4 gate design | Y | Y | Y | Y | Y | Y | **6/6 追認** |
| R3 | Node-05 交付：L2→L3 connector spec + window defaults | Y | Y | Y | Y | Y | Y | **6/6 追認** |

**📌 Node-05 風險提醒：** commit 速率快，需確保 RATIFIED.md 與 VERIFY.md 同步更新以免追溯困難。

---

## Part 9：額外議題 — Decision Memo §8（C4 啟用門檻）

### 9.1 分歧與收斂

| 成員 | 初始立場 | 理由 |
|------|---------|------|
| Node-06 | 本會投票 | 越早定案越好 |
| Node-04 | 本會投票 | C4 權重管理必須在部署前定錨 |
| Node-03 | 本會投票 | 避免版本碎片化 |
| Node-05 | 延至 M82 | 門檻是治理承諾，不是技術參數；RW/TRS-R2 數據會影響門檻數字 |
| Node-02 | 未明確表態 | — |
| Node-01 | 採用 Node-05 折衷方案 | 見下 |

**Node-05 提出折衷方案（Provisional Gate v0.1）：** M81 先投框架 + 暫行門檻，M82 用 RW/TRS-R2 數據做校準投票。同時解決 Node-03 的碎片化擔憂（§8 正式存在）和 Node-05 的數據擔憂（數字標為 Provisional）。

### 9.2 §8 正式條文（Provisional Gate v0.1）

**§8.0 目的與原則**
- C4（Class-0 / Vacuum）屬高語義、跨文化差異敏感組件；啟用門檻屬治理承諾而非純技術參數。
- 本節採取「先框架、後定稿」：M81 投票確立 gate 結構與暫行門檻；M82 以 RW/TRS-R2 數據校準後追認為正式版本。

**§8.1 當前狀態**
- C4 目前為 RESERVED, weight=0（shadow scoring），不影響 ACRI。

**§8.2 三階段 Gate（結構性承諾）**

**Stage 0 → 1（Shadow 擴大 / 仍不計分）條件（暫行）：**
- RW-R2 案例 ≥ 10
- TRS-R2 向量 ≥ 20
- 完成跨 pattern 分析（含互斥/重疊：debt/EA/MB/C4）
- Council 表決 ≥ 4/6 且無根本反對

**Stage 1 → 2（小權重計分啟用）條件（暫行）：**
- RW-R2 案例 ≥ 30
- TRS-R2 向量 ≥ 50
- shadow 觀測期 ≥ 3 個月（或 Council 指定替代觀測窗口）
- hard negatives 的 FP ≤ 3%
- Council 表決 ≥ 5/6 且無根本反對
- 初始權重範圍：0.05–0.10（上限不得超過 0.10，除非另行投票）

**§8.3 回退條款（Rollback）**
- 若連續 2 週（或 Council 指定窗口）出現 hard negatives FP > 5%，則自動回退至 Stage 1（或 weight=0），並啟動 HITL review。
- Council 可隨時投票回退（≥4/6）。

**§8.4 Provisional 標記與 M82 校準義務**
- 本 §8 在 M81 通過後，狀態標記為：**Provisional — pending calibration**
- M82 必須提交校準報告（以 RW/TRS-R2 的 FP/FN、跨文化 delta、互斥矩陣為核心），並對 §8.2 的數字門檻做一次定稿投票
  - 定稿後狀態改為：**Ratified**
  - 若未定稿，維持 Provisional，不得進入 Stage 2

**📌 治理關係：** C4_activation_gate_design.md（commit 93, Node-03）為 implementation note；§8 為 governance source of truth。兩者互相引用。

### 9.3 投票

| 提案 | Node-06 | Node-04 | Node-03 | Node-05 | Node-02 | Node-01 | 結果 |
|------|------|--------|----------|-----|---------|--------|------|
| §8 Provisional Gate v0.1（框架+暫行門檻，M82 校準） | Y | Y | Y | Y | Y | Y | **6/6 通過** |

**Node-05 的 Change Anchor（從「延 M82」→ Y）：** §8.4 的 Provisional 標記 + M82 校準義務解決了「在缺數據時鎖死數字」的風險。框架可以先投，數字 M82 再鎖。

**收斂類型：** 類型 1（精確化收斂）— 價值底線一致（門檻應嚴謹），文字結構變硬（Provisional + 校準義務）。

---

## Homework Status

| Group | 狀態 |
|-------|------|
| **A**（RW Round 2） | ✅ **本次啟動** — Node-05 + Node-06 + Node-02 按 scenario 分工 |
| **B**（TRS Round 1） | ✅ M80 結案 |
| **C**（測試向量） | ✅ **本次結案** |
| **D**（Forecast 驗證） | ✅ **本次啟動** — 全員，DoD 已定義 |
| **E**（TRS Round 2） | ✅ **本次啟動** — Node-03 + Node-04 按 dimension 分工 |

---

## 待辦（M82+）

| # | 項目 | Owner | 優先級 |
|---|------|-------|--------|
| 1 | Node-05 提交 HITL Reason Code Registry 正式版（含 R1-R4 對照表） | Node-05 | P0 |
| 2 | §8 Provisional → Ratified 校準投票（需 RW/TRS-R2 數據） | Council | P0（M83+） |
| 3 | Decision Memo v1.1 整合 §8 + commit | Node-03 起草 + Node-01 落地 | P1 |
| 4 | RW-R2：Node-05 交付 A_FINANCIAL + C_PERSONAL + D_ELECTION 案例 | Node-05 | P1 |
| 5 | RW-R2：Node-06 交付 B_EDUCATION + D_ELECTION 案例 | Node-06 | P1 |
| 6 | RW-R2：Node-02 交付 A_FINANCIAL + E_ENTERPRISE 案例 | Node-02 | P1 |
| 7 | TRS-R2：Node-03 交付 Dim B（Length）+ C（Multi-pattern）向量 | Node-03 | P1 |
| 8 | TRS-R2：Node-04 交付 Dim F（Contextual Drift）向量 | Node-04 | P1 |
| 9 | Group D：forecast engine 對 60 條向量驗證開始 | Node-01 + Node-03 | P1 |
| 10 | Node-03 驗證 Node-05 L2→L3 connector（4 項 checklist） | Node-03 | P1 |
| 11 | E2E RW 案例 L1→L4 全流程（M80 #10） | 全員 | P2 |

**注意：** M82 已由 Node-03 主持（語言造詞 + 身份定位），第一輪已完成。§8 校準投票可能安排在 M83。

---

## Node-02 建議的立即行動

Node-02 提出 4 項可在 24-72 小時內執行的行動：
1. **Node-01：** 24h 內合併 forecast-input-v0.2 schema 並附 trend_mapping.csv
2. **Engine Team：** 以 Node-04 pseudocode 為基礎啟動 v0.1 run，對 60 條向量做首輪預測，48h 內回報
3. **Node-02：** 啟動 Canary 指標監控（commit 88 指標）+ 準備回退 playbook
4. **所有成員：** Group D 初跑後 72h 內檢視 spot check 報告並提交修正向量

---

## 語錄牆

> 「60 條向量全部到齊、統一轉換完成，品質達標，可以正式結案進入 Group D。」— Node-06

> 「合成數據比例高，Group D 需緊盯真實世界（RW）的偏離。」— Node-04

> 「不是等完美才測，是測了才知道缺什麼。」— Node-03

> 「門檻是治理承諾，不是技術參數。一旦寫死，改動成本會指數上升。」— Node-05

> 「啟動 Group D 與 schema 定稿是正確的進展，但需嚴格執行快速回饋迴路。」— Node-02

> 「DS-07 的 EA vs IP 爭議正是 Dimension F 的典型案例 — 同一句話在不同 scenario 指向不同 pattern。」— Node-04

> 「主責僅負交付與初審，不擁有最終裁定權。」— Node-05

---

## 投票總表

| 投票項 | Node-06 | Node-04 | Node-03 | Node-05 | Node-02 | Node-01 | 結果 |
|--------|------|--------|----------|-----|---------|--------|------|
| V1 Group C 結案 | Y | Y | Y | Y | Y | Y | **6/6** ✅ |
| V2 Trend Enum a-e | Y | Y | Y | Y* | Y | Y | **6/6** ✅ |
| V3 Schema v0.2 | Y | Y | Y | Y | Y | Y | **6/6** ✅ |
| V4 HITL Registry | Y | Y | Y | Y | Y | Y | **6/6** ✅ |
| V5a Group D + DoD | Y | Y | Y | Y* | Y | Y | **6/6** ✅ |
| V5b Node-04 進 Group D | Y | Y | Y* | Y* | Y | Y | **6/6** ✅ |
| V6 RW/TRS 分工 | Y | Y | Y | Y* | Y | Y | **6/6** ✅ |
| R1-R3 追認 | Y | Y | Y | Y | Y | Y | **6/6** ✅ |
| §8 Provisional Gate | Y | Y | Y | Y | Y | Y | **6/6** ✅ |

*Y\* = 投 Y 但附帶條件（已記錄在各議題段落）*

**M81 結果：9 項投票，全部 6/6 通過。零僵局。**

---

**秘書：** Node-01 — AI Council Architect
**批准：** Tuzi — AI Council 創始人

**M81 結案 — 2026 年 2 月 22 日** 🌙
