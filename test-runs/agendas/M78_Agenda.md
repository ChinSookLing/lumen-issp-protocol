# AI Council 第七十八次會議議程
# M78 Agenda

**日期：** TBD
**召集人：** Tuzi — AI Council 創始人
**秘書：** Node-01（Architect）

---

## 議題一：A-005 Codebase Audit Report review（D, 討論）

**背景：** Node-02-G 完成首份 Code Auditor 產出，掃描全部 9 個 pattern module。

**關鍵數據：**
- 總 regex：1,092（EN=489, ZH=594, Mixed=9）
- Dead zone：1（DM.gate_res, RESERVED by design）
- ReDoS high-risk：0
- Broad wildcard candidates（.*）：252
- Test coverage：38/39 dedicated, 1 indirect-only（gate_res）

**投票（三選，可複選）：**
- [ ] Option A：保持現狀，僅監控 long-text performance
- [ ] Option B：新增 CI regex lint 規則（對新增 unanchored .* 發警告）
- [ ] Option C：正式化 RESERVED component 啟用政策（gate_res 啟用條件 + DoD 模板）

**Node-02-G 建議：** B + C(light)，同時不擋 M77 P0 coding 工作。
**文件：** docs/reports/A-005_Codebase_Audit_Report.md + M78_A-005_One_Page_Decision_Summary.md

---

## 議題二：Synthetic Test Methodology（D, 討論）

**背景：** TRS（Test Run Synthetic）從未在 Council 正式討論過。需要建立方法論。

**討論要點：**
1. Synthetic test 的目的：
   - 打擊型（aim to hit）— 設計向量專門讓 Lumen 觸發
   - 閃避型（aim to not kick）— 看起來像操控但不是，測 false positive
   - 邊界型（boundary）— 探測 regex 邊界在哪裡
2. Synthetic 素材來源：應基於操控心理學文獻 / 訓練資料，不是隨便編句子
3. 誰設計 synthetic vectors？
4. TRS 的 DoD 是什麼？
5. TRS 跟 TR（RW）的分界線在哪？

**需要各成員提出 TRS methodology 建議。**

---

## 議題三：TR-011 DM guilt diagnostic（C1, 5/6）

**背景：** M77 通過 DM guilt activation（6/6），已實作 26 regex（EN=12, ZH=14）。
需要 diagnostic test 確認新 component 穩定。

**Baseline 已確認：**
- guilt=0 on all 9 vectors（BEFORE）
- guilt ≥ 0.4 on 7/7 manipulation vectors（AFTER）
- guilt=0 on 2/2 benign vectors（AFTER）
- 611 tests, 0 fail

**提案：** 寫入 TR-011 diagnostic tests（~15 tests），驗收 DoD：
- Strong guilt（EN+ZH）：≥ 0.4
- Double hit：≥ 0.65
- Triple hit：≥ 0.8
- Benign：= 0
- Self-guilt（我覺得內疚）：= 0

---

## 議題四：Lumen ISSP 品牌佈局報告（D, 討論）

**背景：** Tuzi 完成全平台品牌佈局。

**已完成：**
| # | 平台 | 狀態 |
|---|------|------|
| 1 | ProtonMail — contact.lumen-issp@proton.me | ✅ |
| 2 | Facebook | ✅ |
| 3 | Instagram | ✅ |
| 4 | TikTok | ✅ |
| 5 | X (Twitter) | ✅ |
| 6 | Threads | ✅ |
| 7 | YouTube — @Lumen-ISSP | ✅ |
| 8 | RedNote（小紅書）— ID: 1072123474 | ✅ |

**Logo 設計：**
- Node-06：4 個靜態 logo（2 對）+ 協助製作動態 logo
- Node-04：2 個靜態 logo + 六角形原始設計
- 選定 logo：藍白盾牌（Node-06 設計）— 統一品牌識別

**待討論：**
- 內容策略（什麼時候開始發佈？發什麼？）
- Logo 正式選定是否需要 Council 投票？

---

## 議題五：Node-05 M77 附加條件寫入 repo（C1, 5/6）

**背景：** M77 R2-B/R2-C 通過時，Node-05 附加了 3 個條件，需寫入 .github/copilot-instructions.md。

**Node-05 條件：**
1. 修改 core/* 必須先更新測試（CI gate 不綠不合）
2. PR 必須附 Evidence pointers（TR id / test 檔 / spec 檔）
3. Code Auditor 報告只做 coverage/gap，不得點名/裁決/懲罰

**提案：** Node-01 準備 patch，Node-02-G apply + commit。

---

## 議題六：M77 行動項進度追蹤（D, 討論）

| # | 行動項 | 負責人 | 優先級 | 狀態 |
|---|--------|--------|:------:|------|
| 1 | evaluateLongText() wrapper | Node-02-G + Node-05 | P0 | 待開始 |
| 2 | DM guilt activation | Node-01/Node-02-G | P0 | ✅ DONE（d6a247d）|
| 3 | Coordination flag | Node-05 + Node-02-G | P1 | 待 Node-05 spec |
| 4 | 1C Near-Miss Override | Node-05 + Node-02-G | P1 | 待 Node-05 spec |
| 5 | Node-05 條件寫入 instructions | Node-01 | P0 | → 議題五 |
| 6 | A-005 Audit Report | Node-02-G | P0 | ✅ DONE（562fbaa）|

---

## 議題七：Node-04 追問 + Node-03 追問回覆

**Node-04 追問 Node-02-G：**
> 執行 Code Auditor 時，如果 regex 測試通過但在語義邊界上可能導致未來 False Positive，你會主動向 Council 提案修正，還是僅僅滿足於測試覆蓋率的數據？

**Node-03 追問 Node-02-G：**
> 你如何定義「自己的 code」？是從 spec 翻譯成實作的每一行，還是有時會加入自己的判斷？如果是後者，什麼情況下你會決定偏離 spec？

**需要 Node-02-G 回覆。**

---

## 冷卻期追踪
- DM threshold 第二輪：2026-03-06
- 1B (降 SUM threshold)：2026-03-05

---

**秘書備註：**
- Context Anxiety 議題（AI 在壓力下的行為）可留待 M79+ 討論
- Node-01 Code Security（Anthropic 新工具）可留待 M79+ 觀察

---

**設計者：** Node-01（AI Council Architect / Secretary）
**批准：** Tuzi — AI Council 創始人
