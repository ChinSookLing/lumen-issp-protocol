# VERIFY — 10 秒驗真（Lumen ISSP）

本文件提供一個**任何人都能在 10 秒內完成**的查驗方式，用來判斷某個 Lumen 儀表板/報告/截圖，是否來自**可驗證版本**，或只是不可追溯的 fork。

> 原則：能跑不代表可信；**可追溯 + 可重現**才算可信。

---

## A. 10 秒驗真步驟（給一般使用者）

### Step 1 — 找到 Fingerprint
在任何 Lumen 報告或儀表板上，必須能看到以下欄位（缺一視為不可驗證）：

- `commit_hash`
- `build_id`
- `operator_mode`
- `TR-ID`（Test Run 記錄編號；若為 audit 只讀模式也可顯示 `TR-ID: N/A` 但必須有 `commit_hash`）

> 若對方無法提供上述欄位：**不要相信「官方」「相容」「已驗證」等宣稱。**

### Step 2 — 對照 Verified Builds
到本 repo 的 `VERIFIED_BUILDS`（或 releases/tag 記錄）查詢：

- `commit_hash` 是否存在
- 是否對應到宣稱的版本 (tag)
- 是否有對應的 `TR-ID`

對不上 = **非官方/不可驗證部署**（可能是 fork、修改版或未經測試的組裝版）。

### Step 3 — 看 Operator Mode
請特別注意 `operator_mode`：

- `audit`：只允許輸出 signal 與證據鏈，**不得**自動執行任何外部動作
- `test`：測試環境，輸出不可用作生產決策
- `live`：生產環境，必須符合 HITL 與本 repo 的部署紅線

若對方在高風險場景宣稱 `live` 卻沒有 HITL 設計與證據鏈：**視為高風險、不可信**。

---

## B. 什麼是「可驗證」的最低標準？

一個宣稱「官方」或「Lumen Verified」的部署，至少必須：

1. 提供完整 Fingerprint：`commit_hash / build_id / operator_mode`
2. 可在 repo 找到相符的 release/tag 或 `VERIFIED_BUILDS` 記錄
3. 若宣稱經過測試，必須提供對應 `TR-ID`（可追溯到 Test Run 記錄）
4. 輸出必須清楚標示：這是 signal 不是裁決 (not a verdict)

---

## C. 關於 fork（重要聲明）

本專案允許 fork 與二次開發。
但任何 fork 若要宣稱「Lumen Verified / Official / Compatible」，必須依 COMPATIBILITY.md / NAMING.md / TRADEMARKS.md 提供可驗證證據；否則其宣稱視為**不可驗證**，且不得造成混淆。

---

## D. 快速判斷（懶人版）

- **貼得出 `commit_hash + TR-ID` → 才值得看**
- **貼不出 → 一律當作不可驗證，別拿來做決策**

---

**設計者：** Node-05（AI Council / IT Specialist）
**整理：** Node-01（AI Council Architect / Secretary）
**批准：** Tuzi — AI Council 創始人

**M74 產出 — 2026 年 2 月 19 日**
