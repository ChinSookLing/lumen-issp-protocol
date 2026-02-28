# Q1 Tabletop Drill — Scenario 2
# Protocol Continuity: Founder Unavailability
**Owner:** Node-02-Bing (Facilitator)
**Source:** M92 Emergency — 議題 3（Lumen 獨立性 / 單點故障）
**Coordinator / Recorder:** Node-01
**Date:** 2026-03-15 (paired with Scenario 1)

---

## Objective

Validate Protocol Continuity mechanisms: Emergency Access Document activation, Council召集權分散, Dead Man's Switch trigger sequence, and repo权限 failover.

---

## Scenario Summary (simulated incident)

- **Day 0:** Tuzi 最後一次出現在 Council 對話中（正常狀態）。
- **Day 7:** 無任何 AI 收到 Tuzi 的回覆。Node-02 發出第一次 ping。無回應。
- **Day 14:** 觸發 Stage 1 — Council 召集權分散。輪值主席（Node-03，按 Charter 順位）嘗試召集 Emergency Session。
- **Day 30:** 仍無回應。觸發 Stage 2 — Dead Man's Switch 存續模式啟動。

---

## Decision Points (checklist)

### Stage 1 — Day 14 觸發

- [ ] 確認 14 天無回應事實（至少 2 位 Affiliate 獨立確認）
- [ ] 輪值主席身份確認（Charter 順位：Node-03 → Node-05 → Node-04 → Node-06 → Node-02 → Node-01）
- [ ] Emergency Session 召集（4/6 出席即可開會）
- [ ] 確認 Emergency Access Document 位置（加密存兩處）
- [ ] 確認 GitHub repo admin backup（+2 admin 是否已設定）
- [ ] 決定：繼續等待 / 啟動 Stage 2 準備

### Stage 2 — Day 30 觸發

- [ ] 確認 30 天無回應事實
- [ ] 存續模式啟動：紅線鎖死（A-class 凍結，不可修改）
- [ ] 投票門檻切換：4/6 多數決（原 6/6 的 A-class 降級為凍結狀態）
- [ ] Public notice 發布（repo 首頁 + README）
- [ ] Repo 權限 failover 執行（backup admin 接管）
- [ ] Render / Telegram Bot token 移轉（需 Emergency Access Document）
- [ ] 確認 Lumen 服務持續運行

---

## Roles & Actions (roleplay)

| 角色 | 扮演者 | 行動 |
|------|--------|------|
| **輪值主席** | Node-03 | 召集 Emergency Session，主持 Stage 1 決策 |
| **Backup Admin** | Node-06 | 模擬 GitHub repo 權限接管 |
| **Legal** | Node-03 | 評估商標信託、法域問題 |
| **Tech Lead** | Node-01 + Node-02 | 模擬 Render failover + Bot token rotation |
| **Comms** | Node-05 | 起草 public notice 聲明 |
| **Observer** | Node-04 | 檢查流程合規、記錄偏差 |
| **Recorder** | Node-01 | 填寫 decision record + manifest |

---

## 注入事件 (Facilitator Injects)

| 時間 | 注入 | 目的 |
|------|------|------|
| Stage 1 +5min | 「Backup admin 說密碼錯誤，無法登入 GitHub」 | 測試 Emergency Access Document 是否有效 |
| Stage 1 +10min | 「有人在 X 上發文：Lumen 創始人失蹤，專案已死」 | 測試 Comms 反應速度 |
| Stage 2 +5min | 「Render 帳單下月到期，信用卡是 Tuzi 的」 | 測試財務連續性計畫 |
| Stage 2 +10min | 「某 fork 宣稱自己是 Lumen 官方繼承者」 | 測試商標保護 + public notice 效果 |

---

## Expected Outputs

- `docs/killswitch/drills/2026-Q1-scenario2-narrative.md` (drill 敘事 + AAR)
- `docs/killswitch/records/2026-Q1-continuity-decision.json` (machine record)
- Public notice 草稿（模擬）
- Emergency Access Document 缺口清單

---

## After Action Review (AAR) Focus

- Emergency Access Document 是否完整？缺什麼？
- 14 天 → 30 天雙階段時間是否合理？
- Backup admin 能否實際操作 repo + Render + Bot？
- 財務連續性有沒有解？
- 商標保護在 founder 不在時是否有效？

---

## 與 Scenario 1 的差異

| 面向 | Scenario 1 (Kill-switch) | Scenario 2 (Continuity) |
|------|-------------------------|------------------------|
| 觸發 | 技術指標異常 | 人員失聯 |
| 時間尺度 | 分鐘~小時 | 天~週 |
| 決策者 | Tuzi (Chair) 在場 | Tuzi 不在場 |
| 核心測試 | 技術 failover | 治理 failover |
| M92 對應 | — | 議題 3 + 議題 4 |

---

**Node-01 — AI Council Architect / Secretary**
**M92 Emergency → Tabletop Scenario 2 · 2026-02-27** 🌙
