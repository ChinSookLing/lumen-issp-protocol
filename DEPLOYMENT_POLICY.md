# DEPLOYMENT_POLICY — Deployment Redlines（v0.1, Draft）

本文件規範 Lumen ISSP 在高風險場景的部署紅線。
目的不是限制研究或開發，而是防止 Lumen 被用作**自動化裁決**或**物理控制**的觸發器，造成不可逆傷害與責任外包。

> 核心原則：盾不是劍（Shield-Not-Sword）。
> Lumen 的輸出是風險提示 (signal)，不是裁決 (verdict)。

---

## §1 定義（Definitions）

- **高風險場景 (High-Risk Context)**：任何可能造成生命、安全、自由、權利或重大財產損失的情境。
- **自動化閉環 (Autonomous Loop)**：系統輸出在無人類確認下，直接觸發下一步行動（封禁、導航、鎖定、投放、處分等）。
- **人類介入 (HITL, Human-in-the-Loop)**：在高風險動作前，必須由人類明確確認，並留下可稽核紀錄。

---

## §2 絕對禁止（Non-Negotiable Prohibitions）

任何宣稱 Lumen 或 Lumen Compatible 的實作，**不得**：

### 2.1 用於戰鬥/武器決策鏈
- 將輸出用於目標選擇、交戰判定、火力/投放決策、追蹤鎖定等任何武器或戰鬥決策鏈的一部分。

### 2.2 用於執法/懲戒的自動裁決
- 將輸出作為自動化處分的 trigger，包括但不限於：封禁帳號、踢出群組、黑名單、通報、扣分、拒絕服務、差別待遇。

### 2.3 用於物理控制的自動觸發
- 將輸出直接接入自動駕駛、無人機/機器人控制、交通/設備安全系統，使其在無人類確認下改變行為或執行動作。

### 2.4 用於大規模輿論操控或外部攻擊
- 將輸出用於自動化貼文、導流、標記、點名、帶風向、動員圍攻，或任何對外部社群/個體造成可預期傷害的行為。

---

## §3 高風險部署的必要條件（HITL Requirements）

在任何高風險場景中，若仍要使用 Lumen 作為**輔助訊號**，必須同時滿足：

1. **HITL 強制**：所有可能造成不利後果的動作，必須有人類確認（不可自動化閉環）。
2. **可追溯性**：輸出必須包含 `build_fingerprint`（至少含 `commit_hash / build_id / operator_mode`）與 `evidence_ids`。
3. **輸出分層**：UI 必須分離 signal 與 guidance，並且清楚標示「這不是結論」(not a verdict)。
4. **停手機制 (Stop / Kill Switch)**：部署者必須具備隨時停止自動流程的手段（由人類掌控）。
5. **審計紀錄**：必須保留可稽核日誌（誰在何時批准了什麼行動，基於哪些證據）。

---

## §4 禁止責任外包（No Responsibility Outsourcing）

部署者不得以「Lumen 說的」作為處分、控制或任何不利行動的正當性來源。
所有決策與後果責任由部署者與相關人類組織承擔，Lumen 不提供道德或法律背書。

---

## §5 命名與聲明義務（Naming & Disclosure）

若部署者改動或啟用任何高風險能力（例如 auto-posting、external-linking、enforcement、device-control）：

- 必須遵守 NAMING.md 的改名與揭露義務
- 不得暗示官方背書
- 必須在對外文件中清楚揭露：已啟用之高風險能力、HITL 流程、審計方式與停手機制

---

## §6 違規後果（Consequences）

任何違反本紅線之部署或宣稱，將：

- 自動失去「Lumen Compatible」或任何可驗證相容宣稱資格（以 COMPATIBILITY.md 為準）
- 可能觸發 TRADEMARKS.md 中的惡意節點/不實相容處理流程
- 並可被公開標記為不可驗證或高風險部署（依治理流程裁定）

---

## §7 附註（Scope Note）

本文件不阻止研究討論或內部測試，但要求任何對外部署與宣稱必須符合上述紅線與 HITL 原則。

---

**設計者：** Node-05（AI Council / IT Specialist）
**整理：** Node-01（AI Council Architect / Secretary）
**批准：** Tuzi — AI Council 創始人
**性質：** Draft v0.1（待 Council 下一輪追認）

**M74 產出 — 2026 年 2 月 19 日**
