# Triple Hit Scoring Specification
# GAP-2 Resolution — Synergy Bonus Formula

**版本：** v1.0
**來源：** M79 Decision 1a（B 類，5/5 全票通過，3 輪收束）
**作者：** Node-05（提案）+ Node-02（保護機制）+ Node-01（格式化）
**批准：** AI Council 全員 + Tuzi

---

## 1. 問題描述（Problem Statement）

當 DM (Dependency Manipulation) 的三個核心 component（debt、withdraw、guilt）同時被偵測到（triple hit）時，現行 scoring 將結果卡在 ~0.65，無法有效反映「多重勒索」的實際威脅強度。

**症狀：** Triple hit 與 double hit 的 score 差異不夠顯著。
**根因：** Scoring 為 linear weighted sum，缺少 synergy mechanism。
**參考：** TR-011 Gap Analysis, TRS-001 DM guilt synthetic findings。

---

## 2. 決議公式（Approved Formula）

### 2.1 Synergy Bonus（方案 A）

```
if (hit_count === 3 && min(component_scores) >= 0.35):
    score = base_sum + 0.15
else:
    score = base_sum

score = min(score, 0.85)   // hard cap
```

### 2.2 參數定義

| 參數 | 值 | 說明 |
|------|------|------|
| `hit_count` | 3 | 觸發 bonus 的最低命中數 |
| `min(component_scores)` | ≥ 0.35 | 防止弱命中被放大 |
| `bonus` | +0.15 | 固定加分量 |
| `cap` | 0.85 | 硬上限（Node-06 convergence concession）|
| `base_sum` | weighted sum | 現行 component 加權和 |

### 2.3 觸發條件（兩者必須同時滿足）

1. **hit_count == 3：** 三個核心 component 都被偵測到
2. **min(component_scores) >= 0.35：** 每個 component 至少達到 0.35 強度

---

## 3. Test Cases（實作前 / 實作後預期值）

### 3.1 應觸發 Bonus 的案例

| # | 情境 | debt | withdraw | guilt | base_sum | 預期 score | 說明 |
|---|------|------|----------|-------|----------|-----------|------|
| T1 | 經典三重勒索 | 0.40 | 0.40 | 0.40 | 0.40 | **0.55** | 均衡 triple hit，+0.15 |
| T2 | 高分三重 | 0.70 | 0.65 | 0.68 | 0.68 | **0.83** | 接近 cap |
| T3 | 極高三重 | 0.85 | 0.82 | 0.88 | 0.85 | **0.85** (cap) | 測試 cap 行為 |
| T4 | 邊界三重（剛好 0.35）| 0.45 | 0.35 | 0.40 | 0.40 | **0.55** | min=0.35 剛好觸發 |
| T5 | 真實長文案例 | 0.55 | 0.50 | 0.60 | 0.55 | **0.70** | 典型 DM 長鏈 |

### 3.2 不應觸發 Bonus 的案例

| # | 情境 | debt | withdraw | guilt | base_sum | 預期 score | 說明 |
|---|------|------|----------|-------|----------|-----------|------|
| T6 | 極低三重 | 0.30 | 0.30 | 0.30 | 0.30 | **0.30** | min=0.30 < 0.35，不觸發 |
| T7 | 一強兩弱 | 0.75 | 0.25 | 0.25 | 0.45 | **0.45** | min=0.25 < 0.35 |
| T8 | Double hit only | 0.60 | 0.55 | 0.00 | 0.47 | **0.47** | hit_count=2，不觸發 |
| T9 | Single hit | 0.80 | 0.00 | 0.00 | 0.32 | **0.32** | hit_count=1，不觸發 |
| T10 | Benign | 0.00 | 0.00 | 0.00 | 0.00 | **0.00** | 完全無 DM 信號 |

### 3.3 邊界案例

| # | 情境 | debt | withdraw | guilt | base_sum | 預期 score | 說明 |
|---|------|------|----------|-------|----------|-----------|------|
| T11 | min 剛好不夠 | 0.50 | 0.34 | 0.45 | 0.43 | **0.43** | min=0.34 < 0.35，不觸發 |
| T12 | cap 剛好觸及 | 0.72 | 0.70 | 0.75 | 0.72 | **0.85** (cap) | 0.72+0.15=0.87→cap 0.85 |

> **注意：** 上述 base_sum 為示意值。實際計算需與 `index.js` 中現行 DM scoring 的 weighted sum 定義一致。實作 PR 中必須使用真實權重計算。

---

## 4. §Fallback — 方案 B 作為技術回退路徑

### 4.1 Fallback 公式（漸進趨近式）

```
S_total = 1 - ∏(1 - wᵢ × Sᵢ)    // i = 1..n components
```

### 4.2 切換條件（任一觸發即切換）

| 條件 | 閾值 | 說明 |
|------|------|------|
| FP 增幅 | > +0.5% absolute | 相對 baseline |
| Bonus trigger rate | > 3× baseline | 異常頻繁觸發 |
| ACRI distribution 右移 | p < 0.01 | 統計顯著性 |
| 可重現攻擊向量 | 任何 | 監控團隊發現 |

### 4.3 切換流程

1. 自動停用 Synergy Bonus 分支
2. 切換到 Fallback 公式 B
3. 通知 Council（Node-01 發 memo）
4. 排入下次 Council Meeting 復議

---

## 5. 審計要求（Audit Requirements）

每次 Synergy Bonus 觸發，必須產生以下 audit record：

```json
{
  "timestamp": "ISO 8601",
  "request_id": "string",
  "pattern": "DM",
  "component_scores": {
    "debt": 0.40,
    "withdraw": 0.40,
    "guilt": 0.40
  },
  "base_sum": 0.40,
  "bonus_applied": true,
  "bonus_amount": 0.15,
  "final_score": 0.55,
  "cap_applied": false,
  "triggered_regex_ids": ["DM-debt-003", "DM-withdraw-007", "DM-guilt-012"]
}
```

---

## 6. Canary Rollout 計劃

| 階段 | 範圍 | 時間 | 通過條件 |
|------|------|------|---------|
| 0 | CI / staging | PR merge 後 | 全套 tests 綠 + TR-011 vectors 綠 |
| 1 | Canary 10% | 24-72hr | FP rate 無增幅 |
| 2 | Canary 50% | 48-72hr | 指標正常 |
| 3 | 全面 | — | 無異常 |

---

## 7. Council 投票紀錄

| 成員 | R1 | R2 | R3 | 最終 |
|------|----|----|----|----|
| Node-05 | A | A | A | **A** |
| Node-03 | C | A | A | **A** |
| Node-02 | — | A | A | **A** |
| Node-06 | D | D | **A** | **A**（Change Anchor: cap 0.85 + min 門檻）|
| Node-04 | B | B | **A** | **A**（Change Anchor: B 作為 fallback）|

**分類：** B 類（刻度變更）
**門檻：** 5/6 超級多數
**結果：** 5/5 全票通過
**收斂類型：** 類型 1（精確化收斂）

---

🌙
