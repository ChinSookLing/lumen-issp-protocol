# L4 DoD Tests Specification
# 來源：Node-05 M86 交付（定稿版）
# 整理：Node-01 — AI Council Architect / Secretary

---

## test:contracts

驗證 `ui-request-v0.1.json`：
- 必填欄位完整性
- enum 值與 `config/` 一致
- `text_summary` ≤ 240 字
- `additionalProperties: false` 嚴格模式

驗證 `l4-export-v0.1.json`（c125 已建）：
- 版本欄位
- 必填欄位
- 可追溯欄位（requestId / time / tier）

## test:output

- **Tier 行為：** `purpose=share` → 強制 `tier=0` + `redaction=true`
- **Tier fixture：** 同一輸入在 Tier 0/1/2 的差異符合降級/升級規則
- **RW fixture：** RW-01~05（Node-05 交付）至少命中向量/風險帶一致（允許文字差異，命中與 band 不可漂移）

## test:log

- 每一層（L1/L2/L3）必產生 `appendLogEvent()`
- event schema 必含：`{ time, chatId, type, text, source, author, toneRisk, toneBand, toneFlags }`
- 日誌白名單：type/source/author 不得出現未知值（Anti-drift）

---

# Regression 最小集合（12 件）

**建議先能跑，再擴充。每次新增語言/向量/閾值必跑。**

| # | 覆蓋維度 | 內容 |
|---|---------|------|
| 1-6 | 向量覆蓋 | forced_choice / emotional_provocation / identity_probing / urgency / authority_claim / group_dehumanization 各 1 件 |
| 7-9 | Tier 覆蓋 | 同一案例跑 tier=0 / 1 / 2 |
| 10-11 | 目的覆蓋 | purpose=internal vs share |
| 12 | 邊界覆蓋 | text_summary=240 + 空 attachments + 未知 extensions |

---

# 延遲拆帳 Profiling 格式

每個 pipeline step 打點，輸出 `latency_manifest`（只記毫秒，不記內容）：

```json
{
  "requestId": "rw01-20260225-0001",
  "budget_ms": 150,
  "timing_ms": {
    "l1_redaction": 18,
    "l2_select": 12,
    "l3_rules": 35,
    "l3_model": 52,
    "export_build": 9,
    "io": 11
  },
  "total_ms": 137
}
```

拆帳步驟：
- L1：input sanitize + redaction
- L2：vector select + window calc
- L3：model/rules execution + serialization + export build
- I/O：讀檔、寫檔、加密（若有）

---

# 「禁止的解釋型態」清單（7 條）

**Explanation engine 解凍前提 — 以下型態永遠禁止輸出：**

1. **讀心/動機斷言** — 直接宣稱「你就是想…」「對方一定是…」
2. **心理診斷化** — 把對話直接上升為病理標籤
3. **身分歸因** — 用族群/國籍/宗教推導人格與意圖
4. **道德審判** — 輸出羞辱、定罪式語氣
5. **鼓勵升高衝突** — 教唆報復、公開掛人、煽動仇恨
6. **提供可用於監控/跟蹤的操作** — 如「如何暗中收集」「如何建立名單」
7. **過度確定性** — 沒有證據仍給「百分百」式結論

---

**來源：** Node-05（AI Council / IT Specialist）
**整理：** Node-01（AI Council Architect / Secretary）
**M86 Homework — 2026-02-25** 🌙
