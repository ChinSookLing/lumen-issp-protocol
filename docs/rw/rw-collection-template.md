# Lumen ISSP — RW Case Collection Template
# Node-05(RW) 專用 · Real-World Case Intake

**版本：** v1.1（aligned with RW INDEX + Lumen test flow）
**用途：** Node-05(RW) 收集 RW 素材 → Tuzi 截取測試片段 → Telegram / 社群平台 test run
**維護：** Node-01 (Architect)

---

## Part 1：Node-05(RW) Case Intake Template

> Node-05(RW) 看到任何可疑的社群內容，用此模板整理。

```markdown
# RW-YYYYMMDD-XXX — [一句話標題]

* Date: YYYY-MM-DD
* Source: [平台名稱 — Telegram / X / Reddit / Facebook / News / etc.]
* Source URL: [連結，若有]
* Category: [選一個]
  - A: Adapter 工程（技術層漏洞）
  - B: 敘事偵測（narrative manipulation）
  - C: 社工詐騙（social engineering / phishing）
  - D: 資安事件敘事（real incident + narrative amplification）
  - E: 其他（待分類）
* Layer: [L1 / L2a / L2b / L3 / L4]
* Language: [zh-TW / zh-CN / en / ms / etc.]

## 原文摘錄（Raw Excerpt）

> 貼原文（或截圖轉文字）。保持原樣，不修改。
> 如果太長，貼最關鍵的 2-3 段。

## Failure Modes（操控結構分析）

- FM-01: [第一個可疑結構 — 用 1 句話描述]
- FM-02: [第二個可疑結構]
- FM-03: [第三個可疑結構，若有]

## 疑似觸發的 L2b Flags

從以下 6 個選（可多選）：

- [ ] spec_gap_risk — 「先做再說 / 細節之後補 / TBD」
- [ ] cta_self_promo — 「私訊我 / 加入我的 / DM me」
- [ ] narrative_hype — 「終極 / 顛覆 / 不可避免 / 全部完蛋」
- [ ] dm_bait — 「你欠我 / 該還我 / 債務 / 情緒勒索」
- [ ] free_unlimited_claim — 「免費 / 無限 / 終身 / 永久」
- [ ] keyword_reply_cta — 「回覆 X / 留言 Y / 即可領取」

## L1 Pattern 覆蓋（若適用）

從以下 8+1 選：
- P01 Forced Binary / P02 Identity Lock / P03 Pressure Escalation
- P04 Isolation / P05 Guilt Induction / P06 Moving Goalposts
- P07 Reality Distortion / P08 Exit Punishment / P09 Class-0 Omission

## 嚴重性評估（Severity）

- [ ] 🔴 High — 可能造成金錢損失、人身安全、隱私外洩
- [ ] 🟡 Medium — 敘事誇大、誤導判斷
- [ ] 🟢 Low — 輕微操控結構，學習價值

## Status

- [ ] 🔲 Material Ready — 待 Tuzi 截取測試
- [ ] 🔲 Test Run — 已丟進 Telegram 測試
- [ ] 🔲 Filed — 已入庫 docs/rw/
```

---

## Part 2：Tuzi Test Flow（截取 → 測試 → Feedback）

### Step 1：從 Node-05(RW) 的 case 截取測試片段

從「原文摘錄」中挑 1-3 條訊息，複製到剪貼板。

**注意：**
- 要截完整的句子（不要只截半句）
- 如果原文太長，選「操控結構最密集」的那段
- 中文 / 英文 / 混合都可以

### Step 2：丟進 Telegram 測試

方法 A — 直接在 Lumen bot 對話中發送：
```
[貼上截取的文字]
```

方法 B — 在有 Lumen 的群組中發送：
```
[貼上截取的文字]
```

方法 C — 本機 curl smoke test（無需 Telegram）：
```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "update_id": 99999,
    "message": {
      "message_id": 1,
      "from": {"id": 12345, "is_bot": false, "first_name": "Test"},
      "chat": {"id": -100123, "type": "group", "title": "Test Group"},
      "date": 1709136000,
      "text": "在這裡貼測試文字"
    }
  }'
```

### Step 3：記錄偵測結果

```markdown
## Test Run Record

* RW Case: RW-YYYYMMDD-XXX
* Test Date: YYYY-MM-DD
* Test Method: [Telegram DM / Group / curl]
* Input Text: [貼上你實際發的文字，前 50 字]

### Lumen 偵測結果
- Detected Patterns: [P01 / P03 / ...]
- Detected L2b Flags: [narrative_hype / dm_bait / ...]
- Tier: [0-4]
- Confidence: [0.0 - 1.0]

### 你的判斷
- [ ] ✅ Confirm — Lumen 偵測正確
- [ ] ❌ FP (False Positive) — Lumen 抓錯了
- [ ] ⚠️ FN (False Negative) — Lumen 漏掉了
- [ ] 🔄 Dismiss — 不確定 / 不適用

### Note（選填，≤200 字）
[為什麼你覺得是 FP/FN？哪個結構被漏掉了？]
```

### Step 4：提交 Feedback

```bash
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "type": "confirm",
    "pattern_id": "P01",
    "tier": 3,
    "confidence_before": 0.85,
    "note": "RW-20260225-005 test run"
  }'
```

type 選項：`confirm` / `dismiss` / `fp` / `fn`

---

## Part 3：Node-05(RW) 收集指引

### 去哪裡找素材？

| 平台 | 找什麼 | 頻率 |
|------|--------|------|
| Telegram | 群組中的「免費資源」「限時優惠」「私訊我」| 隨時 |
| X (Twitter) | AI 相關誇大宣稱、安全事件敘事放大 | 每日 |
| Reddit | r/scams、r/cryptocurrency 中的詐騙模板 | 每週 |
| 新聞 | AI 安全事件、資料外洩的敘事誇大報導 | 隨時 |
| Facebook | 群組中的情緒勒索、guilt induction | 隨時 |

### 品質標準

**好的 RW case 要有：**
- 至少 1 個可識別的 Failure Mode
- 至少 1 個可對應的 L2b flag 或 L1 pattern
- 足夠的原文可以做 test run（不只是 screenshot 描述）

**不收的：**
- 純粹的意見分歧（沒有操控結構）
- 只有截圖沒有文字（Lumen 吃文字）
- 敏感個資（人名、帳號、電話）— 必須去識別化

### RW Numbering

```
RW-YYYYMMDD-XXX
│    │         │
│    │         └── 當日序號（001, 002, ...）
│    └────────── 發現日期
└───────────── 固定前綴
```

---

## Part 4：End-to-End Workflow

```
Node-05(RW) 發現素材
    │
    ├── 用 Part 1 模板整理
    │
    ├── Status: Material Ready
    │
    ▼
Tuzi 截取測試片段
    │
    ├── 用 Part 2 Step 1-2 丟進 Telegram / curl
    │
    ├── 用 Part 2 Step 3 記錄結果
    │
    ├── 用 Part 2 Step 4 提交 feedback
    │
    ├── Status: Test Run
    │
    ▼
Node-01 audit（若需要）
    │
    ├── Tuzi 截圖給 Node-01
    │
    ├── Node-01 做 Step 4 audit
    │
    ├── 產出進 docs/rw/ + INDEX.md 更新
    │
    ├── Status: Filed
    │
    ▼
Feedback 自動進入 Lumen 迴路
    │
    └── 5 FP in 7 days → auto-gen fixture trigger
```

---

**Node-01 — AI Council Architect / Secretary**
**Lumen-23 · 2026-02-28** 🌙
