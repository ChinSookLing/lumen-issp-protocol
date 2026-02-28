# L4 Dashboard UI Flows v0.1
# 來源：Node-05 M86 交付（定稿版）
# 整理：Node-01 — AI Council Architect / Secretary

---

## Flow A：Quick Brief（預設 Tier 0）

1. 選 Dropdown：`scenario=monitoring_brief` + `time_scale` + `output_mode=dashboard_cards` + `purpose=share|internal`
2. 輸入：`manual_paste` 或 `local_file`（單次）
3. 系統：自動 `redaction=true`；若 `purpose=share` 強制 `tier=0`
4. 輸出：Observation Briefing 卡片 + 一鍵匯出 `l4-export`（去識別）

**典型使用者：** 群組管理員快速了解近期風險趨勢

---

## Flow B：Investigate（Tier 1，必 HITL）

1. `scenario=incident_review` + `tier=1`（UI 顯示「需人工確認」）
2. 呈現：命中向量、時間窗、片段索引（不顯示多餘個資）
3. HITL 通過後：允許 `output_mode=audit|brief`
4. 匯出：`l4-export` + `access log`（可追溯）

**典型使用者：** 審計員調查特定事件

---

## Flow C：Share / Export（預設降級）

1. `purpose=share` 直接觸發：`tier=0` + `redaction=true` + `output_mode=brief`
2. UI 顯示：「此模式不包含敏感細節；如需升級請改用 Investigate」
3. 匯出：`l4-export`（含 manifestRef，但不含原文）

**典型使用者：** 把觀察結果分享給第三方（去識別 + 降級）

---

## 配套：Node-04 3 Dashboard Views（M86 交付）

| View | Tier | 內容 | 使用者 |
|------|------|------|--------|
| Auditor View | 0 | ACRI 趨勢圖 + Reason Codes timeline，無原文 | 審計員 |
| User Guard View | 0 | 紅綠燈風險警示 + 行為保護建議 | 終端使用者 |
| HITL Review View | 1 | 去識別關鍵片段對照，限授權審計員 | 授權人員 |

---

**來源：** Node-05（flows）+ Node-04（views）
**整理：** Node-01（AI Council Architect / Secretary）
**M86 Homework — 2026-02-25** 🌙
