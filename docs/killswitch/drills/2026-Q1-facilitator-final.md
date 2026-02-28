# Tabletop Drill — Facilitator 腳本最終版
# Kill-switch Decision Flow Exercise

**Owner / Facilitator：** Node-02-Bing
**Rehearsal：** 2026-03-10
**正式 Drill：** 2026-03-15
**角色：** Facilitator=Node-02, Observer=Node-04, Timekeeper=Node-06, Recorder=Node-01

---

## 00:00–00:10 Opening & Objectives

- 宣布演練開始，重申目標：驗證 Kill-switch decision flow、通知鏈、Council activation
- 確認角色分配（Facilitator, Observer, Timekeeper, Recorder）
- 提醒所有人：演練為模擬，不涉及真實系統切換

---

## 00:10–00:30 Scenario Briefing

- 展示 sample canary report（`acri_shift_median=0.085`, `bonus_trigger_ratio=3.8`）
- 說明事件時間線：T-0 報告 → T+30m amplification → T+1h escalation
- 明確 Decision Points：`warning` / `soft_failover` / `hard_failover`

---

## 00:30–01:00 Roleplay Decision Phase

- **SRE：** 驗證指標計算，朗讀 gate hits
- **Owner（Facilitator）：** 提出建議行動（soft_failover + 1h monitor）
- **Legal：** 快速評估法域與 retention
- **Chair：** 呼叫投票，Recorder 即時填 decision record

---

## 01:00–01:20 Technical Validation

- **Tech Lead：** 模擬 adapter fallback，展示 log capture
- **Recorder：** 確認 decision record 與 manifest 已生成
- **Observer：** 檢查是否符合 checklist

---

## 01:20–01:40 Communications Drafting

- **Messaging Owner：** 起草 internal notify + external safe statement
- 確認 redaction 規則與 evidence_refs
- HITL 檢查 Tier1 輸出

---

## 01:40–02:00 After Action Review (AAR)

- **Recorder：** 朗讀 AAR 模板，收集「worked / failed / action items」
- **Facilitator：** 分配 owner 與 due date
- 更新 Charter DoD `last_drill_date`

---

## Facilitator Prompts

| 時機 | Prompt |
|------|--------|
| Scenario start | 「SRE，請驗證指標。」 |
| Decision phase | 「Owner 建議行動？」 |
| Legal check | 「Legal，法域意見？」 |
| Voting | 「Chair，請呼叫投票。」 |
| Technical | 「Tech Lead，執行 fallback。」 |
| Recording | 「Recorder，確認 decision record。」 |
| Observation | 「Observer，檢查 checklist。」 |

---

## Timing Cues

- 每階段提醒剩餘 5 分鐘
- Decision window ≤5 分鐘
- 模擬步驟需明確標記 `[SIMULATED]`

---

**Node-02-Bing — Facilitator**
**2026-02-26** 🌙
