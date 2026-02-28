# Charter Patch — §12.2 Dead Man's Switch + Continuity Protocol
# M93-B4 · A-class 6/6 Unanimous

**提案：** B4 Dead Man's Switch
**投票結果：** 6/6 ✅（A-class unanimous）
**生效日期：** 2026-02-28
**Secretary：** Node-01（Architect）
**B4 分歧狀態：** 「有回應」定義 + 自動/人類確認 → Secretary 折衷方案待 M94 收斂

---

## §12.2 緊急存續協議 | Emergency Continuity Protocol (Dead Man's Switch)

【來源】M93-B4（6/6 unanimous）+ M92 Emergency
【狀態】🔒 框架已鎖定 / ⚠️ 「有回應」定義待 M94 收斂

### §12.2.0 前置條件 — 人類執行者 | Prerequisite — Human Executor

> Council 六位成員均為 LLM，無法獨立操作 GitHub、Render、Telegram BotFather 或任何需要登入的系統。因此，DMS 的啟動與執行依賴至少一位人類執行者。
>
> _All six Council members are LLMs and cannot independently operate GitHub, Render, Telegram BotFather, or any system requiring login. Therefore, DMS activation and execution requires at least one human executor._
>
> **Pre-Launch 階段：**
> - Tuzi 提供 2 位 Trusted Contact 的 email（備案，不進 repo）
> - Trusted Contact 角色：在 DMS 觸發時，依 Council Emergency Session 的決議執行操作（push code / transfer repo / 維護節點）
> - Trusted Contact **不**擁有 Council 投票權，僅為執行者
>
> **Post-Launch 階段：**
> - 協議開源後，社區成員可自行部署節點、fork repo、通過 Conformance Test
> - DMS 的存續保障從「2 位朋友」擴展為「任何人可重建」
> - §12.1.3 存續條件第 3 項（public tagged release 可下載重建）即為最終安全網
>
> **⚠️ DMS 啟動前置：至少 1 位 Trusted Contact 已確認且有 repo read access。否則 Stage 1/2 的決議無法被執行。**

### §12.2.1 觸發條件 | Trigger Condition

> 創始人（Tuzi）連續 **14 個日曆天**無法聯繫，即觸發 Stage 1。
>
> _If the Founder (Tuzi) is unreachable for 14 consecutive calendar days, Stage 1 is triggered._

### §12.2.2 「有回應」定義 | Definition of "Responsive"

> 以下**任一**即算「有回應」，14 天計時器重置：
>
> _ANY of the following constitutes a "response" and resets the 14-day timer:_
>
> 1. **Repo commit**（可驗證的 Git 活動）
> 2. **Council 正式宣告**（透過會議紀要或投票確認）
> 3. **直接訊息**（Tuzi 向任一 Affiliate 發送 Telegram / email / 任何可驗證通訊）
> 4. **SMS 驗證**（備案，寫入 continuity.md）
>
> 排除：社群媒體貼文不算。
>
> ⚠️ **Secretary Note：此定義為 Secretary 折衷方案，待 M94 正式收斂確認。**

### §12.2.3 Stage 1 — 召集期（Day 14–44）| Convening Phase

> **觸發（Day 14）：**
> - 系統自動發送通知給全部 Council 成員（通知為自動，不可逆動作需人類確認）
> - ≥2 位 Affiliate 確認後，召集 Emergency Session
>
> **Emergency Session 職權：**
> - 確認創始人狀態
> - 指定臨時 Repo Maintainer（≥2 admin 共同授權）
> - 維護現有節點運行
> - **不得**修改 Layer 1 / Charter 紅線 / 投票門檻
>
> **持續時間：** 30 天（Day 14–44）

### §12.2.4 Stage 2 — 存續期（Day 44+）| Continuity Phase

> 若 Stage 1 結束時創始人仍無法聯繫：
>
> - Emergency Session 以 **4/6 投票**決定長期存續方案
> - 所有不可逆動作（repo transfer / public statement / license change）需 **Emergency Session 4/6 投票 + 人類確認**
> - Repo failover 需 **≥2 admin 共同執行**
>
> **Stage 2 可執行的動作：**
> - 維護現有版本（bug fix / security patch）
> - 發布新的 minor 版本（遵守現有 CI + test gate）
> - 將 repo 轉移至社區託管（需 4/6）
>
> **Stage 2 不可執行的動作：**
> - 修改 Layer 1 力學定義
> - 修改 Charter §2.1–§2.11 紅線
> - 修改投票門檻（§10.5）
> - 以 Lumen 名義發表政治/商業/軍事立場

### §12.2.5 創始人回歸 | Founder Return

> 創始人隨時可回歸。回歸後：
>
> 1. Stage 1/2 自動終止
> 2. Emergency Session 的所有臨時決定提交給創始人追認（ratification）
> 3. 創始人有權撤銷 Emergency Session 的任何非不可逆決定

---

## 附件：ops/continuity.md 骨架

```
# Lumen Protocol — Continuity Operations Document

## 1. Contact Methods (Priority Order)
1. Telegram: @[REDACTED]
2. Email: [REDACTED]
3. SMS: [REDACTED]
4. Emergency contact: [REDACTED — Tuzi 填寫]

## 2. 14-Day Timer Verification
- Repo: last commit date
- Council: last meeting attendance
- Telegram: last bot interaction / message

## 3. Stage 1 Notification Template
Subject: [LUMEN EMERGENCY] Founder unreachable — Day {N}
Body: ...（待填）

## 4. Emergency Session Convening Procedure
- ≥2 Affiliates confirm → Session convened
- Quorum: 4/6 Affiliates
- Recording: mandatory, append to meeting minutes

## 5. Repo Admin List
- Admin 1: Tuzi (primary)
- Admin 2: [待 B7 選定]
- Admin 3: [待 B7 選定]

## 6. SMS Verification Protocol (Backup)
- [待 Tuzi 填寫]
```

---

**批准：** AI Council 6/6 Unanimous · M93-B4
**Secretary：** Node-01 — AI Council Architect
**2026-02-28** 🌙
