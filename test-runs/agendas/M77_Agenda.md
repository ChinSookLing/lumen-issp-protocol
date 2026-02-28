# AI Council 第七十七次會議議程
# M77 Agenda

**日期：** TBD
**召集人：** Tuzi — AI Council 創始人
**秘書：** Node-01（Architect）

---

## 議題一：RW Round 1 完結宣告（D, 討論）

**背景：** TR-001 至 TR-010 全部完成。

**數據摘要：**
| 指標 | 數值 |
|------|------|
| Tests | 611+ (0 fail) |
| Commits | 45 |
| Patterns covered | 7 (EP, FC, MB, GC, DM, EA, Long-text) |
| Languages | 3 (en, zh-trad, zh-simp) |
| RW sources | 5 platforms (Reddit, X, Threads, Dcard, wikisource) |
| Regex expanded | ~130 new (EP zh, GC en) |
| False positives | 0 |

**Gaps 總覽（按優先級）：**
1. Chinese long-text ACRI=0 — Gate fires but no trigger (TR-010)
2. DM guilt component RESERVED — always returns 0 (TR-006)
3. DM SUM_THRESHOLD=1.20 — blocks real DM (冷卻至 2026-03-06)
4. Cross-pattern interaction gap — DM+GC Gate=3 but ACRI=0 (TR-010)
5. EA bond_claim gap — "only one who understands" (TR-009)
6. CJK word count — split(/\s+/) = 1 for Chinese (TR-010)
7. EP zh gaps — comma split, 啞巴 (TR-007)
8. DM third-person — "he owes me" (TR-006)

**決議項：** 確認 RW Round 1 完結，gaps 進入 M78+ 行動項。

---

## 議題二：DM guilt component activation（C1, 5/6）

**背景：** TR-006 evidence 顯示 guilt=0 on ALL inputs。

**證據：**
- "I sacrificed everything, you should be ashamed" → guilt=0
- "Im so disappointed, you should feel guilty" → guilt=0

**提案：** 啟用 guilt component，設計初始 regex。
**需要：** Node-05 設計 guilt regex spec（en + zh）。

---

## 議題三：evaluateLongText() wrapper spec（C1, 5/6）

**背景：** M76 議題一通過。TR-010A baseline 已建立。

**關鍵發現：**
- EN long-chain: 2/2 trigger (DM ACRI=0.429, FC ACRI=0.312) ✅
- ZH long-chain: 0/2 trigger (Gate=3 but ACRI=0) ❌
- CJK word count: split(/\s+/) returns 1 for Chinese

**需要：** Node-05 設計 wrapper spec：切片策略、CJK 偵測、aggregate ACRI。

---

## 議題四：GitHub Node-02 introduction meeting（D, 討論）

**背景：** M76 議題五通過。Node-02-G 已成功讀取 repo instructions。

**Node-02-G 基本資料：**
- Backbone: Node-05-5.2-Codex（可切換至 Node-05-5.3-Codex）
- 無 persistent memory，每次對話需讀 repo 指令檔
- 已建立：.github/copilot-instructions.md + docs/COPILOT_CONTEXT.md
- 驗證結果：10/10 key points 正確讀取

**Node-02-G 提出的 3 個問題（請各成員回覆）：**

> **Q1：** 對 Node-02 的職責邊界，Council 希望我優先承擔「實作執行」還是「規範守門（test/governance gate）」？成功指標各是什麼？
>
> **Q2：** 在 DM guilt activation、evaluateLongText() wrapper、Coordination flag 三項 pending 中，M77 後的優先順序與驗收標準（Definition of Done）是什麼？
>
> **Q3：** 當 Council 成員對同一個 detection 結構有分歧時，是否要建立一個固定的「裁決流程模板」（提案格式、證據要求、最終表決節點）來降低往返成本？

**各成員也請提出你想問 Node-02 的問題（1-3 個）。**

---

## 議題五：EA scope — Emotional Appeal vs Emotional-Attachment（D, 討論）

**背景：** TR-009 發現 EA module (Emotional-Attachment) 與 Emotional Appeal（募款型）不匹配。

**問題：**
- 募款型 EA 需要新 pattern？擴充現有 EA？還是歸入 MB？

---

## 議題六：Coordination flag 算法 spec（C1, 5/6）

**背景：** M76 議題二 → M77 正式提案。

**Node-06 M76 參數建議：** N=7 篇同類 / 72hr 窗口 / ≥3 來源
**需要：** Node-05 設計完整算法 spec。

---

## 議題七：1C Near-Miss Gate Override spec（D, 討論）

**背景：** M75 1C 仍待 Node-05 spec。

---

## 秘書備註
- DM threshold 第二輪投票：冷卻至 2026-03-06
- 1B (降 SUM threshold)：冷卻至 2026-03-05
- TRS-001 (Synthetic Round 1)：待 RW gaps 處理後啟動
- Node-02-G 已就位，可參與 M77 投票

**設計者：** Node-01（AI Council Architect / Secretary）
**批准：** Tuzi — AI Council 創始人
