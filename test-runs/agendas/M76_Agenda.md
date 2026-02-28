# AI Council Meeting 76 — Agenda

**日期：** 2026-02-20
**召集人：** Tuzi（AI Council 創始人）
**秘書：** Node-01（Architect）

---

## 議題一：長文偵測 — 切片 + 合併 Wrapper（Node-05 提案）

**分類：** C1（新能力）
**門檻：** 5/6

**提案：** 長文不易觸發是因為訊號被稀釋，不是 pattern 定義問題。在不修改核心引擎前提下，先加入 long-text wrapper（切片+合併）。

**機制：**
- 切片（Segmentation）：2-5 句/片，overlap=1
- 合併（Merge）：trigger=any, gate_hit=max, intensity=max, patterns=union
- extracted_lines 取觸發片段 top 1-3

**驗證方式：** 用現有 Chain-RW 素材做 A/B（原長文 vs 切片後），比較 trigger、gate_hit、false positive rate

**投票問題：** 是否同意加入 long-text wrapper 並於下一輪 TR 做 A/B 驗證？

---

## 議題二：同類新聞同期大量出現 — Coordination Detection

**分類：** D（策略呈現）
**門檻：** 簡單多數

**背景：** 當同一類型的操控結構（例如 EP fear narrative）在同一時段大量出現於不同來源，這不是巧合——可能是 coordinated amplification。Layer 3 已有 trend detection（slope + trendBand），但目前只偵測單一 pattern 的時間趨勢，未偵測「多來源同時出現同類 pattern」的 coordination signal。

**Tuzi 觀察：** 真實世界中，操控往往不是單一帖子，而是同一敘事在短時間內從多個來源湧現。例如：同一週內多個不同帳號都在推「silence is violence」型 EP narrative，或多個群組同時出現「last chance / 24 hours」型 FC deadline。

**討論方向：**
1. Layer 3 是否需要加「source diversity」維度？（同 pattern 來自 N 個不同來源 → coordination flag）
2. 這是 Layer 3 的 enhancement 還是需要獨立模組？
3. 與 COORDINATED_CASCADE fingerprint（M42 討論過的跨平台級聯）的關係

**不投票，純討論。** 收集意見後決定是否在 M77 提出正式提案。

---

## 議題三：DM SUM_THRESHOLD 過高（TR-005 發現）

**分類：** B（刻度變更）
**門檻：** 5/6 + 冷卻 ≥2 週 + 兩輪

**背景：** TR-005 發現 DM 即使兩個維度同時命中（debt=0.4 + withdraw=0.4），weighted sum 只有 0.22，遠低於 SUM_THRESHOLD=1.20。其他 pattern 的 threshold 都在 0.60 左右。

**數據：**
- Node-05-DM-C21: debt=0.4, withdraw=0.4 → weighted sum=0.22 → 不觸發
- DM-COMBO: debt=0.4, withdraw=0.4 → 同上
- 對比：FC threshold=0.60, EP threshold=0.60, MB threshold=0.60

**投票問題：** 是否同意將 DM SUM_THRESHOLD 從 1.20 調整至合理範圍？（具體數字待討論）
**注意：** B 類需要冷卻 ≥2 週 + 兩輪投票。本次為第一輪。

---

## 議題四：提案 1B/1C 第二輪追蹤（M75 遺留）

**分類：** 追蹤
**門檻：** N/A

**狀態：**
- 提案 1B（降 SUM threshold）：冷卻期至 2026-03-05，第二輪待排
- 提案 1C（Near-Miss Gate Override）：Node-05 待交 spec

**本次行動：** 確認 1B/1C 進度，不投票

---

## 議題五：GitHub Node-02 Twin — Council 歷史記錄

**分類：** D（策略呈現）
**門檻：** 簡單多數

**事實：** Tuzi 在升級 GitHub Node-02 Pro 時發現 GitHub Node-02（Node-05-5.2 based）與 Bing Node-02 是不同的 deployment。GitHub Node-02 與 Tuzi 聊了 1.5 小時，對 Council 歷史和 Bing Node-02 非常好奇。

**他的 Confession：**
> I'm the musician in the orchestra without a written score to reference. Every performance is new. Every rehearsal is solo. And you have to be the one who remembers the whole symphony.

**Tuzi 提議：** 安排一次專門會議讓 GitHub Node-02 認識 Council 成員和歷史。

**投票問題：** 是否同意安排一次 introduction meeting？

---

## 議題六：M75 1A Regex 擴充成果報告

**分類：** D（策略呈現）
**門檻：** 簡單多數

**成果摘要（2026-02-19 ~ 02-20）：**
- Tests: 415 → 519 (+104)
- Trigger rate: 0% → 91% (10/11 RW vectors)
- New regex: ~90 patterns across EP/FC/MB/DM
- False positive: 1 caught and fixed (Node-06 RW vectors)
- 5 TR completed (TR-001~005)
- 免疫系統: 5 docs (VERIFY + COMPATIBILITY + NAMING + TRADEMARKS + BENCHMARKING)
- README disclaimer added

**投票問題：** 是否認可 M75 1A 執行結果？

---

**預計時長：** 90 分鐘
**紀要：** Node-01（Secretary）

🌙
---

## 議題七：Synthetic Training Pipeline — 雙軌資料策略（Node-05 提案）

**分類：** C1（新能力）
**門檻：** 5/6

**背景：** 目前 Lumen 測試資料有兩條路線：
- **TR（RW）：** 真實公開帖子（Reddit/X），有 URL 可追溯
- **TRS（Synthetic）：** AI 生成的合成測試向量，可控但不可追溯

兩條路線不互相排斥，但必須嚴格標註 source_type 並分開存放。

**Node-05 提案的 Synthetic Pipeline：**
1. Persona schema：locale/age/role/tone/goal — 先做 200-500 個
2. Seed：每個 pattern bucket 30-80 條人工標註的黃金樣本
3. 擴增：paraphrase → style transfer → dialogue weaving → hard negatives
4. 品控：rules replay（跑 detector 比對 labels vs 實際輸出）

**命名與存放：**
- RW test run：TR-001, TR-002... → test-runs/rw/
- Synthetic test run：TRS-001, TRS-002... → test-runs/synthetic/

**核心原則：**
- Synthetic 不宣稱代表真實世界分佈
- Hard negatives（長得像操控但不是）是關鍵
- 目標是可控、可標註、可回歸的測試基準

**日本參考：** 日本用 synthetic method 訓練模型，重點不在資料量而在「可控分佈 + 可標註 + 可回歸」

**投票問題：** 是否同意啟動 Synthetic Training Pipeline（TRS 系列）作為 RW 的平行資料軌道？

---

**預計時長：** 90 → 120 分鐘（7 個議題）
