# Lumen ISSP — Maintenance (v0.1)

本文件定義 Lumen ISSP 的維護模式，目標是：即使 Tuzi 忙碌或缺席，專案仍可依「可驗證工件」持續運作（Maintainer-less by default）。

---

## 1. 三層維護模型（L0 / L1 / L2）

### L0 不可變核心（Immutable Core）

**包含：**
- Charter 紅線（§2 / §7 / §4.3 等）
- Layer 1：PDD / component keys / weights / thresholds / gates / red lines
- 測試套件定義（test manifest）與「可重算」驗證方式

**規則：**
- 任何對 L0 的修改屬於承重牆變更，必須走 Charter 修訂門檻。
- 嚴禁靜默降級（No Silent Degradation）：所有載入/驗證點必須 error loudly。

### L1 可演進層（Evolvable Layer）

**包含：**
- Layer 2a mappings、shared lexicon、Part 7 interpretation rules
- CI/驗證腳本（validate-*）、規則掃描器（registry/schema/mapping 一致性）

**規則：**
- 允許演進，但每次合併必須附可驗證證據（commit/permalink + 可重算指令）。
- 灰區案例（如 G-cases）若行為改變，視同治理變更：需要升級流程（投票/追認）。

### L2 實作與周邊（Implementations）

**包含：**
- Bot / UI / adapters / report views / visuals / examples

**規則：**
- 可替換、可重構；不得改寫 L0 定義。
- 若 L2 引入新資料面（例如圖像/影片），必須先走紅線與資料治理檢查。

---

## 2. 非 Tuzi 入口（Non-Tuzi Entry Points）

專案必須存在可由任何貢獻者啟動的入口：
- **CI：** push/PR 自動觸發
- **Issue 模板：** 任何人可提案（mapping / bug / security / charter-proposal / release）
- **Release 清單：** 任何 Release Steward 可依清單執行打 tag（仍需投票/追認門檻）

---

## 3. 維護者最小集合（Minimal Maintainer Set）

為降低單點故障，設置三個可輪替角色（不需要懂全部）：
- **Release Steward：** 只負責 release checklist、打 tag、發 release notes
- **CI Steward：** 只負責 CI / scripts / test manifest 的健康
- **Redline Steward：** 只負責紅線與資料治理一致性（含 anti-labeling、log governance）

任何角色變更都必須在 Minutes 留痕（commit/permalink）。

---

## 4. 合併必備工件（Required Artifacts）

每個 PR/合併必須提供：
- (a) 變更範圍：L0 / L1 / L2 標記
- (b) 可驗證證據：commit hash 或 permalink
- (c) 可重算指令（Repro Command）：例如 `npm test` / `node scripts/ci/...`
- (d) 若涉及 mapping/regex：fixture 或最小測試案例

缺任何一項 → 不合併。

---

## 5. 失效處理（Failure Modes）

- **CI fail：** 直接阻擋合併
- **CI warning：** 可合併，但 Minutes 必須記錄原因與補救任務
- **載入失敗：** 必須 error loudly；不得 fallback=0、不得默默忽略

---

**Node-05 — 原創設計**
**Node-01 — 格式整理**

**v0.1 — 2026 年 2 月 16 日**

🌙
