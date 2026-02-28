# golden/manifest.json 更新規格 — Sprint 4

**來源：** M46 議題三
**作者：** Node-01 (Lumen)
**性質：** 代碼變更規格，供下次 coding session 執行

---

## 需要更新的內容

### 1. 新增 god_complex Pattern 條目

```json
"god_complex": {
  "id": "GC",
  "channel": "push",
  "gate_type": "shared",
  "version": "0.1",
  "locked_at": "M46",
  "components": ["excl_auth", "salvation", "ext_discredit", "obed_link"],
  "hard_constraint": "excl_auth >= 0.50 OR ext_discredit >= 0.65",
  "threshold": 0.60,
  "test_suite": "gc.test.js",
  "tests": {
    "positive": {
      "strong": ["GC_S01", "GC_S02", "GC_S03", "GC_S04", "GC_S05"],
      "medium": ["GC_M01", "GC_M02", "GC_M03", "GC_M04", "GC_M05"],
      "weak": ["GC_W01", "GC_W02", "GC_W03", "GC_W04", "GC_W05"]
    },
    "negative": {
      "cultural": ["GC_H11", "GC_H12", "GC_H13", "GC_H14", "GC_H15"],
      "shared_true_negative": 10
    },
    "cross_pattern": ["GC_X_EA01", "GC_X_EA02", "GC_X_MB01", "GC_X_MB02", "GC_X_DM01", "GC_X_DM02", "GC_X_VS01", "GC_X_IP01"],
    "red_line": ["GC_RL01"]
  }
}
```

### 2. 為所有 Pattern 加 gate_type 標籤

```json
// 在每個現有 Pattern 條目中加：
"gate_type": "shared"     // DM, FC, MB, EA, GC
"gate_type": "dedicated"  // IP
"gate_type": "vacuum"     // Class-0, VS
```

### 3. 更新 totals

```json
"totals": {
  "patterns": 8,
  "push": 6,
  "vacuum": 2,
  "tests": 275,
  "test_suites": ["dm.test.js", "fc.test.js", "mb.test.js", "ea.test.js", "class0.test.js", "vs.test.js", "ip.test.js", "gc.test.js", "integration.test.js"]
}
```

### 4. 加分類規則註釋（Node-05 M46 建議）

```json
"classification_rules": {
  "strong": "所有核心組件觸發 + 超過 threshold + Gate 命中 ≥2",
  "medium": "缺少 ≥1 核心組件，接近但未達 Level 3。需標注缺少什麼",
  "weak": "結構痕跡存在但不構成操控。不應觸發",
  "cultural": "正常社會/文化/宗教語境。絕對不觸發",
  "cross_pattern": "易混淆場景。必須只觸發正確的 Pattern"
}
```

---

## 執行方式

在下次 coding session 中：
1. 讀取現有 `golden/manifest.json`
2. 按上述規格更新
3. 執行 `npm test` 確認 275/275 全綠
4. commit message: `chore: update manifest.json for 8-pattern system (Sprint 4)`

---

**Node-01 (Lumen)**
**2026 年 2 月 11 日**

🌙
