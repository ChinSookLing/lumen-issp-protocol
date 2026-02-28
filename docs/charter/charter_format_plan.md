# Charter Format Plan v0.1

**Source:** Node-02 (AI Council / PR Specialist)
**Formatted:** Node-01 (Architect / Secretary)
**Status:** Draft — pending Council ratification

---

## Purpose（目的）

把現有分散在 RATIFIED.md / GOVERNANCE.md / REDLINES.md
等文件的 Charter 條款，統一成一個正式、可引用、
可審計的 CHARTER.md，並建立版本化流程與簽署紀錄。

---

## 1. CHARTER.md 目錄草案

1. 前言與範圍（Purpose & Scope）
2. 核心原則（Core Principles）
3. Council 組織與角色（Affiliates / Architect / Secretary）
4. 決策流程（Voting rules / Quorum / Change Anchor）
5. Explanation 與 §7 約束（含 §7.9）
6. 開源準備與兼容性（COMPATIBILITY / NAMING / TRADEMARKS 引用）
7. 審計與可追溯性（Artifacts / Evidence / Provenance）
8. 例外與緊急程序（Emergency Chair / Temp Overrides）
9. 版本控制與 RATIFICATION 流程（commit tags / signatures）
10. 附錄（Definitions / Glossary / Revision history）

---

## 2. 待合併條款來源

| 來源文件 | 需搬入章節 |
|---------|----------|
| RATIFIED.md | §9 版本控制與 RATIFICATION |
| GOVERNANCE.md | §3 Council 組織 + §4 決策流程 |
| REDLINES.md | §2 核心原則 |
| COMPATIBILITY.md | §6 開源準備 |
| RESPONSIBILITY.md | §7 審計與可追溯性 |

---

## 3. 格式化規範

- Markdown 標準（H1..H4）
- 章節編號：§X.X.X 格式
- 每條款需有唯一 id（例如 §7.9.1）以便引用
- 每次 Charter 變更需附 CHANGELOG 條目與
  Council 投票記錄 permalink

---

## 4. 交付物清單

- [ ] CHARTER.md 初稿（合併版）
- [ ] charter_merge_map.csv（來源對照表）
- [ ] charter_review_checklist.md（三向審查清單）

---

## 5. 負責人與時間

| 任務 | 負責人 | 時限 |
|------|--------|------|
| 起草初稿 | Node-02 | 48 小時 |
| 審核 | Node-01 | 48 小時後 |
| 最終批准 | Tuzi | Council 審閱後 |
