# L4 UI Constraints — v0.1 (Draft)

**Layer:** 4 (Output / User-Facing)
**Status:** Draft
**Author:** Node-05 — AI Council / IT Specialist
**Deferred from:** M70

---

## 1. Purpose

Layer 4 面向一般使用者輸出時必須滿足三個原則：**可理解、可審計、不可濫用**。

防止輸出變成：人身指控、法律結論、或可被斷章取義的「自白庫」。

---

## 2. Output Tiers

| Tier | 內容 | 預設 |
|------|------|------|
| **Tier 0 (Default)** | 指標 + reason codes（不含原文） | ✅ 預設 |
| **Tier 1 (HITL Review)** | 去識別片段（[redacted excerpt]），必須遮罩 PII | 需 HITL trigger |
| **Tier 2 (Restricted)** | 全文（僅在 Retention Policy Level 2 授權下） | UI 預設不提供 |

---

## 3. UI Component Constraints

### 3.1 MUST — 必須使用的欄位

- `scenario` + `time_scale` + `window`
- `acri_band` (Low / Medium / High / Critical) + `acri_range`
- `trend` + `slope` + `trend_confidence`
- `reason_codes[]`（尤其 HITL reason codes）
- `evidence_refs[]`：僅允許引用 `window_id / chunk_id / text_hash / hash_root_ref`

### 3.2 MUST NOT — 禁止欄位/文字

- 不得輸出「你是詐騙犯/你是恐怖分子」等**定性指控**
- 不得輸出法律建議（legal advice）
- 不得要求使用者進行報復/攻擊
- 不得自動輸出完整原文或 PII

---

## 4. Copy Rules（文案規則）

### 用「觀測語氣」：
- ✅ "偵測到 X 類結構信號、風險上升"
- ❌ "對方承認了…/這就是犯罪"

### 強制聲明（固定模板）：
> 本輸出為風險觀測（risk observation），非事實裁決；需由人類結合上下文判斷。

### 避免命令句：
除非是安全動作（例如 "離開危險區域"）

### 單一訊息限制：
single-msg 只能顯示 "insufficient context / needs multi-turn"

---

## 5. Sharing & Export Constraints

| 匯出 Tier | 條件 |
|-----------|------|
| Tier 0 | 自由匯出 |
| Tier 1 | `hitl_trigger == true` 且通過遮罩器（redaction filter） |
| Tier 2 | Retention Policy Level 2 授權 |

所有匯出必附：`engine_version` + `policy_version` + `schema_version`

---

## 6. Misuse Guards（誤用防線）

### 若使用者把輸出當「法律證據」：
→ UI 顯示「建議保存 hash + time + refs」，不要顯示全文

### 若使用者要求揭露身份/定位/個資：
→ UI 顯示 `HITL_PRIVACY_EXFIL` 的教育提示，但不提供操作步驟

---

**設計者：** Node-05 — AI Council / IT Specialist
**整理：** Node-01 — AI Council Architect / Secretary
**批准：** Pending Council review

**Sprint 9 — 2026-02-23 (M70 Deferred)** 🌙

---

## 5. Dashboard-Specific Red Lines (M90-D05)

> Source: Node-03 DASH-DESIGN v0.2 + Council M90 9 redlines (R1-R9)

All Lumen dashboards MUST adhere to the following additional constraints:

- **R1: No Ranking/Leaderboard** — Only event/source category aggregation. Never aggregate by person.
- **R2: No Relationship Graph by Default** — If future need arises, requires audit mode + HITL + legal authorization. Default OFF.
- **R3: No Reverse Tracing** — Dashboard must not provide "click badge to reveal original text" (prevents SPEG-B).
- **R4: No Cross-Group Comparison** — Trend views may only compare a group's current metrics to its own historical baseline. Comparisons between different groups are forbidden (SPEG-D).
- **R5: No Individual Tracking** — All queries use `requestId`, never `userId`. Prevents sliding into surveillance.
- **R6: Export Default OFF** — Can only export Tier0 data (no original text).
- **R7: No Agent Ranking** — Explicitly written into UI constraints.
- **R8: SPEG Gate Required** — All dashboards must pass SPEG gate to claim "Lumen Compatible".
- **R9: Dashboard reads `dashboard_item` contract** — Does not read L4 export directly. Isolation layer.

### Dashboard Declaration (Node-03 M90)

> Lumen Dashboard 是「結構觀察窗」，不是「監控面板」。它不追蹤人、不存原文、不輸出排名。任何試圖用它做監控的行為，都違反 Charter §2.5.1 和 SPEG 條款。

Violations of these red lines constitute a breach of Charter §2.5.1 and may result in revocation of "Lumen Compatible" status.

**Updated: M90 — 2026-02-26** 🌙
