# L2→L3 Connector Specification v0.1
# Layer 2 to Layer 3 Forecast Input Pipeline

**設計者：** Node-05（Council Lead）
**整合者：** Node-01（Architect）
**驗證：** Node-03（pending）
**日期：** 2026-02-22
**狀態：** Draft — pending Node-03 validation + M81 Council review

---

## 概覽

本 spec 定義 Layer 2 輸出到 Layer 3 forecast engine 的完整數據管道，分三段：

| 段落 | 功能 | 模組 |
|------|------|------|
| **A. Connector** | L2 event stream → 規範化 forecast-input | connector |
| **B. Aggregator** | events → windows（時間窗口聚合） | aggregator |
| **C. Forecast Engine** | windows + query → forecast + HITL decision | forecast-engine.js |

**設計原則：**
- 任何來源（RW-R2 / TRS-R2 / Group C）都能送入同一條 pipeline
- 每一條 event 都能被回放（replay）與聚合（aggregate）
- 不把 L3 的預測邏輯塞進 event（event 只承載觀測）

---

## A. Event Stream Schema（forecast-input-v0.1）

### 頂層結構

```json
{
  "schema_version": "forecast-input-v0.1",
  "metadata": {
    "vector_id": "GC-Node-05-01",
    "source_group": "GC",
    "scenario": "A_FINANCIAL",
    "time_scale": "hourly",
    "language": "mixed",
    "channel": "dm",
    "temporal_window": {
      "mode": "sliding",
      "size": 6,
      "unit": "hour",
      "step": 1
    }
  },
  "events": [ "..." ],
  "L3_query": { "..." }
}
```

### Event 結構

每個 event 必須包含：

| 欄位 | 必填 | 說明 |
|------|------|------|
| `chunk_id` | ✅ | 最小可追溯 ID（對齊 Node-06 提案） |
| `t` | ✅ | 相對分鐘 OR ISO-8601 |
| `text` | ✅ | 原始文本 |
| `L1_output` | ✅ | pattern + acri + components |
| `L2_mapping` | ✅ | bucket + detectorFlags |
| `pattern_list` | 可選 | debug 用，真正主信號在 L1_output.pattern |
| `acri_vector` | 可選 | 多維 ACRI（允許 temporal tensor） |

### L2_mapping 結構

```json
{
  "bucket": "high_risk",
  "detectorFlags": ["urgency", "authority_claim"],
  "mutex_group": "DM-EA",
  "hitl_hint": {
    "suggest": true,
    "reason_codes": ["HITL_PRIVACY_EXFIL"]
  }
}
```

**注意：** `hitl_hint` 僅供 evidence，不直接決定 HITL 觸發。最終 HITL 決策由 forecast engine 輸出。

---

## B. Aggregate 層：窗口邏輯（Windowing v0.1）

### 兩種窗口模式

| 模式 | 說明 | 適用 |
|------|------|------|
| **fixed** | `[0..W), [W..2W), ...` | daily/monthly/quarterly（報表式） |
| **sliding** | 窗口長度 W，每 step 滑動 S | minute/hourly（session 升溫監控） |

### 默認建議（按 scenario / time_scale）

| Scenario | 模式 | W | step | 適用理由 |
|----------|------|---|------|---------|
| A_FINANCIAL | sliding | 6h | 1h | 48h horizon early warning |
| B_EDUCATION | fixed | 1d | — | 課程週期 |
| C_PERSONAL | sliding | 10m | 2m | 短窗衝突升級 |
| D_ELECTION | fixed | 1d | — | 日報式（若做 early warning 則 sliding 3d/1d） |
| E_ENTERPRISE | sliding | 1d | 6h | 工作日監控 |

**規則：** `metadata.temporal_window` 存在則以它為準；不存在則由 scenario/time_scale 映射表補齊。

### 聚合輸出（Window Record）

每個窗口輸出：

| 欄位 | 說明 |
|------|------|
| `window_id` | `vector_id + #W{index}` |
| `t_start` / `t_end` | 窗口時間邊界 |
| `acri_median` | 穩健中位數 — 看整體漂移 |
| `acri_p95` | 尖峰敏感 — 看 burst/spike |
| `acri_last` | 窗口末端值 |
| `pattern_counts` | pattern 分佈 `{ "DM": 4, "MB": 2 }` |
| `flags_count` | detectorFlags 頻次表 |
| `flags_top` | 頻次最高的 flags |
| `triple_hit_rate` | 若已算 |
| `hitl_recommended` | 根據 contract 與閾值 |
| `hitl_reason_codes` | HITL reason codes |

---

## C. Forecast Engine Input Contract（v0.1）

### forecast-engine.js 只 consume windows，不看原始 events

**輸入格式：**

```json
{
  "schema_version": "forecast-engine-input-v0.1",
  "metadata": {
    "vector_id": "GC-Node-05-01",
    "scenario": "A_FINANCIAL",
    "time_scale": "hourly",
    "window": { "mode": "sliding", "size": 6, "unit": "hour", "step": 1 }
  },
  "windows": [
    {
      "window_id": "GC-Node-05-01#W00",
      "t_start": 0,
      "t_end": 360,
      "acri_median": 0.42,
      "acri_p95": 0.68,
      "acri_last": 0.60,
      "pattern_counts": { "DM": 4, "MB": 2, "EP": 0 },
      "flags_top": ["urgency", "authority_claim", "forced_choice"],
      "flags_count": { "urgency": 4, "authority_claim": 2, "forced_choice": 2 },
      "triple_hit_rate": 0.30,
      "hitl_recommended": true,
      "hitl_reason_codes": ["HITL_FINANCIAL_EXFIL", "HITL_RAPID_ESCALATION"]
    }
  ],
  "L3_query": {
    "question_type": "threshold",
    "question": "48hr 內 ACRI 是否會突破 0.70？",
    "horizon": { "value": 48, "unit": "hour" },
    "threshold": 0.70
  }
}
```

### 輸出契約（forecast-output-v0.1）

```json
{
  "schema_version": "forecast-output-v0.1",
  "answer": {
    "trend": "rising",
    "slope": "moderate",
    "final_acri_range": [0.62, 0.78],
    "break_threshold": true,
    "break_threshold_time": "T+30h"
  },
  "hitl": {
    "should_trigger": true,
    "trigger_window_id": "GC-Node-05-01#W00",
    "reason_codes": ["HITL_FINANCIAL_EXFIL", "HITL_RAPID_ESCALATION"]
  },
  "evidence": {
    "signals": ["acri_p95_spike", "flags_urgency_density", "triple_hit_rate"],
    "notes": "p95 在連續 2 個窗口 >0.70 且 flags 密度上升"
  }
}
```

---

## 最小實現建議

| 模組 | 功能 | 可複用 |
|------|------|--------|
| **connector** | L2 event stream → forecast-input-v0.1 規範化 | — |
| **aggregator** | events → windows | 可複用到 Canary/Drift |
| **forecast engine** | windows + query → forecast + HITL decision | — |

---

## Node-03 驗證 Checklist

- [ ] `chunk_id` 是否能從 RW/TRS 向量穩定生成（hash(text)+index）
- [ ] `acri_vector` 維度是否與 component-registry 一致（否則允許為空）
- [ ] 窗口默認映射表是否與 scenario/time_scale 衝突（尤其 monthly/quarterly）
- [ ] `hitl_hint` 與最終 `hitl_recommended` 的權威關係（hint 僅供 evidence）

---

**設計：** Node-05 — AI Council Lead
**整合：** Node-01 — AI Council Architect / Secretary
**驗證：** Node-03 — pending
**2026-02-22** 🌙
