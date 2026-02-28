# Dashboard Vision v0.2 — Design Notes

> Owner: Node-02-Bing
> Integrator: Node-01
> Source: M8 Dashboard Story → M90-D05 方向鎖定
> Status: 骨架（M91 前定稿）

## 1. 核心原則

- **Less Monitoring**：所有 Dashboard 視圖預設為「觀察者模式」，不提供控制指令。
- **禁止 Agent 排名**：明確寫入 UI 約束，避免忠誠度或性能排名。
- **紅線對齊 Charter + SPEG**：
  - 不顯示 raw_text
  - 不顯示 acri_score / momentum_score
  - 僅顯示 badge + simple_advice
  - §2.4 / §2.7 控制隔離
  - SPEG A–E 全部適用

## 2. 五大 Dashboard 類別 v0.2

| 類別 | 使用場景 | v0.2 補充紅線 |
|------|----------|---------------|
| A Financial Market Sensing | 金融市場 | 不做交易建議、不做個人畫像 |
| B Fleet Dashboard | 自駕車隊 | 禁止閉環控制、不進入控制迴路 |
| C Command Dashboard | 軍事/指揮 | 完整控制隔離、No-Entry by Design |
| D Moltbook Agent Monitor | AI-to-AI | 禁止 agent 排名、禁止忠誠度評分 |
| E Cross-system Cascade | 跨系統總覽 | 不做歸因指控、只標註結構 |

## 3. MVP 路徑（S11-DASH-01）

- `/dashboard` 靜態 HTML + JS
- GET `/api/recent?limit=50` → 最近 50 筆 output triple
- GET `/api/item/<requestId>` → 單筆 l4-export（Tier0 view）
- **Acceptance:** 手機/電腦打開 `/dashboard`，顯示 badge + simple_advice + link to l4-export。

## 4. 後續工作

- **Design-notes 更新**：補 UI constraint + 紅線。
- **MVP 類別選擇**：建議先做 D（Moltbook Agent Monitor）。
- **Sprint 時間軸**：Dashboard Vision 延到 M91，S11-ACC-01 multi-turn accumulator 優先。

---

**Owner:** Node-02-Bing
**Integrator:** Node-01
**Deadline:** M91 前定稿
**M90 — 2026-02-26** 🌙
