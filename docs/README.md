# docs/ — Working Papers & Minutes

本目錄收錄 Lumen ISSP 的工作文件、會議紀要、草案與討論記錄（working papers / minutes）。

**重要：此目錄內容為 non-normative** ——不構成規格、不構成裁定、不構成背書，也不代表最終立場。
如需引用規格要求或相容性裁定，請使用下方的權威來源。

---

## 1) Authority Ladder

### A. Ratified Spec
- RATIFIED.md：已核准版本與指向
- core/：協議核心（spec-critical）
- conformance/：相容性裁定測試（compatibility gate）
  - **Compatibility 裁定以 conformance 測試結果為唯一真相。**

### B. Governance & Redlines
以下文件位於倉庫根目錄，屬於對外治理入口：
- REDLINES.md（non-negotiable）
- GOVERNANCE.md
- MAINTENANCE.md
- COMPATIBILITY.md
- NAMING.md
- TRADEMARKS.md
- RESPONSIBILITY.md
- AGENT_BEHAVIOR.md

### C. docs/（本目錄：工作記錄）
- 會議紀要、草案、索引文件與討論稿
- 可能包含假設生成、探索性觀點與未定稿內容
- **不得**被外部引用為官方規格或正式裁定依據

---

## 2) Use & Citation Rules

允許：
- 引用 docs/ 作為討論脈絡或歷史記錄（informational）

禁止：
- 引用 docs/ 來主張：相容性裁定、官方背書、或規格義務
- 將 docs/ 內容用於羞辱、排名、懲戒、身份指控或自動裁決流程

任何相容性宣稱與裁定，請回到：
- RATIFIED.md + core/ + conformance/

---

## 3) Security & Non-Weaponization

Lumen ISSP 的目標是觀測風險而非驅動懲罰。

若某份工作文件包含可能被武器化的操作細節，應採取：
- 公開版本：保留結論與原則（summary）
- 私有存檔：移除或刪節敏感細節（redaction / private archive）

---

## 4) Suggested Header Template

建議每份紀要/草案在頁首加入：
- Status: Draft / Informational / Archived
- Authority: Non-normative
- Spec Pointer: RATIFIED.md
- Timestamp (UTC)
- Notes: 若含假設生成，請標注信心等級

---

## 5) Where to Start

- 想了解已核准規格：先看 RATIFIED.md
- 想驗證相容性：跑 conformance/ 測試
- 想理解治理與紅線：看根目錄治理文件（例如 REDLINES.md）
- 想看討論脈絡：再閱讀 docs/
