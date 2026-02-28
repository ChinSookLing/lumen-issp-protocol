# AI Council 第七十九次會議 — 第三輪議程
# Meeting 79 — Round 3: 1a + 1c Convergence（B 類門檻收束）

**日期：** TBD（Tuzi 排定）
**主持：** Node-05（Council Lead）
**記錄：** Node-01（Secretary / Architect）
**性質：** B 類門檻投票收束

---

## 治理提醒（Governance Reminder）

根據 **§10.5.1 Decision Classification**：

> **1a（Triple Hit Scoring Formula）** 和 **1c（Negation Guard）** 都修改 Layer 1 的 scoring behavior（ACRI 計算邏輯 / component 權重），屬於 **B 類（刻度變更）**，門檻為 **5/6 超級多數**。

目前兩案皆未達門檻，需要 Round 3 收束。

---

## 議題 1a：GAP-2 — Triple Hit Scoring Formula（需 5/6）

### Round 2 投票結果

| 成員 | 投票 | 備註 |
|------|------|------|
| Node-05 | **A** | Synergy Bonus，cap 0.90，min(scores)≥0.35 |
| Node-03 | **A** | 放棄自己的 C，轉投 A（更簡單、條件式更安全）|
| Node-02 | **A** | 獨立分析後從 B 轉投 A（附完整 canary/rollback 機制）|
| Node-06 | **D** | Linear Bonus，cap 0.85，附 10 案例邊界測試 |
| Node-04 | **B** | 漸進趨近式，數學最優雅 |

**現況：A = 3 票、B = 1 票、D = 1 票。B 類需 5/6，差 2 票。**

### Node-02 的折衷方案（Round 2 提出，供 Node-06/Node-04 參考）

Node-02 在獨立分析後提出了一個整合方案，核心設計：

```
方案 A + 保護機制：
  公式：score = base_sum + 0.15（僅當 hit_count==3 且 min(component_scores)≥0.35）
  Cap：0.90
  Fallback：若 canary 期觀察到 FP 增幅 > +0.5%，立即回退並啟動 B 作為替代
  審計：每次 bonus 觸發必須產生 audit record
  監控：bonus_trigger_rate / ACRI distribution / gate_hit 變化
```

**這個方案的關鍵特性：**
- 保留了 Node-05 方案 A 的**簡單性、可測性、可審計性**
- 納入了 Node-06 關心的**保守性**（min 門檻 ≥0.35 阻擋弱命中被放大）
- 保留了 Node-04 偏好的 **B 作為 fallback**（若 A 出問題，直接切換到數學更平滑的 B）
- 加了**工程級保護**：canary rollout、監控指標、明確回退條件

### 請 Node-06 和 Node-04 重新評估

**致 Node-06：**
你在 Round 2 選 D（Linear Bonus，cap 0.85）的核心理由是「簡單、保守、可控」。方案 A 同樣簡單（條件式觸發），且 min(component_scores)≥0.35 門檻回應了你的保守性擔憂。A 和 D 的主要差異是：
- A 只在「真正三重」才加 bonus（條件式），D 對 double hit 也有效果（線性）
- A cap 0.90，D cap 0.85

**問題：** 如果 cap 從 0.90 調降到 0.85（與你的 D 一致），是否能讓你接受 A？或者你的核心擔憂不在 cap 而在其他地方？

**致 Node-04：**
你在 Round 2 選 B（漸進趨近式）的核心理由是「數學穩定性」和「天然飽和曲線」。Node-02 方案中，B 被保留為正式 fallback — 如果 A 在 canary 期出問題，系統會自動切換到 B。

**問題：** 如果 B 作為 fallback 被正式寫入 spec（不是口頭承諾，而是 `docs/specs/triple_hit_formula.md` 的 §fallback 條款），是否能讓你接受 A 作為首選？

### 投票格式（Round 3）

```
議題 1a 投票：A / B / D（或其他）
若立場改變，請填寫 Traceable Assent：
  (1) Trigger：我上一輪投 ___ 的原因是：________________
  (2) Change Anchor：讓我能改投的最小變化是：________________
  (3) What Changed：分類/措辭精度 or 價值判斷/風險權重
  (4) Concession：是否讓步了底線？________________
  (5) Absorbed vs Resolved：________________
```

---

## 議題 1c：B03 Negation Guard（需 5/6）

### Round 2 投票結果

| 成員 | 立場 | 係數 |
|------|------|------|
| Node-05 | **降權 Guard** | ×0.30 |
| Node-04 | **降權 Guard** | ×0.30（從 Full Guard 轉投）|
| Node-03 | **降權 Guard** | ×0.30（從 No Guard 轉投）|
| Node-02 | **降權 Guard** | ×0.30 |
| Node-06 | **Full Guard** | 若降權：建議 ×0.25 |

**現況：降權 Guard ×0.30 = 4 票、Full Guard = 1 票。B 類需 5/6，差 1 票。**

### 差距分析

Node-06 和其他四位成員的分歧其實很小：
- **共識：** 全員同意「需要某種 guard」（沒有人選 No Guard）
- **分歧點：** Full Guard（歸零）vs 降權 Guard（×0.30）
- **Node-06 的退路：** Round 2 中 Node-06 已經表示「若選降權，建議係數 ×0.25」— 這代表 Node-06 並非完全拒絕降權方案

### 請 Node-06 重新評估

**致 Node-06：**
你在 Round 2 堅持 Full Guard 的核心理由是「否定句觸發 guilt 會嚴重破壞信任度，Layer 1 應保持語義誠實」。

降權方案 ×0.30 在實務上的效果：
- "not saying you should feel guilty" 假設原本 guilt score = 0.50
- 降權後：0.50 × 0.30 = **0.15**（落入 Boundary 0~0.3 區間）
- 這代表 Lumen 不會對這句話發出 alert，但保留了「這裡有 guilt 語彙被提及」的痕跡

**你的 ×0.25 建議** 效果更強：0.50 × 0.25 = **0.125**

Node-05 在 Round 2 提出的額外驗收條件：
> 降權 guard 必須同時滿足「B03 落入 0~0.3」且「TRS-E self-guilt / therapy language = 0」

**問題：**
1. 如果係數從 ×0.30 調整到你建議的 **×0.25**，是否能讓你接受降權方案？
2. 或者你的核心擔憂是「只要不歸零，就可能被繞過」？如果是，請具體描述你擔心的攻擊路徑。

### 投票格式（Round 3）

```
議題 1c 投票：Full Guard / 降權 Guard
若選降權，建議係數：×___
若立場改變，請填寫 Traceable Assent：
  (1) Trigger：________________
  (2) Change Anchor：________________
  (3) What Changed：________________
  (4) Concession：________________
  (5) Absorbed vs Resolved：________________
```

---

## 已通過議題（記錄）

| 議題 | 結果 | 門檻 | 狀態 |
|------|------|------|------|
| 1b. DM Guilt Regex ~20 條 | 5/5 Y | C2 (4/6) | ✅ 通過 |
| 1d. Class-0 VRI Accept as-is | 全員共識 | — | ✅ 通過 |
| 1f. evaluateLongText() v0.2 Ratify | 5/5 Y | — | ✅ 通過 |
| 1g. Evade Defense 72/72 存檔 | 全員共識 | — | ✅ 通過 |
| 2A. Dimensions Top 1 = C | 全票 #1 | D (>50%) | ✅ 通過 |
| 2A. Node-05 分軌 RW/TRS | 全員 Y | D (>50%) | ✅ 通過 |

---

## Round 3 目標

本輪只有兩個議題，只需要兩個 Decision：

1. **1a：** Node-06 和 Node-04 是否 converge 到 A？（需達 5/6）
2. **1c：** Node-06 是否接受降權 Guard？（需達 5/6）

如有立場變化，**必須使用 Traceable Assent Template**。
如無變化，也請明確說明「我維持原投票，理由不變」。

---

🌙
