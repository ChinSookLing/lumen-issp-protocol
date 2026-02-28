# Lumen ISSP — Governance (v0.1)

本文件定義治理流程：誰能改什麼、怎麼證明、怎麼追認（Ratification），以及如何避免「靜默失效」。

---

## 1. 紅線（Red Lines）總則

Lumen ISSP 必須遵守（已鎖定或需高門檻修改）：
- 不輸出行動建議（No Decision Recommendation）
- 不輸出身份指控（No Identity Targeting）
- 不設中央數據庫（No Centralization）
- 禁止靜默降級（No Silent Degradation）
- 輸出去人格化（Anti-labeling / No Personhood Judgement）
- 日誌治理（Log Governance：least privilege / retention / purpose limitation）

詳見：`REDLINES.md`

---

## 2. 變更分級與門檻（Change Tiers）

### Tier A：承重牆（L0）

**範圍：** Charter 紅線、Layer 1 定義、測試套件定義、§4.3 等
**門檻：** [TBD — Council vote]
**要求：** 必須附完整對照表（before/after）+ 可重算指令 + 風險說明

### Tier B：操作規範（L1）

**範圍：** CI 規則、Part 7 解釋規則、mapping formalization 流程
**門檻：** [TBD — Council vote]
**要求：** 必須附可驗證證據 + 可重算指令 + 影響面清單

### Tier C：一般變更（L2）

**範圍：** UI、docs、examples、非核心重構
**門檻：** 一般審查通過即可（仍需工件齊全）

---

## 3. 可驗證性標準（Verifiability）

任何治理結論都必須能被外部重算或重放：
- commit / permalink（不可只用口述）
- 可重算指令（Repro Command）
- 測試報告：本地或 CI 產物（如有）

若無法提供：必須明示「我無法驗證」並標記阻塞或降級為討論題。

---

## 4. 能力變動揭露（Capability Change Disclosure）

若任何成員因版本/權限/方案新增或受限能力，必須主動揭露：
- 變動描述：新增/受限/不穩定
- 證據：permalink / commit / 指令 / 截圖（至少一項可驗證）
- 失效模式（Failure Mode）：何時會被擋、何時不可靠
- 治理影響：是否會改分工或增加新 gate

---

## 5. 非 Tuzi 入口（Non-Tuzi Entry Points）— 治理版

以下流程不得只依賴單一人啟動：
- **會議：** 可由 Architect/Secretary 或任何成員依模板發起
- **Issue：** 任何人可開；標準模板分類
- **Release：** 由 Release Steward 依 checklist 執行；ratification 仍需投票門檻
- **Tag/Version：** 必須對應 ratified commit；不可「口頭發布」

---

## 6. 證據輸出雙層（Two-Tier Evidence Output）

- **公共輸出：** 脫敏（不含原始內容）
- **本地審計：** hash/pointer 回放，不離開節點
- 兩層不得混用；任何跨節點彙總禁止

---

## 7. Council 定義

Council 是本專案的治理流程名字：所有決議以公開紀要（minutes）記錄，並以追認 tag/commit 落地。是否相容只看可驗證證據（permalink / command / CI report），不靠「誰說了算」。

Council 是本協議的當期維護者；其責任以可驗證流程交接，而非永久個人承諾。

---

**Node-05 — 原創設計**
**Node-01 — 格式整理**

**v0.1 — 2026 年 2 月 16 日**

🌙
