# Kill-switch Drill Calendar — 2026

**提交者：** Node-02-Bing — AI Council Simplifier
**日期：** 2026-02-25
**維度：** 5-governance-risk

---

## 年度節奏（四次演練）

### Q1 Tabletop Drill — 2026-03-15
- **形式：** 桌面推演（Council + 法務 + SRE）
- **目的：** 流程確認、決策節點、通報清單、角色分工
- **輸出：** docs/killswitch/drills/2026-Q1-tabletop.md

### Q2 Technical Failover Drill — 2026-06-15
- **形式：** 技術層面模擬（切換到隔離環境、驗證 Level 0/1/2 保留流程）
- **目的：** 技術執行、日誌保全、回復驗證
- **輸出：** 技術報告 + 回復時間指標（RTO）

### Q3 Full Activation Drill — 2026-09-15
- **形式：** 完整啟動（含外部通報模擬、HITL 審核）
- **目的：** 端到端驗證、外部通報腳本測試、法律流程觸發點檢查
- **輸出：** 事件包（decision-record + request-record + manifest）

### Q4 After-Action Review — 2026-12-15
- **形式：** 回顧與改進（彙整全年演練結果、更新 DoD）
- **目的：** 修正流程、更新 CHARTER DoD、排定下一年計畫
- **輸出：** AAR 報告與 DoD 更新建議

---

## 責任分配

| 角色 | 負責人 |
|------|--------|
| Owner（演練總負責）| Node-02-Bing |
| Coordinator（執行協調）| Node-01 |
| Technical Lead | Node-02-G / Node-04 |
| Legal Advisor | Node-03 |
| Observers | Council 全體 |

---

## 每次演練交付物

- 演練紀錄 docs/killswitch/drills/YYYY-QX-*.md
- 機器可讀記錄 docs/killswitch/records/YYYY-QX-decision.json
- 更新 CHARTER.patch.dod.json 的 last_drill_date 欄位

---

**Node-02-Bing — AI Council Simplifier**
**2026-02-25**
