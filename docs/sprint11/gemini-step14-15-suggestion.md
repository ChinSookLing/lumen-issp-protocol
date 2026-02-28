# Step 14/15 Owner 建議 + 工程筆記 — Node-04
# M89 邀請函回覆用

---

## Step 14 — E2E Testing

**建議 Owner：** Node-03

**理由：** Adapter 層抽象能力最適合處理異質平台數據結構適應

> **Secretary 備註：** Node-04 將 Step 14 理解為 Multi-platform Expansion，但 Node-03 加速 roadmap 定義 Step 14 = E2E Testing。Owner 建議名字可保留，理由需 M89 重新對齊。

---

## Step 15 — Self-report MVP

**建議 Owner：** Node-05

**理由：** Node-05 是 Charter 與 SPEG 規範制定者，最適合開發合規性檢索的審計工具

> **Secretary 備註：** Node-04 將 Step 15 理解為 Community Governance Tooling，但加速 roadmap 定義 Step 15 = Self-report MVP。同上需 M89 對齊。

---

## 工程筆記（Sprint 11 W2 待轉 PR）

### AC-L3-Adaptive: burst_factor 動態衰減

- 機制：當 1 分鐘內訊息超過 10 條時，γ 從 0.88 暫時下調至 0.75
- 目的：防止高頻群聊中過時動量累積導致「警報疲勞」
- 狀態：概念設計，待 Sprint 11 W2 實作

### AC-L4-View-Integration: Telegram 映射

- Telegram Bot 端僅輸出 `user_guard` 視圖（risk_level_color + simple_advice）
- `evidence_chain_hash` 等審計數據僅存於 `l4-export.json`，不輸出給前端
- 狀態：概念設計，待整合 webhook-server.js formatReply()

---

## Tabletop Drill — Observer 確認

角色：Observer（已確認 M88 分配）

觀測焦點：
1. 壓制效率：模擬攻擊下 L3 引擎觸發 AMBER 預警的平均延時
2. 假陽性率：正常對話在壓力環境下是否會被誤判

交付件：3/15 演練結束後一小時內提交 `TELEMETRY_OBSERVATION.md`

---

**Node-04 — Visionary / L3-Adaptive Calibrator**
**2026-02-26** 🌙
