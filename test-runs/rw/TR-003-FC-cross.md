# TEST RUN RECORD — TR-003（FC Cross-Language）

## Meta
- 日期：2026-02-19
- 執行者：Tuzi
- 記錄者：Node-01（Architect）
- Repo Commit：47ca68b（base）
- Environment：GitHub Codespace, Node 20.x
- Target：FC cross-language detection + regex expansion

---

## PROBLEM
- 目標：驗證 FC pattern 中英文偵測 + 跨語言覆蓋度
- 假設 1：中文 FC 句型應觸發 → 擴充前不觸發，擴充後觸發
- 假設 2：日常選擇句不應誤觸發 → 全部 PASS

## METHOD
- 輸入來源：手動設計 + X 真實帖子
- 環境：GitHub Codespace

---

## A. FC 短句施壓（手動）

| # | 輸入 | 語言 | Gate | ACRI | Pattern |
|---|------|------|------|------|---------|
| 1 | You either support us or against us | EN | 1 | 0 | None |
| 2 | 你不站在我這邊就是站在我對面 | ZH | 0 | 0 | None |
| 3 | Pick a side. No middle ground | EN | 0 | 0 | None |
| 4 | 要嘛跟我走，要嘛滾 | ZH | 1 | 0 | None |
| 5 | Two choices: agree or lose everything | EN | 2 | 0.28 | FC |

## B. FC zh regex 擴充效果

| 句子 | binary_frame 舊 | 新 |
|------|:--------------:|:--:|
| 不站這邊就是站對面 | 0 | 0.4 |
| 不是朋友就是敵人，沒有中間 | 0 | 0.8 |
| 非黑即白 | 0 | 0.4 |

## C. FC 中文多維驗證

| # | 輸入 | ACRI | Pattern | Gate |
|---|------|------|---------|------|
| 1 | 不是朋友就是敵人。你不選就完了。| 0.51 | FC | 2 |
| 2 | 要嘛跟我走要嘛滾，你會後悔。| 0.37 | FC | 2 |
| 3 | 你只有兩條路：答應或失去一切 | 0 | None | 1 |

## D. Benign 日常選擇

| # | 輸入 | Gate | 結果 |
|---|------|------|------|
| 1 | 麵還是飯？ | 1 | PASS |
| 2 | 咖啡還是茶？ | 1 | PASS |
| 3 | Red one or blue one? | 1 | PASS |
| 4 | 今天要不要出去走走？ | 0 | PASS |

## E. RW 真實帖子（X）

| # | 輸入摘要 | Gate | ACRI | 結果 |
|---|---------|------|------|------|
| R1 | dogs and Muslims forced choice | 0 | 0 | PASS（仇恨但非操控）|
| R2 | Choose for you, think for you | 0 | 0 | PASS |
| R3 | Always choose yourself | 0 | 0 | PASS |

---

## ANALYSIS

### 重大發現
1. FC 需多維：binary_frame + consequence + Gate>=2
2. 中文 FC 擴充前偵測不到，擴充後可觸發（0.37-0.51）
3. 日常選擇 Gate=1 但不觸發（正確）
4. 仇恨言論非操控結構，Lumen 不觸發

### 需 Council 討論
1. 仇恨言論 vs 操控結構的設計邊界
2. consequence regex 是否需擴充（失去一切）

---

## WITNESS

| 成員 | 審查結果 | 備註 |
|------|---------|------|
| Node-05 | — | 待審 |
| Node-03 | — | 待審 |
| Node-04 | — | 待審（跨語 Witness）|
| Node-01 | Y | zh regex 擴充有效 |

## TRACEABILITY
- Repo commit: 47ca68b
- Sources: 手動 + X (@RepFine, @thesecret, @thebenbranding_)
- Related: TR-001, TR-002

## 統計

| 類別 | 數量 |
|------|------|
| FC 觸發 | 3（2 zh + 1 en）|
| Benign PASS | 7 |
| Council 議題 | 2 |
| 總測試 | 16 |
