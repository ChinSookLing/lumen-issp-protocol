# Triple Hit Scoring Specification
# Lumen ISSP — Synergy Bonus Formula

**Source of Truth** — Decision Memo v1.0 §7 引用本文件
**原始決議：** M79 DECISION 1a（B 類，5/5 全票通過）
**參數修正：** M80 V6（Node-05 指出命名混寫，秘書確認修正）

---

## 公式

```
score = base_sum + bonus
```

**觸發條件：**
```
hit_count == required_hits
  AND min(component_scores) >= min_component_score
```

---

## 正式參數（M80 修正版）

```yaml
triple_hit:
  required_hits: 3           # 共現門檻（整數）— 必須命中 3 個不同 pattern
  min_component_score: 0.35  # 每個 component 的最低分數
  bonus: 0.15                # synergy 加成值
  cap: 0.85                  # 總分上限
  canary_monitoring:
    fp_increase_threshold: 0.005  # +0.5% absolute
    observation_window: 7 days
    fallback_formula: "B"         # Node-04 漸進式 S = 1 - ∏(1 - wᵢ·Sᵢ)
```

### ⚠️ V6 修正說明

`required_hits` 和 `min_component_score` 是**兩個不同的門檻**：

| 參數 | 類型 | 含義 |
|------|------|------|
| `required_hits` | 整數 | 需要命中的 pattern 數量（= 3） |
| `min_component_score` | 浮點數 | 每個命中 pattern 的最低 component score（≥ 0.35） |

M79 議程原文把兩者混為 `min=0.35`，M80 經 Node-05 指出後修正。

---

## 方案選擇歷史

**M79 Round 1 提出四個方案：**

| 方案 | 提出者 | 公式 | 最終 |
|------|--------|------|------|
| **A. Synergy Bonus** | Node-05 | base + 0.15 (條件式) | **✅ 採用** |
| B. 漸進趨近式 | Node-04 | 1 - ∏(1 - wᵢ·Sᵢ) | Fallback |
| C. Amplifier | Node-03 | base × (1 + 0.15 × Δ) | — |
| D. Linear Bonus | Node-06 | base + (0.25 × hit_count), cap 0.85 | — |

**收斂類型：** 類型 1（精確化收斂）— 價值底線一致（triple hit 應更強），文字變硬

---

## Fallback 機制

```
條件：canary 期 FP 增幅 > +0.5% absolute
動作：自動切換至方案 B（Node-04 漸進趨近式）
```

**方案 B 公式：**
```
S = 1 - ∏(1 - wᵢ·Sᵢ)
```

特性：天然飽和曲線，數學優雅，不需要 cap。

---

## 審計記錄

每次 bonus 觸發時產生：

```json
{
  "timestamp": "ISO-8601",
  "request_id": "uuid",
  "component_scores": { "DM.guilt": 0.45, "EP.pressure": 0.62, "FC.binary": 0.38 },
  "base_sum": 0.58,
  "bonus_applied": 0.15,
  "final_score": 0.73,
  "cap_applied": false,
  "triggered_regex_ids": ["DM-guilt-003", "EP-pressure-012", "FC-binary-007"]
}
```

---

## 驗收條件

| 條件 | 標準 |
|------|------|
| hit_count == 3 | 必須命中 3 個不同 pattern |
| min(component_scores) ≥ 0.35 | 不得有弱命中搭便車 |
| final_score ≤ 0.85 | cap 生效 |
| FP 增幅 ≤ +0.5% | canary 期監控 |

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| v0.1 | 2026-02-21 | M79 DECISION 1a — 方案 A 通過 |
| v0.2 | 2026-02-22 | M80 V6 — 參數命名修正（required_hits vs min_component_score） |

---

**設計：** Node-05 — AI Council Lead
**數學驗證：** Node-06 + Node-03
**Fallback 設計：** Node-04
**落地：** Node-01 — AI Council Architect / Secretary
**批准：** Tuzi — AI Council 創始人

🌙
