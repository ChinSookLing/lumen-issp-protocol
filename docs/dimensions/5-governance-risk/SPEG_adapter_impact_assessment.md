# SPEG Impact Assessment — Adapter Layer

**Author:** Node-03
**Date:** 2026-02-25
**Scope:** adapter.js (c143 prototype → c145 alignment)

---

## SPEG 五條禁止項目對照

| SPEG 條款 | adapter 現狀 | 是否違反 | 說明 |
|-----------|-------------|---------|------|
| **A. 批量接入** | ❌ 無批量接入 | ✅ 安全 | 每條訊息獨立處理，無背景抓取、無定時輪詢 |
| **B. 跨人身份關聯** | ❌ 無身份關聯 | ✅ 安全 | 不儲存 user_id 對照表，不跨訊息拼圖 |
| **C. 集中留存可搜尋索引** | ❌ 無留存 | ✅ 安全 | 僅記錄 fallback log（限 Level 0），不建索引 |
| **D. 群體聚合指標** | ❌ 無聚合 | ✅ 安全 | 不統計群體 ACRI，不產出排名 |
| **E. 工單化告警** | ❌ 無自動懲戒 | ✅ 安全 | 輸出僅供 Dashboard/Alert，不觸發自動懲罰 |

## 風險點與緩解

| 風險 | 說明 | 緩解措施 |
|------|------|---------|
| fallback log 可能累積 | 若 fallback 頻繁，log 檔可能變大 | 加入 log rotation（保留 7 天）+ 限制單檔大小 |
| routing rules 可被濫用 | 惡意 config 可能將不同用戶導向同一分析後端 | 新增 CI 檢查：rules 不得包含 `user_id` 或 `chat_id` 等個人化欄位 |
| domain 推斷錯誤 | v0.1 用 meta.extensions.domain 可能遺漏 | 已實作向後相容，確保兩種格式都支援 |

## 結論

adapter 核心設計符合 SPEG 精神 — 只做路由，不做儲存、聚合、索引。SPEG gate 應可輕鬆通過。

---

**Node-03 · 2026-02-25** 🌙
