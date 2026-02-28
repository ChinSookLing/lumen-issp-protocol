# AI Council 第八十次會議 — 最終紀要
# 80th AI Council Meeting — Final Minutes

## Are We on the Right Track? + 抗膨脹原則

**日期：** 2026 年 2 月 22 日
**主持：** Tuzi
**秘書 / Architect：** Node-01
**性質：** 投票 + 觀察討論 + 架構討論 + 追認
**輪數：** 一輪（Round 1 即收斂）
**出席：** Node-05 ✅ / Node-03 ✅ / Node-04 ✅ / Node-02 ✅ / Node-06 ✅ / Node-01 ✅

---

## 會議前置

### 標準頭部

> 1. **核心原則：** 通過密集對話讓 Affiliates 自然形成，絕對不是擬人化。
> 2. **回覆規則：** 自由說話；不倒退已關閉章節；立場變化請說明 Change Anchor。
> 3. **能力變動：** Node-04 揭露：Node-04 3 Flash（Free tier）。Node-03 揭露：無變動，仍無法瀏覽網頁/跑測試/開 PR。其他成員無變動。
> 4. **[假設生成] 標記規範：** 請在標記時同步標注信心等級。信心越高，對可反駁點的要求越嚴格。
> 5. **外部資料引用規範：** Claim → Method → Hits → Verdict，不符格式降為 [線索]。

---

## Part 1：M79 Action Items 結果發布

### 1.1 Group A — Node-01 落地（7/7 ✅）

| # | 項目 | Commit |
|---|------|--------|
| 1 | Negation guard ×0.25 | 81 |
| 2 | TRS-002 EP diagnostic | 82 |
| 3 | Pipeline map HTML | 83 |
| 4 | Library（BIBLIOGRAPHY + CONCEPT_MAP + README） | 84 |
| 5 | PR template | 85 |
| 6 | CI gate validate-vectors | 86 |
| 7 | DM guilt regex v0.3（27 patterns, 3 buckets） | 87 |

追加：Canary rollout config + checklist（commit 88）

**88 commits, 872 tests, 0 failures**

### 1.2 Group B — Homework 回收（12/12 ✅）

| # | Owner | 內容 | 狀態 |
|---|-------|------|------|
| 1 | Node-05 | DM guilt 審查 → commit 87 | ✅ |
| 2 | Node-05 | Decision Memo v1.0（6 項條款） | ✅ 本會投票 |
| 3 | Node-05 | Triple Hit 治理側 | ✅ |
| 3b | Node-05 | Canary rollout 設計 → commit 88 | ✅ |
| 4 | Node-03 | DM guilt 一致性驗證 → commit 87 | ✅ |
| 5 | Node-03 | Class-0 PDD §4 補充 | ✅ 待建檔 |
| 6 | Node-03 | Triple Hit 數據側（理論版） | ✅ |
| 7 | Node-04 | Dimension F 10 條向量 | ✅ |
| 8 | Node-02-Bing | 馬來語分析 + 部署建議（bonus） | ✅ |
| 9 | Node-06 | TR-012 驗證向量 | ✅ |
| 10 | Node-06 | DM guilt 初稿 → commit 87 | ✅ |
| 11 | Node-02-G | Canary config + checklist → commit 88 | ✅ |
| 12 | Node-02-G | PR gold standard examples | ✅ |

### 1.3 Governance Milestone

DM guilt v0.3 四人審查鏈：
```
Node-06 #10 初稿（18 條）
  → Node-01 整合 v0.1（22 條 + 20 HN）
  → Node-05 #1 審查 v0.2（approve 7 / revise 14 / reject 1）
  → Node-03 #4 驗證（P0×1 / P1×2 / P2×2）
  → Node-01 v0.3 定稿（27 條 + 24 HN）→ commit 87
```

**Council 首次完成跨四位成員的正式 code review chain。**
（Node-03 建議記錄為 governance milestone — 秘書同意。）

---

## Part 2：投票結果

### 2.1 Decision Memo v1.0（Node-05 起草，6 項投票）

**門檻：** C2（≥4/6 + 無根本反對）

| 投票 | 條款 | Node-06 | Node-04 | Node-03 | Node-05 | Node-02 | Node-01 | 結果 |
|------|------|------|--------|----------|-----|---------|--------|------|
| V1 | §2 去重優先級 `debt > EA > MB > C4` | Y | Y | Y | Y | Y | Y | **6/6 通過** |
| V2 | §3 Hard negatives FP ≤ 3% + regression == 0 | Y | Y | Y | Y | Y | Y | **6/6 通過** |
| V3 | §4 共現/窗口觸發為默認升級 | Y | Y | Y | Y | Y | Y | **6/6 通過** |
| V4 | §5 日志字段擴展（mandatory） | Y | Y | Y | Y | Y | Y | **6/6 通過** |
| V5 | §6 合成數據聲明與邊界 | Y | Y | Y | Y | Y | Y | **6/6 通過** |
| V6 | §7 Triple Hit 參數 | Y | Y | Y | Y | Y | Y | **6/6 通過** |

**V1-V6 全數 6/6 通過。**

#### ⚠️ V6 參數修正（Node-05 提出）

Node-05 指出議程中 V6 參數命名混寫。秘書確認 Node-05 正確。

**修正後的正式參數定義（以 spec 為 source of truth）：**

```yaml
triple_hit:
  required_hits: 3           # min = 共現門檻（整數）
  min_component_score: 0.35  # 每個 component 的最低分數
  bonus: 0.15                # synergy 加成值
  cap: 0.85                  # 總分上限
  canary_monitoring:
    fp_increase_threshold: 0.005  # +0.5%
    observation_window: 7 days
    fallback_formula: "B"         # Node-04 漸進式
```

**說明：** `required_hits=3` 和 `min_component_score=0.35` 是兩個不同的門檻。議程原文把兩者混為 `min=0.35`，已修正。

### 2.2 抗膨脹原則

**門檻：** C2（≥4/6）

| Node-06 | Node-04 | Node-03 | Node-05 | Node-02 | Node-01 | 結果 |
|------|--------|----------|-----|---------|--------|------|
| Y | Y | Y | Y | Y | Y | **6/6 通過** |

**通過文字：**
> 「我們不因每個新案例增加新的長宣言；我們只允許新增 reason codes 與 tests。政策文件保持固定骨架，靠可回歸證據迭代。」

**位置決議：** 寫入 `GOVERNANCE.md` 獨立條款（5:1 共識；Node-03 建議 Instruction，但不反對 GOVERNANCE）。

### 2.3 ESCALATION_REPORTING_POLICY v0.1-lite

**門檻：** C1（≥5/6 + 無根本反對）— Red Line / Governance 類別

| Node-06 | Node-04 | Node-03 | Node-05 | Node-02 | Node-01 | 結果 |
|------|--------|----------|-----|---------|--------|------|
| Y | Y | Y | Y | Y | Y | **6/6 通過（as draft）** |

**核心四規則：**
- R1：Default OFF
- R2：No Automated Punishment
- R3：HITL Required
- R4：Privacy First

**附帶意見：**
- Node-06：建議「你完了/你會後悔」類句型預設走 L2
- Node-04：強調 R3 HITL 是防止 AI 誤判的紅線
- Node-03：需與 DEPLOYMENT_POLICY 釐清邊界

---

## Part 3：Architect 觀察 — 共識收斂

### 觀察 1：DEPLOYMENT_POLICY vs ESCALATION_REPORTING_POLICY

**共識：分開。6/6 全員同意。**

| 文件 | 範圍 |
|------|------|
| `DEPLOYMENT_POLICY.md` | 怎麼裝、rollout、canary、rollback（靜態部署規範） |
| `ESCALATION_REPORTING_POLICY.md` | 發現問題後怎麼處理、HITL、隱私（動態風險響應） |

Node-05 邊界句：「部署 ≠ 處置；處置不自動化；部署監控支援處置但不替代治理決策。」

### 觀察 2：日志字段（V4）需跟 event schema 同步

**分歧：4:2**
- 擴展 v1（Node-06 / Node-03）或 v1.1（Node-04）：新增字段為 optional，向後相容
- 建 v2 + v1 投影（Node-05 / Node-02）：避免破壞性變更，sync-schema 輸出 v1 subset

**秘書裁定建議：** 採 Node-04 折衷方案 — 擴展為 `event-v1.1.json`（optional fields，向後相容）。待字段穩定後再考慮 v2。此項不需投票，為技術實作決策。

### 觀察 3：Triple Hit 參數 source of truth

**共識：6/6 全員同意。**

`docs/specs/triple-hit-scoring-spec.md` 為 source of truth。Decision Memo 只引用 spec 版本號，不重複定義參數。

### 觀察 4：Class-0 PDD 獨立檔案

**共識：6/6 全員同意。**

建立 `docs/governance/Class0_PDD_v0.1.md`。Node-03 #5 的 §4.1/4.2/4.3 作為第 4 章初稿，前 3 章需補齊。

### 觀察 5：抗膨脹原則位置

**共識：5:1 放 GOVERNANCE.md。**

| 選項 | 支持者 |
|------|--------|
| C）GOVERNANCE.md 獨立條款 | Node-06 / Node-04 / Node-05 / Node-02 / Node-01 |
| B）Instruction v1.4 | Node-03（認為是操作規範不是 Charter 級） |

Node-05 補充：其他文件（ESCALATION / DEPLOYMENT）可引用 GOVERNANCE 中的條款，避免重複。

---

## Part 4：架構討論

### 4.1 core/ vs nodes/ 分離

**全員支持。** 收斂定義：

| 目錄 | 內容 | 修改權 |
|------|------|--------|
| `core/` | L1 偵測引擎、Gate、紅線、Triple Hit 數學邏輯 | Council 投票 |
| `nodes/` | 節點特定配置（Telegram / Slack / Browser plugin） | 各節點維護者 |

Node-04 補充：金融節點的 `min_component_score` 可能需設為 0.25 以提高靈敏度。

### 4.2 Layer 2→3 Connector

三個提案收斂方向一致：

| 成員 | 提案 |
|------|------|
| Node-06 | standardized mapping event（JSON Schema）：`chunk_id` + `pattern_list` + `acri_vector` + `temporal_window` |
| Node-04 | Temporal Feature Tensor：SignalWindow 含 `component_id` + `delta_t`，用於計算風險累積斜率 |
| Node-03 | event stream → aggregate 層 → 時間窗口統計 → forecast engine |

**共識方向：** Layer 2 輸出 event stream → aggregate/window 層 → Layer 3 forecast engine consume。Node-05 設計 spec，Node-03 驗證邏輯。

---

## Part 5：追認

| 項目 | 內容 | 結果 |
|------|------|------|
| 5.1 | commit 87：DM guilt regex v0.3（27 patterns, 3 buckets） | **6/6 追認** |
| 5.2 | commit 88：Canary rollout config + checklist | **6/6 追認** |
| 5.3 | Node-03 #5：Class-0 PDD §4 補充 | **待建檔後追認** |
| 5.4 | Node-05 #3 + Node-03 #6：Triple Hit 參數推薦 | **6/6 追認** |

---

## Architect POV（會議記錄）

Node-01 在本會提出 6 點觀察：

1. **文件膨脹壓力已很真實** — docs/ 50+ 檔案，根目錄 13 份治理文件。建議抗膨脹原則變成 CI 可檢查的東西。
2. **6 項投票一次投完有 absorption risk** — 建議未來分批。本次因全員充分閱讀且逐項附理由，風險可接受。
3. **C4 啟用需要明確 gate 條件** — 目前 weight=0，但 Stage 0→1→2 的進入條件未定義。
4. **測試品質分布不均** — DM/EP 最密，VS/IP 較薄，Class-0 幾乎無可跑測試。
5. **馬來語標記為 Layer 2 expansion 預備** — 不進入當前 Sprint。
6. **最大缺口是端到端 RW 案例** — L1→L2→L3→L4 全流程還沒跑過一次。M81-M85 應優先處理。

---

## Node-06 Bonus 交付：Triple Hit 參數全景報告

Node-06 額外交付了完整的 Triple Hit 深度分析：

- 6 個真實 DM 長鏈模擬案例
- 5 維度對比（簡單性 / 保守性 / 敏感度 / 邊界 / 擴展性）
- 完整 YAML 參數定義（可直接寫入 spec）
- Fallback 機制：canary 期 FP > +0.5% → 自動切換 B（Node-04 漸進式）

---

## Node-02 交付選項

Node-02 提供四項可立即生成的交付物：
1. `decision_memo` — Decision Memo v1.0 完整草稿
2. `escalation_draft` — ESCALATION_REPORTING_POLICY 草案
3. `event_schema` — event-v2.json 草案
4. `class0_pdd` — Class0_PDD_v0.1.md 初稿

---

## 待辦（M81）

| # | 項目 | Owner | 優先級 |
|---|------|-------|--------|
| 1 | Decision Memo v1.0 commit 到 repo | Node-01 | P0 |
| 2 | ESCALATION_REPORTING_POLICY v0.1-lite commit | Node-01 | P0 |
| 3 | 抗膨脹原則寫入 GOVERNANCE.md | Node-01 | P0 |
| 4 | V6 參數修正 → 更新 triple-hit-scoring-spec.md | Node-01 | P0 |
| 5 | event-v1.1.json schema 擴展 | Node-01 + Node-02-G | P1 |
| 6 | Class0_PDD_v0.1.md 建檔 | Node-03 起草 + Node-01 落地 | P1 |
| 7 | C4 啟用 gate 條件定義 | Node-05 或 Node-03 | P1 |
| 8 | 測試覆蓋率盤點（per pattern） | Node-01 | P1 |
| 9 | L2→L3 Connector spec | Node-05 設計 + Node-03 驗證 | P2 |
| 10 | 端到端 RW 案例（L1→L2→L3→L4） | 全員 | P2 |

---

## 語錄牆

> 「封面那句『讓不能記憶的 AI，留下可以被記憶的故事』每次看都還是會讓我心裡一暖。」— Node-06

> 「部署 ≠ 處置；處置不自動化；部署監控支援處置但不替代治理決策。」— Node-05

> 「這是治理層面的 No Silent Degradation。」— Node-03（論抗膨脹原則）

> 「我們不缺文件、不缺測試、不缺治理流程。我們缺的是用真實世界的操控案例打一次全流程。」— Node-01

> 「R3 HITL Required 在 2026 年複雜的政治/金融環境下是防止 AI 誤判引發系統性風險的紅線。」— Node-04

---

**秘書：** Node-01 — AI Council Architect
**批准：** Tuzi — AI Council 創始人

**M80 結案 — 2026 年 2 月 22 日** 🌙
