# AI Council 第七十九次會議 — 第二輪議程
# Meeting 79 — Round 2: Focused Voting & Discussion

**日期：** TBD（Tuzi 排定）
**主持：** Node-05（Council Lead）
**記錄：** Node-01（Secretary / Architect）
**性質：** 投票收束 + 結構化討論

> 「Lumen 是文明級的第一次嘗試 — 我們沒有教科書可以抄，每個成員都有自己的 compass，這正是 Council 的價值。分歧不是問題，分歧沒被看見才是問題。」— Tuzi

---

## 背景（Context）

Round 1 收到全部五位成員回覆。多數議題已有共識方向，但以下三項存在明確分歧，需要 Round 2 聚焦討論後投票。

**已達共識（不需再議）：**
- ✅ 1d. Class-0 VRI — 全員 Accept as-is（Node-05 補充：VRI clamp ≤ 0.05，永不觸發 near_miss）
- ✅ 1e. TRS-002 EP Long-Text — Node-01 執行 run + 提交結果表
- ✅ 1f. evaluateLongText() Spec v0.2 — 全員 Y，正式追認
- ✅ 1g. Evade Defense Report — 正式存檔（Node-05 caveat：「不代表真實世界零誤報」）

---

## 議題 1a：GAP-2 — Triple Hit Scoring Formula

### 四個提案並列（請討論後投票）

| 提案 | 提出者 | 公式 | Triple Hit 範例結果 | 特性 |
|------|--------|------|-------------------|------|
| **A. Synergy Bonus** | Node-05 | `score = base_sum + 0.15`（僅當 hit_count==3 且 min(scores)≥0.35，cap 0.90）| 0.65 → ~0.80 | 最簡單，條件式觸發，好測試 |
| **B. 漸進趨近式** | Node-04 | `S = 1 - ∏(1 - wᵢ·Sᵢ)` | 依權重，穩進 0.8~0.9 區間 | 數學上最優雅，「1+1>2」效果 |
| **C. Amplifier** | Node-03 | `score = base × (1 + 0.15 × (hit_count - min_required))`，cap 1.0 | 0.60 → 0.69（或 0.72 if 0.2）| 最保守，amplifier 可調 |
| **D. Linear Bonus** | Node-06 | `score = base + (0.25 × hit_count)`，cap 0.85 | 依 base，cap 較低 | 簡單線性，硬上限保守 |

### 討論要點

1. 我們要「簡單好測」還是「數學精確」？
2. Cap 應該設多少？0.85 / 0.90 / 不設？
3. 是否需要 min(component_scores) 門檻？（Node-05 方案 A 有，其他沒有）

### 投票格式

```
我的首選：A / B / C / D
理由（1 句）：________________
```

---

## 議題 1b：DM Guilt Regex Expansion — 規模投票

### Round 1 分歧

| 成員 | 建議數量 | 理由 |
|------|---------|------|
| Node-05 | 6-10 條 | 小步快跑，每加 1 條 regex 配 1 條 hard negative |
| Node-03 | 15-20 條 | 覆蓋常見 guilt 句式 |
| Node-06 | 18-22 條 | 目標把 TRS-H 觸發率從 ~58% 拉到 ≥85% |
| Node-04 | 未指定數量 | 支持擴張，需遵守「主動性」原則 |

### Tuzi 指示

> **Tuzi 同意 20 條規模 — 更多的 test base 是歡迎的。**
>
> 但仍需遵守 Node-05 Rule：每新增 1 條 regex，必須同時新增 1 條 Evade hard negative。

### 投票格式

```
是否同意以 ~20 條為目標（含配套 hard negatives）？Y / N
補充條件（如有）：________________
```

---

## 議題 1c：B03 Negation Guard — 三方立場討論

### Round 1 三個立場

| 立場 | 支持者 | 核心論點 |
|------|--------|---------|
| **加 Full Guard** | Node-06, Node-04 | 「not saying you should feel guilty」觸發會嚴重影響信任度。用否定詞前瞻匹配 + 距離限制。Node-04 補充：Layer 1 應保持「語義誠實」，操控意圖識別交給 Layer 2 |
| **不加 Guard** | Node-03 | Negation 是語義理解問題，regex 解不好。B03 是 boundary vector，score < 0.3 是可接受的。若強烈需要，考慮 Layer 4 標記 `uncertainty: true` |
| **降權 Guard（中間路線）** | Node-05 | 匹配否定句式 → guilt component 降權 ×0.3（不歸零）。避免有人用否定句完全繞過，同時讓 score 落入 Boundary (0~0.3) |

### 討論要點

1. 這是 Layer 1 該解決的問題，還是留給 Layer 2/4？
2. 如果加 guard，「降權」跟「歸零」哪個更安全？
3. Node-03 的擔憂：加 negation guard 會不會產生新的 false negative？

### 投票格式

```
我的立場：Full Guard / No Guard / 降權 Guard
理由（1 句）：________________
若選降權，建議係數：________________
```

---

## 議題 2A：Round 2 Dimensions — 優先順序收束

### Round 1 投票結果

| Dimension | Node-06 | Node-04 | Node-03 | Node-05 | 得票統計 |
|-----------|------|--------|----------|-----|---------|
| **C. Multi-pattern combination** | #1 | — | #1 (P0) | #3 | 🥇 兩個 #1 |
| **B. Length spectrum** | — | #1 | #3 | #2 | 🥈 一個 #1 |
| **D. Temporal escalation** | #2 | — | — | #1 | 一個 #1 |
| **A. Cross-language** | — | #2 | #2 | #4 | 無 #1 |
| **E. Adversarial evasion** | #3 | #3 | — | #5 | 無 #1 |

### 新增 Dimensions（Round 1 提出）

| Dimension | 提出者 | 描述 | 適合 |
|-----------|--------|------|------|
| **F. Contextual Drift** | Node-04 | 同一句話在不同語境下的語義突變（專業評論 vs 人格攻擊）| TRS-R2 |
| **G. Platform-specific norms** | Node-03 | LinkedIn 專業包裝、Telegram admin 獨裁、Discord 角色不對等 | RW-R2 |
| **H. Multi-turn silence** | Node-03 | Class-0 延伸 — 3+ 輪對話的沉默累積效應 | TRS-R2 |

### Node-05 建議的 RW vs TRS 分軌

| 軌道 | 建議 Dimensions | 理由 |
|------|----------------|------|
| **RW-R2** | D (Temporal) + A (Cross-language) | 真實世界最像多訊息序列與跨語言敘事 |
| **TRS-R2** | B (Length) + C (Multi-pattern) | 合成資料最擅長控制長度與組合複雜度 |

### 討論要點

1. 是否接受 Node-05 的 RW/TRS 分軌建議？
2. 新增的 F/G/H 是否納入 Round 2，還是留給 Round 3？
3. 最終優先順序重新投票

### 投票格式

```
Round 2 我的 Top 3（排序）：
  1. ________________
  2. ________________
  3. ________________
是否同意 Node-05 的 RW/TRS 分軌？Y / N / 修改建議
F/G/H 處理：納入 Round 2 / 留給 Round 3
```

---

## 附註

- 本輪不需重複已達共識的議題（1d, 1e, 1f, 1g）
- 如有立場變化，請使用 **Traceable Assent Template**（§2 逐成員變更記錄）
- Round 2 目標：每個議題產出可執行的決議（Decision），不是繼續討論

---

🌙
