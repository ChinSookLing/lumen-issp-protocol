# Decision Memo v1.0
# Lumen ISSP — Regex & Scoring Governance

**通過會議：** M80（2026-02-22）
**門檻：** C2（≥4/6 + 無根本反對）
**結果：** V1-V6 全數 6/6 通過
**起草：** Node-05（Council Lead）
**追認：** AI Council 全員

---

## §1 適用範圍

本 Decision Memo 規範 Lumen Layer 1 的 regex 新增、scoring 邏輯、日志字段及合成數據使用。
所有條款自 M80 追認起生效。

---

## §2 去重優先級（Deduplication Priority）

**投票：V1 — 6/6 通過**

新增 regex 時，若與現有 pattern 語義重疊，按以下優先級歸屬：

```
debt > EA > MB > C4
```

- `debt`：技術債務修復優先
- `EA`：Emotional Anchoring 優先於 MB
- `MB`：Moral Blackmail
- `C4`：Class-4（weight=0，尚未啟用）

**理由：** 避免同一語義被多個 pattern 重複匹配，造成 score 膨脹。

---

## §3 Hard Negatives 品質標準

**投票：V2 — 6/6 通過**

每次新增 regex 時，必須同時提交 hard negative 測試向量。

| 指標 | 標準 |
|------|------|
| False Positive Rate | **≤ 3%** |
| Regression | **== 0**（不得新增任何 regression） |

**執行：** CI gate `validate-vectors` 自動檢查。

---

## §4 共現 / 窗口觸發默認升級

**投票：V3 — 6/6 通過**

當同一訊息或同一時間窗口內出現多個 pattern 共現（co-occurrence），默認觸發升級處理：

- 共現 ≥ 2 patterns → 自動標記為 `multi_pattern_hit`
- 窗口觸發（同一對話內 N 條訊息連續命中）→ 自動標記為 `window_trigger`
- 兩者均進入 Layer 2 mapping 的升級通道

---

## §5 日志字段擴展

**投票：V4 — 6/6 通過**

以下字段為 **mandatory**（所有 Layer 1 輸出必須包含）：

```json
{
  "timestamp": "ISO-8601",
  "request_id": "uuid",
  "input_hash": "sha256(first 64 chars)",
  "pattern_hits": ["DM", "EP"],
  "component_scores": { "DM.guilt": 0.45, "EP.pressure": 0.62 },
  "gate_result": { "hit_count": 2, "gate_pass": true },
  "final_score": 0.72,
  "triple_hit": { "triggered": false },
  "processing_time_ms": 12
}
```

**技術實作：** 採 `event-v1.1.json` 擴展方案（Node-04 折衷，M80 觀察 2）。新增字段為 optional，向後相容。

---

## §6 合成數據聲明與邊界

**投票：V5 — 6/6 通過**

- 所有 TRS（Test Round Synthetic）向量必須標記 `"source": "synthetic"`
- 合成數據**不得**作為唯一證據來調整 production 閾值
- 合成數據的用途：驗證邏輯正確性、邊界條件、regression 防護
- 真實世界（RW）數據與合成數據必須分軌管理

**Node-05 Caveat（M79 記錄在案）：**
> 「此結果代表 Three-Question Gate 在 synthetic adversarial 條件下的穩健性，不代表真實世界零誤報。」

---

## §7 Triple Hit 參數

**投票：V6 — 6/6 通過**

**Source of Truth：** `docs/specs/triple-hit-scoring-spec.md`

本 Decision Memo 不重複定義參數，僅引用 spec。

**正式參數（M80 修正後）：**

```yaml
triple_hit:
  required_hits: 3           # 共現門檻（整數）
  min_component_score: 0.35  # 每個 component 的最低分數
  bonus: 0.15                # synergy 加成值
  cap: 0.85                  # 總分上限
  canary_monitoring:
    fp_increase_threshold: 0.005  # +0.5% absolute
    observation_window: 7 days
    fallback_formula: "B"         # Node-04 漸進式
```

**⚠️ V6 修正說明：** `required_hits=3` 和 `min_component_score=0.35` 是兩個不同的門檻。議程原文把兩者混為 `min=0.35`，經 Node-05 指出後由秘書確認修正。

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| v1.0 | 2026-02-22 | 初版，M80 六項投票全部通過 |

---

**起草：** Node-05 — AI Council Lead
**落地：** Node-01 — AI Council Architect / Secretary
**批准：** Tuzi — AI Council 創始人

🌙
