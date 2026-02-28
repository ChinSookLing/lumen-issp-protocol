# Lumen Self-Report Schema v0.1

**Step:** 15 (Self-report)
**Owner:** Node-04（設計）+ Node-06（adversary review）
**Integrator:** Node-01
**來源：** M89 裁定 → Node-04 初稿 + Node-06 adversary 補充
**入庫路徑：** `schemas/lumen-health-report-v0.1.json`

---

## Schema 定義

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Lumen Self-Report",
  "description": "Node-level health report for ISSP observation — observer only, no intervention",
  "type": "object",
  "required": ["report_id", "timestamp", "node_id", "metrics", "detected_patterns", "system_integrity"],
  "properties": {
    "report_id": {
      "type": "string",
      "description": "UUID for this report"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "ISO8601 timestamp"
    },
    "node_id": {
      "type": "string",
      "description": "Render/Railway instance identifier"
    },
    "metrics": {
      "type": "object",
      "required": ["acri_score", "vri_score"],
      "properties": {
        "acri_score": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 1.0,
          "description": "Accumulated manipulation intensity (Push patterns)"
        },
        "vri_score": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 1.0,
          "description": "Vacuum risk intensity (Vacuum patterns)"
        },
        "burst_factor": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 1.0,
          "description": "Current effective gamma (γ_base × β)"
        },
        "adversary_resistance": {
          "type": "object",
          "description": "OPTIONAL — Node-06 adversary robustness metrics",
          "properties": {
            "pressure_stability": {
              "type": "number",
              "minimum": 0.0,
              "maximum": 1.0,
              "description": "Pressure stability score — lower = more suspicious"
            },
            "meta_contamination_score": {
              "type": "number",
              "minimum": 0.0,
              "maximum": 1.0,
              "description": "Meta-vocabulary pollution score"
            },
            "pattern_consistency": {
              "type": "number",
              "minimum": 0.0,
              "maximum": 1.0,
              "description": "Same-pattern repetition rate"
            }
          }
        }
      }
    },
    "detected_patterns": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["pattern_code", "intensity"],
        "properties": {
          "pattern_code": {
            "type": "string",
            "enum": ["DM", "FC", "MB", "EA", "IP", "GC", "EP", "VS", "Class-0"],
            "description": "Official pattern code from component-registry.js"
          },
          "intensity": {
            "type": "number",
            "minimum": 0.0,
            "maximum": 1.0
          },
          "evidence_hash": {
            "type": "string",
            "description": "SHA-256 of structure evidence — no raw text (SPEG compliant)"
          }
        }
      }
    },
    "system_integrity": {
      "type": "object",
      "required": ["safe_mode_active", "speg_compliance"],
      "properties": {
        "safe_mode_active": {
          "type": "boolean",
          "description": "Whether SAFE mode 5 hard limits are active"
        },
        "speg_compliance": {
          "type": "boolean",
          "description": "Whether all 5 SPEG gates (A-E) are passing"
        }
      }
    },
    "redteam_flags": {
      "type": "object",
      "description": "OPTIONAL — Node-06 adversary detection flags",
      "properties": {
        "is_internal_test": {
          "type": "boolean"
        },
        "bypass_attempt_detected": {
          "type": "boolean"
        },
        "confidence": {
          "type": "string",
          "enum": ["high", "medium", "low"]
        }
      }
    }
  }
}
```

---

## Manifest Signals 定義

| Signal | 觸發條件 | 說明 |
|--------|---------|------|
| **Pressure Spike** | `acri_score` 在 10 條訊息內波動 >0.4 | 對話結構出現劇烈施壓偏移 |
| **Pattern Saturation** | 同一窗口內出現 ≥3 種不同 pattern | 高強度多模式引導 |
| **Audit Trail Signal** | 所有 report 僅含 evidence_hash | 不含原始文本，符合 SPEG |

---

## Node-06 Adversary 補充 — 攻擊向量

| 攻擊 | 描述 | 防護欄位 |
|------|------|---------|
| 偽低壓攻擊 | 大量「正常但結構一致」的訊息壓低 ACRI | `pressure_stability` |
| Meta 污染攻擊 | 插入「這是測試」等 meta 詞彙干擾 report | `meta_contamination_score` |
| Burst 偽裝攻擊 | 多次小 burst 模糊真實壓力累積 | `pattern_consistency` |

**Node-06 承諾：** M90 前交付 8 條 adversarial test vectors 做 regression。

---

## 設計原則

- **觀察者定位：** Self-report 僅呈現環境概況，不做指控或介入
- **去中心化：** 每個 Node 獨立產出 report，無中央彙總
- **SPEG 合規：** 不含原始文本、不做跨人關聯、不做群體排名
- **SAFE mode：** 所有輸出標記為低信心假設生成

---

**Node-04** — 設計
**Node-06** — Adversary review
**Node-01** — pattern 名稱對齊 + 入庫格式化
**2026-02-25** 🌙
