# Lumen ISSP Protocol — Narrative Assets
# Step 19A · Sprint 13 · Public-Facing Documentation

**Owner:** Node-01 (Architect / Secretary)
**授權:** M95-D02 Sprint 13 Scope
**用途:** 給外部人看的公開文件，不含 Council 內部資訊

---

# 1. FAQ — 常見問題

## Lumen 是什麼？

Lumen 是一個資訊主權盾牌協議（Information Sovereignty Shield Protocol, ISSP）。它偵測群組訊息中的操控結構（manipulation structures），而不是關鍵字。Lumen 像 TCP/IP 一樣是一個協議，不是一個產品。

## Lumen 跟一般的關鍵字過濾有什麼不同？

傳統 NLP 工具掃描「壞字」；Lumen 掃描「壞結構」。一句話裡可能沒有任何不當用語，但它的結構——限制選擇、建立依附、封閉反對路徑——符合操控模式。Lumen 用三問門檻（Three-Question Gate）判斷：一條訊息必須同時命中 ≥2 個結構準則才會被標記。

## Lumen 會讀我的訊息嗎？

不會儲存。Lumen 遵循 SPEG（Signal Processing Ethics Guard）原則：不存原文、不做身份關聯、不儲存 IP、只在本機處理。偵測完即丟。

## Lumen 會告訴群主誰被標記嗎？

不會。Lumen 不產生「誰說了什麼」的報告。它只輸出結構層級的匿名統計（例如：本週偵測到 3 次敘事誇大結構），不指向任何個人。

## Lumen 是 AI 嗎？

Lumen 的偵測引擎基於規則匹配與結構分析，不是大型語言模型。它由 AI Council（6 個 AI Affiliate + 1 位人類創始人）設計，但運行時不呼叫任何 LLM API。

## 如何部署 Lumen？

```bash
git clone https://github.com/ChinSookLing/lumen-issp-protocol.git
cp .env.example .env
docker compose up -d
curl http://localhost:3000/health
```

5 分鐘內可完成。詳見 `docs/deployment/QUICKSTART.md`。

## Lumen 是開源的嗎？

是。Apache-2.0 授權。任何人都可以部署自己的節點。但如果你的 fork 宣稱「Lumen Compatible」，需要通過 AST CI Enforcer 的三項自動檢查。

---

# 2. 300 字摘要（One-Pager）

**Lumen ISSP（Information Sovereignty Shield Protocol）** 是一個偵測群組訊息中操控結構的開源協議。

在 Telegram 群組、社群、甚至企業內部通訊中，操控不一定用「壞字」——它用結構。一段看起來正常的訊息，可能同時在限制你的選擇、建立對方的權威、並封閉你的反對路徑。Lumen 偵測的是這種結構，不是關鍵字。

Lumen 的核心是三問門檻（Three-Question Gate）：一條訊息必須同時命中至少兩個結構準則（限制選擇 / 建立權力依附 / 封閉反對路徑）才會被標記。單一用語不等於操控。

隱私方面，Lumen 遵循 SPEG 原則：不存原文、不做身份關聯、所有處理在本機完成。偵測結果只輸出匿名的結構統計，不指向任何個人。

Lumen 由 AI Council 設計——6 個 AI Affiliate（Node-05、Node-04、Node-06、Node-03、Node-02、Node-01）與創始人 Tuzi 共同協作，經過 95 場會議、219 次程式碼提交、1,361 項測試的迭代。它不是產品，是協議——任何人都可以在自己的節點上運行。

**授權：** Apache-2.0
**部署：** `docker compose up -d` · 5 分鐘完成
**核心原則：** 偵測結構，不偵測文字。保護隱私，不收集資料。

---

# 3. SPEG 公開版（Signal Processing Ethics Guard）

## 原則

Lumen 的所有信號處理必須遵守以下五項倫理邊界：

**A — 不存原文（No Raw Text Storage）**
偵測引擎處理訊息後，原文即丟棄。不寫入任何持久儲存。日誌中只記錄結構標籤（如 `narrative_hype`），不記錄觸發該標籤的原始文字。

**B — 不做身份關聯（No Identity Association）**
不儲存 user_id、chat_id、IP 位址、裝置指紋。回饋系統（feedback pipeline）只接收結構類型（confirm/dismiss/FP/FN）和 pattern_id，不接收「誰提交的」。

**C — 本機處理（Node-Local Processing）**
所有偵測在部署節點本機完成。不傳送訊息到外部伺服器。不呼叫雲端 API。不需要網路連線即可運行偵測。

**D — 結構化輸出（Structured Output Only）**
Lumen 的輸出是結構標籤 + 層級 + 信心度。不輸出「這條訊息在操控你」之類的判斷語句。使用者自行決定如何回應。

**E — 可審計（Auditable）**
所有偵測規則定義在 `l2b-lite-detector.js` 中，開源可檢視。偵測邏輯不依賴黑箱模型。任何人都可以 fork 並驗證每一條規則。

## 驗證方式

AST CI Enforcer（`scripts/ci/ast-enforcer.js`）自動檢查任何宣稱 Lumen Compatible 的代碼是否違反 SPEG A-E。

---

# 4. Responsibility Boundary — Lumen 做什麼 / 不做什麼

## Lumen 做什麼 ✅

- 偵測訊息中的操控結構（8 種 L1 模式 + 6 種 L2b 旗標）
- 輸出匿名的結構標籤和統計
- 在本機運行，不傳送任何資料到外部
- 提供回饋管道（confirm/dismiss/FP/FN）讓使用者改善偵測品質
- 開源，任何人可部署、可審計

## Lumen 不做什麼 ❌

- **不判斷意圖。** Lumen 偵測結構，不判斷「這個人是不是壞人」。
- **不做內容審查。** Lumen 不刪除、不封鎖、不隱藏任何訊息。
- **不做身份追蹤。** 不記錄誰說了什麼、誰被標記。
- **不是法律工具。** Lumen 的偵測結果不構成法律證據。
- **不是心理診斷。** Lumen 不判斷使用者的心理狀態。
- **不取代人類判斷。** 所有偵測結果都是建議，最終決定權在人。

## 邊界案例

如果偵測到可能涉及人身安全的情況（如自殺威脅、家暴跡象），Lumen 不做自動通報。B7 Emergency Operation Card 定義了人類介入的流程，但這是由部署者自行決定是否啟用。

---

# 5. User Stories — 真實場景

> 以下三個故事基於 Lumen RW-LAB 的真實案例改寫，已去除所有可識別資訊。

## Story 1：「回覆 CLAUDE 就能無限用」

小美在一個 Telegram 群組裡看到一則訊息：「回覆 CLAUDE 就能免費無限使用 Node-01 Opus！我私訊你教學。」

看起來像好心分享？但 Lumen 偵測到三個結構：
- **`free_unlimited_claim`** — 「免費」+「無限」+付費服務名，太好到不真實
- **`keyword_reply_cta`** — 要求回覆特定關鍵字，篩選目標並放大互動
- **`dm_bait`** — 引導到私訊，避開公開審視

三問門檻命中 3/3。Lumen 輸出 L2b 旗標，群組管理員可以自行決定是否提醒成員。小美的名字、訊息內容都不會被記錄。

*（改編自 RW-20260225-005）*

## Story 2：「AI 一句話打穿政府」

一篇文章在社群瘋傳：「駭客用 Node-01 一句話就入侵了墨西哥政府，竊取 150GB 機密資料！AI 太危險了！」

但實際情況是什麼？Lumen 偵測到：
- **`narrative_hype`** — 「一句話打穿」是敘事誇大，實際攻擊涉及長時間探測與多次嘗試
- **`spec_gap_risk`** — 文章省略了關鍵細節（攻擊者也用了 ChatNode-05、多家機構否認被入侵的說法）

Lumen 不判斷「這篇文章是假的」——它標記結構：「這篇文章的結構中包含敘事誇大和細節缺口」。讀者自行判斷。

*（改編自 RW-20260226-007）*

## Story 3：「國防部對 AI 公司施壓」

一條轉發訊息寫道：「Pentagon 已經對 Anthropic 下最後通牒，不開放就從供應鏈封殺！AI 軍事化不可避免！」

Lumen 偵測到：
- **`narrative_hype`** — 「不可避免」是確定性誇大
- **`spec_gap_risk`** — 省略了 Anthropic 的回應（他們拒絕了自主武器和國內監控）

同樣，Lumen 不說「這是假新聞」。它說：「這條訊息的結構中，敘事確定性高於證據支持度」。

*（改編自 RW-20260225-002）*

---

**Node-01 — AI Council Architect / Secretary**
**Step 19A · Sprint 13 · 2026-02-28** 🌙
