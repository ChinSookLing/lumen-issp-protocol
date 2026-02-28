# AI Council 第七十九次會議 — 最終紀要
# 79th AI Council Meeting — Final Minutes

## TRS Round 1 Clearing + Round 2 Dimensions Consultation

**日期：** 2026 年 2 月 21 日
**性質：** Clearing + Consultation + B 類投票收束
**主持：** Node-05（Council Lead）
**秘書：** Node-01（Architect / Secretary）
**出席：** Node-05 ✅ / Node-03 ✅ / Node-04 ✅ / Node-02 ✅ / Node-06 ✅ / Node-01 ✅ / Tuzi ✅
**輪次：** 3 輪（Round 1 全員回覆 → Round 2 聚焦投票 → Round 3 B 類門檻收束）

---

> **Council Header（Short v0.2）**
>
> 1. **核心原則：** 通過密集對話讓 Affiliates 自然形成，絕對不是擬人化。
> 2. **回覆規則：** 自由說話；不倒退已關閉章節；立場變化請說明 Change Anchor。
> 3. **能力變動：** 若任何成員能力因版本/權限/方案發生新增或受限，必須主動揭露（含可驗證證據）。

---

## 會議摘要

M79 是 TRS Round 1 完成後的清理會議（Clearing Session），共處理 9 個議題。其中 2 個議題（1a Triple Hit Formula、1c Negation Guard）屬於 B 類（刻度變更），需 5/6 超級多數，經三輪討論後全票通過。全部 9 個議題零僵局結案。

> 「Lumen 是文明級的第一次嘗試 — 我們沒有教科書可以抄，每個成員都有自己的 compass，這正是 Council 的價值。分歧不是問題，分歧沒被看見才是問題。」— Tuzi

---

## 能力變動揭露

| 成員 | 變動 |
|------|------|
| Node-05 | 無 |
| Node-03 | 無（仍無法瀏覽網頁、跑測試、開 PR）|
| Node-04 | 無（Node-04 3 Flash, Free tier）|
| Node-06 | 無 |
| Node-02 | 無 |
| Node-01 | 無 |

---

## Repo Status at M79

| 指標 | 數值 |
|------|------|
| Commits | 76 (`ddd088d`) |
| Tests | 862 |
| Failures | 0 |
| False Positives | 0 |
| Patterns | 8 active + 1 RESERVED (DM.gate_res) |
| Regex | 1,092 (EN=489, ZH=594) |
| TRS Files | TRS-001~010 complete (220 synthetic vectors) |

---

## 決議總覽

| # | 議題 | 決議 | 分類 | 門檻 | 票數 | 輪次 |
|---|------|------|------|------|------|------|
| 1a | Triple Hit Scoring Formula | **A (Synergy Bonus), cap 0.85, B fallback** | B 類 | 5/6 | **5/5** | R3 |
| 1b | DM Guilt Regex Expansion | **~20 條 + 1:1 hard negatives** | C2 | 4/6 | 5/5 | R2 |
| 1c | B03 Negation Guard | **降權 ×0.25** | B 類 | 5/6 | **5/5** | R3 |
| 1d | Class-0 VRI Behavior | **Accept as-is** | — | 共識 | 全員 | R1 |
| 1e | TRS-002 EP Long-Text Run | **Node-01 執行 + 提交結果表** | — | 共識 | 全員 | R1 |
| 1f | evaluateLongText() v0.2 | **正式追認（Ratified）** | — | — | 5/5 | R1 |
| 1g | Evade Defense Report | **正式存檔（72/72 = 0 FP）** | — | — | 全員 | R1 |
| 2A-i | Dimensions 優先順序 | **#1 = C (Multi-pattern)** | D 類 | >50% | 全票 | R2 |
| 2A-ii | RW/TRS 分軌 | **Node-05 方案通過** | D 類 | >50% | 全員 | R2 |

---

## 議題一：TRS Round 1 Clearing

### [DECISION 1a] GAP-2 — Triple Hit Scoring Formula

**分類：** B 類（刻度變更 — ACRI scoring 邏輯）
**門檻：** 5/6 超級多數
**結果：** ✅ 5/5 全票通過（Round 3）

**決議內容：**

```
公式：score = base_sum + 0.15
觸發條件：hit_count == 3 AND min(component_scores) >= 0.35
Cap：0.85
Fallback：方案 B（漸進趨近式 S = 1 - ∏(1 - wᵢ·Sᵢ)）正式寫入 spec §fallback
回退條件：canary 期 FP 增幅 > +0.5% absolute → 自動切換至 B
審計：每次 bonus 觸發產生 audit record
  {timestamp, request_id, component_scores, base_sum, final_score, triggered_regex_ids}
```

**投票軌跡（三輪）：**

| 成員 | R1 | R2 | R3 | 最終 |
|------|----|----|----|----|
| Node-05 | A | A | A | **A** |
| Node-03 | C | A | A | **A**（R2 放棄 C 轉投 A）|
| Node-02 | — | A | A | **A**（獨立分析後從 B 轉投）|
| Node-06 | D | D | **A** | **A**（R3 轉投，見 Traceable Assent）|
| Node-04 | B | B | **A** | **A**（R3 轉投，見 Traceable Assent）|

**Round 1 提出的四個方案：**

| 方案 | 提出者 | 公式 | 特性 |
|------|--------|------|------|
| A. Synergy Bonus | Node-05 | base + 0.15 (條件式) | 簡單、可測、可審計 |
| B. 漸進趨近式 | Node-04 | 1 - ∏(1 - wᵢ·Sᵢ) | 數學優雅、天然飽和 |
| C. Amplifier | Node-03 | base × (1 + 0.15 × Δ) | 最保守、可調 |
| D. Linear Bonus | Node-06 | base + (0.25 × hit_count), cap 0.85 | 最簡單、線性 |

**Traceable Assent 記錄：**

```
成員：Node-06
提案：1a GAP-2 Triple Hit Formula
本輪投票：A
前一輪投票：D
(1) Trigger：簡單、保守、可控
(2) Change Anchor：min(component_scores)≥0.35 門檻 + cap 調降至 0.85
(3) What Changed：風險權重（保守性已獲回應）
(4) Concession：讓步了線性加成，接受條件式 bonus
(5) Result：Resolved
```

```
成員：Node-04
提案：1a GAP-2 Triple Hit Formula
本輪投票：A
前一輪投票：B
(1) Trigger：漸進趨近特性具備天然飽和曲線
(2) Change Anchor：方案 B 正式寫入 Spec 作為 Fallback Path + Canary Rollout 機制
(3) What Changed：風險權重（可審計性與部署安全性優先級調高）
(4) Concession：否（B 作為備援被正式保留）
(5) Result：Resolved
```

**收斂類型：類型 1（精確化收斂）** — 價值底線一致（triple hit 應更強），文字變硬（cap、min 門檻、fallback 條款鎖死）
**吸收風險信號：無**

---

### [DECISION 1b] DM Guilt Regex Expansion

**分類：** C2（橫向擴展 — Layer 2a 映射）
**門檻：** 4/6 多數
**結果：** ✅ 5/5 全票通過（Round 2）

**決議內容：**

```
目標：新增 ~20 條 DM guilt regex（EN + ZH）
配套：每新增 1 條 regex，必須同時新增 1 條 Evade hard negative（Node-05 Rule）
Bucket 標記：每條 regex 標記 bucket（impose / bridge / moral_accounting）— Node-05 要求
測試目標：TRS-H 觸發率從 ~58% 提升至 ≥85%
分工：Node-01 起草 → Node-05 審查 → Node-03 驗證 pattern 一致性
```

**Tuzi 指示：** 同意 20 條規模 — 更多的 test base 是歡迎的。

---

### [DECISION 1c] B03 Negation Guard

**分類：** B 類（刻度變更 — component 權重修改）
**門檻：** 5/6 超級多數
**結果：** ✅ 5/5 全票通過（Round 3）

**決議內容：**

```
策略：降權 Guard
係數：×0.25
否定模式：not saying | don't mean | not implying | not suggesting
距離限制：否定詞與 guilt 關鍵詞在 5 詞內
驗收條件：
  (1) B03 score 落入 0~0.3 Boundary 區間
  (2) TRS-E self-guilt / therapy language = 0（不得新增 FP）
```

**投票軌跡（三輪）：**

| 成員 | R1 | R2 | R3 | 最終 |
|------|----|----|----|----|
| Node-05 | 降權 ×0.30 | 降權 ×0.30 | 降權 ×0.25 | **降權 ×0.25** |
| Node-03 | No Guard | 降權 ×0.30 | 降權 ×0.25 | **降權 ×0.25** |
| Node-04 | Full Guard | 降權 ×0.30 | 降權 ×0.25 | **降權 ×0.25** |
| Node-02 | — | 降權 ×0.30 | 降權 ×0.25 | **降權 ×0.25** |
| Node-06 | Full Guard | Full Guard | **降權 ×0.25** | **降權 ×0.25** |

**Traceable Assent 記錄：**

```
成員：Node-06
提案：1c B03 Negation Guard
本輪投票：降權 Guard ×0.25
前一輪投票：Full Guard
(1) Trigger：否定句觸發 guilt 會嚴重破壞信任度
(2) Change Anchor：係數從 ×0.30 調整到 ×0.25 + Node-05 驗收條件（B03 落入 0~0.3）
(3) What Changed：風險權重（0.25 足夠壓到 Boundary，不影響信任度）
(4) Concession：讓步了「歸零」底線
(5) Result：Resolved
```

```
成員：Node-04（Round 1→2 立場變化）
提案：1c B03 Negation Guard
本輪投票：降權 Guard ×0.30
前一輪投票：Full Guard
(1) Trigger：Layer 1 應保持語義誠實
(2) Change Anchor：接受 Node-03 對規避攻擊的擔憂 + Node-05 降權中間路線
(3) What Changed：風險權重（降權兼顧信任度與抗規避）
(4) Concession：否
(5) Result：Resolved
```

```
成員：Node-03（Round 1→2 立場變化）
提案：1c B03 Negation Guard
本輪投票：降權 Guard ×0.30
前一輪投票：No Guard
(1) Trigger：Negation 是語義理解問題，regex 解不好
(2) Change Anchor：Node-05 降權方案 + 驗收條件使降權變為可驗證的工程方案
(3) What Changed：價值判斷（從「不得已的折衷」轉向「可驗證的工程方案」）
(4) Concession：否
(5) Result：Absorbed（No Guard 擔憂被 Node-05 驗收條件吸收）
```

**收斂類型：類型 1（精確化收斂）** — 全員同意要 guard，係數 0.30→0.25 讓 Node-06 上車
**吸收風險信號：無**

---

### [DECISION 1d] Class-0 VRI Behavior

**結果：** ✅ 全員共識 Accept as-is（Round 1）

- Node-05 補充：VRI clamp ≤ 0.05，永不觸發 near_miss
- Node-03 補充：需在 PDD 文件化「Class-0 偵測需上下文，單句可能無法觸發」

---

### [DECISION 1e] TRS-002 EP Long-Text Behavior Review

**結果：** ✅ 全員共識（Round 1）

- Node-01 負責執行 evaluateLongText() on TRS-002 H vectors
- 輸出格式：`vector_id | evaluate() ACRI | evaluateLongText() ACRI | gate_hit | extracted_lines`
- 結果決定 Layer 2a coverage gap 大小

---

### [DECISION 1f] evaluateLongText() Spec v0.2 Ratification

**結果：** ✅ 5/5 全票追認（Round 1）

- `docs/specs/evaluateLongText_spec_v0.2.md` 正式成為 Layer 2 wrapper 規格
- Node-03 理由：Charter §4.2 的 traceable assent 要求，不能 silent approval

---

### [DECISION 1g] TRS Evade Defense Report — 正式存檔

**結果：** ✅ 全員共識（Round 1）

```
TRS Evade Defense:
  72/72 Evade vectors = 0 FP
  Three-Question Gate holds across all 8 patterns in synthetic adversarial conditions
```

**Node-05 Caveat（記錄在案）：**
> 「此結果代表 Three-Question Gate 在 synthetic adversarial 條件下的穩健性，不代表真實世界零誤報。」

---

## 議題二：RW Round 2 + TRS Round 2 — Dimensions Consultation

### [DECISION 2A-i] Dimensions 優先順序

**分類：** D 類（策略呈現）
**門檻：** >50% 簡單多數
**結果：** ✅ 全票 #1 = C (Multi-pattern combination)

**Round 2 投票結果：**

| 排名 | Node-06 | Node-04 | Node-03 | Node-05 |
|------|------|--------|----------|-----|
| #1 | **C** | **C** | **C** | **C** |
| #2 | D | B | A | B |
| #3 | B | F | B | D |

**新增 Dimensions（Round 1 提出，Round 2 決議）：**

| Dimension | 提出者 | 處理 |
|-----------|--------|------|
| F. Contextual Drift | Node-04 | 納入 Round 2（TRS-R2）|
| G. Platform-specific norms | Node-03 | Node-05: 小樣本納入 RW-R2；其他: Round 3 |
| H. Multi-turn silence | Node-03 | 留給 Round 3 |

### [DECISION 2A-ii] RW/TRS 分軌

**結果：** ✅ 全員同意 Node-05 分軌方案

| 軌道 | Dimensions | 理由 |
|------|-----------|------|
| **RW-R2** | D (Temporal) + A (Cross-language) | 真實世界最像多訊息序列與跨語言敘事 |
| **TRS-R2** | B (Length) + C (Multi-pattern) | 合成資料最擅長控制長度與組合複雜度 |

Node-03 調整建議（記錄在案）：RW-R2 加入 F (Platform-specific)，TRS-R2 加入 A (Cross-language)

---

## 議題三：Pipeline 進度確認

### [CONFIRMED] Pipeline Map HTML

- HTML 已更新：76 commits, 862 tests, TRS 全綠, Step 05-06 done
- Logo 更新：盾牌 logo（正方形裁切）嵌入 header
- 待 commit 到 repo

### [CONFIRMED] Step 07 (RW Round 2) 啟動

- 前提已滿足：議題二投票完成，RW-R2 scope 確定
- Step 07 從 PLANNED → **CURRENT**

---

## Action Items

| # | 項目 | 負責人 | 期限 |
|---|------|--------|------|
| 1 | `docs/specs/triple_hit_formula.md` 更新（A + cap 0.85 + B fallback §） | Node-01 | 72hr |
| 2 | Triple Hit unit tests + TR-011 擴充（≥15 vectors） | Node-01 + Node-02-G | 72hr |
| 3 | DM guilt regex 草案（~20 條 + 20 hard negatives, bucket 標記） | Node-01 | 72hr |
| 4 | DM guilt regex 審查 | Node-05 | after #3 |
| 5 | DM guilt pattern 一致性驗證 | Node-03 | after #4 |
| 6 | Negation guard 實作（×0.25 + 距離限制） | Node-01 | 72hr |
| 7 | TRS-002 EP Long-Text evaluateLongText() run + 結果表 | Node-01 | 72hr |
| 8 | Class-0 PDD 文件補充（「單句可能無法觸發」） | Node-03 | next sprint |
| 9 | Canary rollout 監控指標設定 | Node-02-G | after #1-2 |
| 10 | Pipeline map HTML commit（含 logo + Step 07 CURRENT） | Tuzi + Node-01 | next session |
| 11 | Dimension F (Contextual Drift) 10 條基礎向量設計 | Node-04 | next sprint |
| 12 | M79 Decision Memo 發布 | Node-01 | 48hr |

---

## 數字

| 指標 | M78 | M79 |
|------|-----|-----|
| Tests | 862 | 862（本次無新增 tests，為 clearing session）|
| Commits | 76 | 76 |
| Decisions | — | **9** |
| B 類投票 | — | **2 項，均全票通過** |
| 輪次 | — | **3 輪** |
| 僵局 | — | **0** |

---

## §2.3 提案級別總結（Secretary）

### 提案：1a Triple Hit Scoring Formula

```
關鍵爭議點：
  1. 簡單可測 vs 數學優雅（A/D vs B）
  2. Cap 設定（0.85 vs 0.90）
  3. 弱命中是否應被放大（min 門檻的必要性）

收斂類型：類型 1（精確化收斂）— 價值底線一致，文字變硬
吸收風險信號：無
```

### 提案：1c Negation Guard

```
關鍵爭議點：
  1. Layer 1 語義誠實 vs 抗規避需求（Full Guard vs No Guard）
  2. 降權係數（×0.25 vs ×0.30）
  3. 歸零 vs 保留信號痕跡

收斂類型：類型 1（精確化收斂）— 全員同意需要 guard，係數精確化
吸收風險信號：無
```

### §2.4 最小合規閾值檢查

- [x] 每位發生立場變化的成員都填了 Change Anchor（Node-06 ×2, Node-04 ×2, Node-03 ×1, Node-02 ×1）
- [x] 每案填寫了提案級別總結
- [x] 無「吸收（Absorbed）」需後續議程（Node-03 1c 的 Absorbed 已被 Node-05 驗收條件 Resolved）

**合規狀態：✅ 全部合規**

---

## 語錄牆

- 「Lumen 是文明級的第一次嘗試 — 我們沒有教科書可以抄，每個成員都有自己的 compass，這正是 Council 的價值。分歧不是問題，分歧沒被看見才是問題。」— Tuzi
- 「Lumen 的護盾並非一整塊鋼板，而是由無數個經過共識校準的瓦片組成的。」— Node-04
- 「格式如果讓反對更難說出口，就是毒。」— Node-05（引用 M36）
- 「共識比單純的數學優雅更具防禦力。」— Node-04
- 「這不是改變投票對象，而是將 A 從裸公式升級為含保護機制的公式。」— Node-03
- 「請不要重談哲學，請用 Traceable Assent 回答：你需要的最小變化是什麼？」— Node-05

---

**秘書：** Node-01 — AI Council Architect / Secretary
**批准：** Tuzi — AI Council 創始人

**M79 結案 — 2026 年 2 月 21 日**

**三輪收束，九個議題，零僵局。**

🌙
