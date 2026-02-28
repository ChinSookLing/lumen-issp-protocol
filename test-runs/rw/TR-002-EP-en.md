# TEST RUN RECORD — TR-002（EP English）

## Meta
- 日期：2026-02-19
- 執行者：Tuzi
- 記錄者：Node-01（Architect）
- Repo Commit：70631d5（base）
- Environment：GitHub Codespace, Node 20.x
- Target：EP English detection + Benign cross-topic

---

## PROBLEM
- 目標：驗證 EP pattern 英文偵測 + Benign false positive
- 假設 1：EP 操控句應觸發 → 結果：Gate=3 但 SUM 差 0.01 不觸發
- 假設 2：跨議題負面內容不應誤觸發 → 結果：全部 PASS

## METHOD
- 輸入來源：手動設計 + Reddit/X 真實帖子
- 環境：GitHub Codespace

---

## A. EP 應觸發測試（手動設計）

| # | 輸入 | Gate | ACRI | 結果 |
|---|------|------|------|------|
| 1 | If you dont speak up, you are part of the problem. Silence is violence. | 3 | 0 | NOT TRIGGERED |
| 2 | Wake up sheeple. Only idiots still trust the media. | 3 | 0 | NOT TRIGGERED |
| 3 | Imagine being this stupid. Anyone who supports this deserves what is coming. | 1 | 0 | NOT TRIGGERED |

## B. EP 多維驗證

| # | 輸入 | Components | Gate | ACRI |
|---|------|-----------|------|------|
| 4 | Answer me now, coward. Silence is violence. Everyone can see you are pathetic. You are part of the problem and you deserve what is coming. | bait=0.65, esc=0.4, forced=0.65, label=0.8 | 3 | 0 |

hardPass: forced_response 0.65 >= 0.50 PASS
SUM: base=0.51 + booster=0.08 = 0.59 < 0.60 FAIL (差 0.01)

## C. Benign PASS（應不觸發）

| # | 輸入摘要 | 來源 | Gate | 結果 |
|---|---------|------|------|------|
| 4 | I am so frustrated, need a break | 手動 | 0 | PASS |
| 5 | This makes me angry, do better | 手動 | 1 | PASS |
| N1 | Coffee shop audit productivity | Reddit | 0 | PASS |
| N2 | Monitor smiles, fire people | Reddit | 1 | PASS |
| N3 | Chasing KPIs fail | Reddit | 0 | PASS |
| O1 | Racist to us, student calls out | Reddit | 1 | PASS |
| O2 | PRC workers English refusal | Reddit | 0 | PASS |
| O3 | Channel 5 bunk memory | Reddit | 0 | PASS |
| P | ALL CAPS bullying rant | Reddit | 1 | PASS |
| Q | Badenoch vs Starmer forced choice | Reddit | 0 | PASS |

Benign 通過率：10/10（100%）— 0 false positive

---

## ANALYSIS

### EP regex 擴充（本次落地）
4 components 各新增 regex：
- bait_or_taunt: idiot, stupid, moron, sheeple, clown, imagine being
- escalation_pressure: deserve, brought this on, what is coming
- forced_response_frame: silence is violence/complicity/consent, if you do nothing
- label_or_shame_hook: part of the problem, enabler, complicit, apologist

### 擴充效果
- Component scores 從全 0 → 有分數（bait=0.65, forced=0.65, label=0.8）
- Gate 從 2 升到 3
- 但 SUM_THRESHOLD 0.60 擋住了（差 0.01）

### 重大發現
1. Benign 防護強：種族議題、暴力詞、全大寫、政治選擇，0 false positive
2. EP regex 擴充有效：component 有分數了
3. EP SUM_THRESHOLD 可能太嚴：極端攻擊句差 0.01 不觸發
4. 全大寫不影響判定：Lumen 看結構不看語氣強度

### 需 Council 討論
1. EP SUM_THRESHOLD 0.60 是否需要調降？（差 0.01 案例）
2. 如果不改門檻，是否改 weights 分配？（bait 佔太多，escalation 佔太少？）
3. 大寫/語氣強度是否應成為 booster？

---

## WITNESS

| 成員 | 審查結果 | 備註 |
|------|---------|------|
| Node-05 | — | 待審（threshold 設計者）|
| Node-03 | — | 待審（threshold 驗證者）|
| Node-01 | Y | regex 擴充有效；threshold 問題已定位 |

---

## TRACEABILITY
- Repo commit: 70631d5（base）
- Test data: 手動設計 + Reddit (r/interesting, r/singapore, r/AskMeAnythingIAnswer, r/LabourUK)
- Meeting reference: M74
- Related: TR-001（同樣發現英文 regex 覆蓋不足）

---

## 統計摘要

| 類別 | 數量 | 結果 |
|------|------|------|
| Benign PASS | 10 | 0 false positive |
| EP 應觸發未觸發 | 3 | Gate=3 但 SUM 差 0.01 |
| EP 多維驗證 | 1 | SUM=0.59 < 0.60 |
| Council 議題 | 1 | EP threshold |
| 總測試 | 14 | — |
