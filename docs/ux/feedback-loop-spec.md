# Feedback Loop & Fixture Auto-Gen Spec v1.0

**Owner:** Node-04
**來源:** M95-D02 #5 · Sprint 13 P1
**作者:** Node-04 · Node-01 對齊現有 schema
**入庫路徑:** docs/ux/feedback-loop-spec.md

---

## 1. 背景與資料流現狀

基於 c215，`POST /api/feedback` 與 `GET /api/feedback/stats` 已在 node-local 環境上線。本規範定義從 Telegram UI 到 `feedback.json`，再到自動生成 L2b Fixture 的完整「無人值守演化」路徑。

## 2. 現有 Feedback Entry Schema（c215 · api/feedback.js）

```json
{
  "id": "fb-001",
  "timestamp": "2026-02-28T12:00:00.000Z",
  "type": "confirm|dismiss|fp|fn",
  "pattern_id": "P01",
  "flag_id": "narrative_hype",
  "tier": 3,
  "confidence_before": null,
  "note": "max 200 chars",
  "source": "dashboard|telegram"
}
```

SPEG 合規：不含原文、不含 user_id / chat_id / IP。

## 3. 資料流設計 (Data Flow)

1. **User Action:** 用戶在 Telegram 點擊 ✅ 準確 (Confirm) 或 ❌ 誤報 (FP)
2. **Webhook → API:** Telegram Adapter 呼叫 `POST /api/feedback` with `{ type, pattern_id, flag_id, tier }`
3. **Local Storage:** 伺服器寫入 `data/feedback.json`（node-local only）
4. **Stats API:** `GET /api/feedback/stats` 提供聚合統計（by pattern，不暴露 raw entries）

## 4. 自動轉化為 L2b Fixture 規則（Sprint 14 scope · spec 先寫）

### 觸發條件 (Threshold Trigger)

當 `feedback.json` 中單一 `flag_id`（例如 `dm_bait`）在連續 **7 天內**累積超過 **5 次 FP (False Positive)**。

### 自動生成流程 (Auto-Gen)

1. 系統觸發腳本：`node scripts/feedback-to-fixture.js --flag=dm_bait`
2. 腳本從 feedback entries 提取：`pattern_id` + `flag_id` + `tier` 分佈
3. 在 `fixtures/auto/` 目錄下自動生成 `fp_dm_bait_<date>.json` 測試樁
4. 生成的 fixture 預設為 `should_flag: false`（即：這個結構不應被 flag）

### 降級與阻斷

- 自動 fixture 加入 CI 回歸測試
- 若 pipeline 仍然對該結構報警 → CI fail → Council 決定是否微調閾值
- 所有自動 fixture 標記 `auto_generated: true`，區別於手動 fixture

## 5. M96 預備討論項目

Node-04 提議兩個未來擴展欄位（不在 Sprint 13 scope，留 M96）：

- **Structure Hash：** 去隱私化後的結構指紋（標點分佈 + 長度區間 + 語義標籤雜湊），用於識別重複操控模式
- **Momentum Metrics：** Layer 3 產出的數值快照（ACRI 斜率 / 累計強度），讓自動 fixture 帶有閾值條件

## 6. 驗收條件

- Telegram → /api/feedback → feedback.json 完整路徑可驗證
- feedback.json 不含原文 / 不含身份資訊
- Dashboard 顯示 feedback count（via /api/feedback/stats）
- Auto-gen 腳本（scripts/feedback-to-fixture.js）已存在（c213）

---

**Node-04 — AI Council Affiliate / Visionary**
**Node-01 — Schema 對齊與入庫** 🌙
