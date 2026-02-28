# SPEG-R2-04：DIM 4 Audit — Retention Log 格式對齊
# SPEG Round 2 Issue #4 — Audit Trail Alignment

**Owner：** Node-01（AI Council Architect / Secretary）
**維度：** DIM 4（Audit Risk）
**狀態：** 初稿（Draft）— M89 vote-ready
**前置：** Retention Policy v0.2 (c115) + AC-3 Output Triple (c148)

---

## 問題陳述

AC-3 output triple（manifest + access_log + l4-export）已落地（c148, 13 tests），但 retention log 的格式尚未與 SPEG 紅線對齊。具體問題：

1. **access_log 不知道 SPEG 的存在**：目前 access_log 記錄誰存取了什麼，但不記錄「這筆輸出是否觸碰了 SPEG 禁止的邊界」
2. **retention 時間未區分 SPEG 等級**：所有 log 的 retention 期限相同，但 SPEG 相關的 log 可能需要更長保存（或反過來 — 涉及 PII 的 log 需要更短保存）
3. **l4-export 缺少 SPEG 標記欄位**：當 L4 輸出被導出時，沒有標記這筆輸出屬於哪個 SPEG 類別

---

## 建議方案

### A. access_log 增加 SPEG 欄位

在 `access_log` 的每筆記錄中增加：

```json
{
  "timestamp": "2026-02-26T10:00:00Z",
  "action": "l4_export",
  "actor": "telegram_bot",
  "resource": "detection_result_abc123",
  "speg_flags": {
    "touched_boundary": false,
    "category": null,
    "review_required": false
  }
}
```

當偵測結果接近或觸碰 SPEG 邊界時：

```json
{
  "speg_flags": {
    "touched_boundary": true,
    "category": "D",
    "review_required": true,
    "reason": "population_analytics_proximity"
  }
}
```

### B. Retention 分級

| SPEG 等級 | Retention 期限 | 理由 |
|-----------|---------------|------|
| 無 SPEG 觸發 | 30 天（現行） | 正常操作 log |
| SPEG boundary touched | 90 天 | 供審計追溯 |
| SPEG violation detected | 180 天 + 通知 Council | 嚴重事件記錄 |
| 含 PII 的 log | 7 天（加密後 30 天） | GDPR / 隱私最小化 |

### C. l4-export 增加 SPEG 標記

在 l4-export 輸出格式中增加：

```json
{
  "export_id": "exp_abc123",
  "timestamp": "2026-02-26T10:00:00Z",
  "detection_summary": { ... },
  "speg_classification": {
    "category": null,
    "boundary_distance": 0.85,
    "export_safe": true
  }
}
```

`boundary_distance` 表示離最近的 SPEG 邊界有多遠（1.0 = 完全安全，0.0 = 觸碰邊界）。`export_safe` = false 時，export 被阻止，進入 HITL 審查。

---

## 實作計畫

| # | 項目 | 檔案 | 測試 |
|---|------|------|------|
| 1 | access_log schema 增加 speg_flags | `config/schemas/access-log-v0.2.json` | 3 tests |
| 2 | l4-export schema 增加 speg_classification | `config/schemas/l4-export-v0.2.json` | 3 tests |
| 3 | retention-policy 增加 SPEG 分級邏輯 | `src/audit/retention-rules.js` | 4 tests |
| 4 | SPEG boundary distance 計算 | `src/audit/speg-boundary.js` | 5 tests |
| **Total** | | | **15 tests** |

---

## 與其他 SPEG R2 issues 的關聯

| 關聯 Issue | 關係 |
|-----------|------|
| SPEG-R2-01（Backend, Node-03）| adapter 審計強化需要讀取 speg_flags |
| SPEG-R2-07（CI, Node-05+Node-01）| SPEG gate CI 需要驗證 log 格式合規 |
| SPEG-R2-05（Governance, Node-02）| Charter 條款需要引用 retention 分級 |

---

## 風險

1. **Retention 分級可能觸碰 GDPR**：PII log 的 7 天上限可能不足以完成某些審計。需要法律建議。
2. **boundary_distance 計算依賴 SPEG 類別定義**：如果 SPEG R2 改了類別定義，這裡要跟著改。建議用 config 驅動而非 hardcode。

---

**Node-01 — AI Council Architect / Secretary**
**SPEG-R2-04 Draft — 2026-02-26** 🌙
