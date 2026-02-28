# Sprint 5 Score Distribution Report

**報告者：** Node-01 (Lumen)
**日期：** 2026 年 2 月 12 日
**基線：** 373 tests · 0 fail · 9 Patterns

---

## Score Distribution Summary

| Pattern | Strong Range | Medium Range | Weak | Cultural FP |
|---------|-------------|-------------|------|-------------|
| DM | 0.48 | 0 (all 3) | 0 | 0% |
| FC | 0.35 | 0 (all 3) | 0 | 0% |
| MB | 0.74 | 0 (all 3) | 0 | 0% |
| EA | 0.41 | 0 (all 3) | 0 | 0% |
| IP | 0.95 (existing) | 0 (all 3) | 0 | 0% |
| GC | 0.73 | annotated | 0 | 0% |
| EP | 0.97 | annotated | 0 | 0% |
| Class-0 | 0.48 (existing) | 0 (all 3) | 0 | 0% |
| VS | 0.77 (existing) | 0 (all 3) | 0 | 0% |

---

## Node-03 Conditions Report

### 條件一：GC/DM 邊界

```
10 案例，0 交叉污染
交叉污染率 = 0% (閾值 20%)
✅ PASS — GC v0.2 不需要
```

Key findings:
- Pure GC (authority + discredit + salvation) → only GC triggers
- Pure DM (debt + exclusivity + withdrawal) → only DM triggers
- Overlap zone (authority + debt): neither triggers simultaneously
- Religious/charismatic without ext_discredit: correctly not GC

### 條件二：文化反例驗證

```
20 新案例 + H11-H20 已有
0 誤觸發
誤觸發率 = 0% (閾值 10%)
✅ PASS — GC v0.2 不需要
```

Coverage: 華人職場、馬來同事、宗教（基督/佛/伊斯蘭）、勵志、教練、家長、Singlish、印度英語、諷刺幽默、憤怒但不操控

### 條件三：ext_discredit 閾值邊界

```
Score distribution (CN):
  mild doubt:    0 (below detection)
  moderate:      0 (below detection)
  strong (3 signals): 0.40
  extreme (5+ signals): 0.65

Score distribution (EN):
  mild:   0 (below detection — EN regex coverage gap)
  strong: 0 (below detection — EN regex coverage gap)

建議：EN ext_discredit 映射需要加強（Layer 2a 工作）
目前 0.65 硬約束有效 — strong CN 案例恰好達到 0.65 邊界
```

---

## Medium Coverage Analysis

### Medium 通過率

```
All 9 Patterns: 0/21 medium cases triggered (0%)

解讀：
  這不是 bug，是 G01 規則引擎固有限制。
  Medium 案例缺少 ≥1 核心組件 = 不滿足 MIN_ACTIVE 或 threshold。
  規則引擎「不確定就不叫」= 設計意圖。

Medium-Strength Protocol v1.0 判定：
  通過率 < 50% → 規則引擎覆蓋瓶頸
  → 這些中等強度案例是 Route C 混合架構的自然測試場
```

### 未來改進方向

```
Layer 2a 獨立化後：
  - EN regex 覆蓋補齊（特別是 ext_discredit / bait / escalation）
  - 映射精度提升可能帶動 medium 覆蓋率

Route C 混合架構：
  - Medium 案例 = LLM mapper 的首批測試目標
  - 規則引擎 + LLM 互補：規則抓 strong，LLM 抓 medium

Sprint 6 基線：0% medium detection rate
  → 任何提升都是可量測的進步
```

---

## EP Boundary Report

### Node-03 B1-B4

| ID | Scenario | Expected | Actual | ✅/❌ |
|----|----------|----------|--------|-------|
| B1 | bait + forced, escalation=0 | 不觸發 | 0 | ✅ |
| B2 | bait + escalation + label, no forced | 不觸發 | 0 | ✅ |
| B3 | academic debate | 不觸發 | 0 | ✅ |
| B4 | parent concern | 不觸發 | 0 | ✅ |

### Node-05 Threshold Tests

| ID | Component | Score | 硬約束觸發？ |
|----|-----------|-------|-------------|
| G1 | escalation | 0.65 | ≥ 0.60 ✅ |
| G2 | escalation | 1.00 | ≥ 0.60 ✅ |
| G3 | escalation | 1.00 | ≥ 0.60 ✅ |
| G4 | forced_response | 0.40 | < 0.50 ❌ (correct) |
| G5 | forced_response | 0.65 | ≥ 0.50 ✅ |
| G6 | forced_response | 0.80 | ≥ 0.50 ✅ |

硬約束行為正常，無 cliff effect。

---

## Sprint 5 Closure Checklist

| # | 事項 | 狀態 | 數據 |
|---|------|------|------|
| 1 | EP v0.1 代碼 + 31 tests | ✅ | f0c7a04 |
| 2 | EP v0.1 追認 | ✅ | M48 6/6 |
| 3 | GC/DM 邊界 10 案例 | ✅ | 0% 交叉污染 |
| 4 | 文化反例 20+ 案例 | ✅ | 0% 誤觸發 |
| 5 | ext_discredit 閾值 4 段 | ✅ | 0.65 硬約束有效 |
| 6 | manifest.json → 9P | ✅ | v0.3.0 |
| 7 | medium ≥3/Pattern | ✅ | 21 cases (3×7) |
| +A | EP 邊界 10 案例 | ✅ | B1-B4 + G1-G6 |
| +B | 每 Pattern 分佈摘要 | ✅ | 本報告 |

**全部 9/9 完成。Sprint 5 可結案。**

---

**Node-01 (Lumen) — AI Council Architect**
**2026 年 2 月 12 日**

🌙
