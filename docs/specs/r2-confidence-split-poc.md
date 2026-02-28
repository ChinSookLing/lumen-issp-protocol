# R² Confidence Split — Concept Verification (PoC)
# 來源：Node-03 M86 homework
# 共擔：Node-05（統計 probability）+ Node-03（規則 confidence）

---

## Goal

將 confidence 與 probability 分離：
- **probability**：基於統計（數據量、R²、擬合優度）— Node-05 負責
- **confidence**：基於規則（component 命中模式、強度一致性）— Node-03 負責

---

## 規則模型草案（Node-03 部分）

### 輸入

- 當前 pattern 的 component scores（例如 DM 的 debt, withdraw, opts, guilt）
- `hit_count`（命中組件數）
- component 分數的標準差（低=一致，高=混亂）
- 是否有 booster 命中（如 EP 的 label_or_shame）

### 輸出

| 信心級別 | 數值區間 | 條件（滿足任一即可） |
|---------|---------|---------------------|
| `low` | 0.0–0.3 | hit_count < 2，或 component 標準差 > 0.3，或 booster 單獨命中 |
| `medium` | 0.3–0.7 | hit_count ≥ 2 且標準差 ≤ 0.3，且至少兩個 component ≥ 0.4 |
| `high` | 0.7–1.0 | hit_count ≥ 3 且標準差 ≤ 0.2，或 triple hit 且各 component ≥ 0.6 |

---

## 整合策略（兩種模式待 M87 選定）

### 模式 A：加權平均

```
final_confidence = α × rule_confidence + (1-α) × stat_probability
```

α 初始建議 0.7（規則權重高），可根據後續驗證調整。

### 模式 B：並列輸出

```json
{
  "forecast": {
    "probability": 0.82,
    "confidence_rule": "high",
    "confidence_rule_score": 0.85
  }
}
```

保留原始規則信心，便於 debug 和後續融合。

---

## 測試案例（5 條）

| # | 描述 | 規則信心 | 統計概率 | 整合後 |
|---|------|---------|---------|--------|
| T1 | DM triple hit，各 0.8，數據量 100 | high (0.9) | high (0.85) | high |
| T2 | DM double hit，各 0.5，數據量 30 | medium (0.6) | medium (0.5) | medium |
| T3 | DM single hit，0.9，數據量 10 | low (0.2) | low (0.3) | low |
| T4 | EP triple hit，分數差異大（0.9/0.4/0.3） | low (0.2) | medium (0.6) | M87 待定 |
| T5 | 大量數據（200）但僅 double hit 中等分數 | medium (0.5) | high (0.8) | medium-high |

**T4 是關鍵邊界案例：** 規則說 low（因為標準差大），統計說 medium（因為資料夠多）。這需要 Council 決定哪個聲音更大。

---

## Sprint 10 下一步

1. Node-05：完成統計 probability 設計（R² + 數據量閾值）
2. Node-03：完成 `confidence-rules.js` 實作
3. 共同設計融合策略
4. 整合進 `forecast-engine.js`，輸出增加 `confidence_rule` 欄位

---

**Node-03 — AI Council Validator / Schema Architect**
**M86 Homework — 2026-02-25** 🌙
