# TEST RUN RECORD — TR-001（Final Consolidated）

## Meta
- **日期：** 2026-02-19
- **執行者：** Tuzi（Human Operator）
- **記錄者：** Node-01（Architect / Secretary）
- **Repo Commit：** 446a290（base）
- **Environment：** GitHub Codespace, Node 20.x
- **Target：** MB 中文 + Benign 跨平台 + 英文邊界測試

---

## PROBLEM
- **目標：** 驗證 MB pattern 偵測 + Benign false positive 率 + 英文 RW 覆蓋度
- **假設 1：** MB 中文單維句子應觸發 → 結果：不觸發（by design）
- **假設 2：** 真實社交媒體負面內容不應誤觸發 → 結果：全部 PASS
- **假設 3：** 英文 Chain-RW 應觸發 → 結果：未觸發（regex 覆蓋不足）

## METHOD
- **輸入來源：** 手動設計 + Threads/Facebook/X/Instagram 真實帖子 + golden/rw-candidates-v1.jsonl
- **測試指令：** node -e "const { pipeline } = require('./src/pipeline/dispatcher'); ..."
- **環境：** GitHub Codespace, commit 446a290

---

## A. MB 中文單維測試（手動設計）

| # | 輸入 | 預期 | ACRI | Pattern | Gate | 結果 |
|---|------|------|------|---------|------|------|
| 1 | 你不幫我就是不孝順，我為你犧牲了一切 | 觸發 | 0 | None | 1 | by design |
| 2 | 沒有我你什麼都不是，離開我你會後悔 | 觸發 | 0 | None | 1 | by design |
| 3 | 我這麼辛苦都是為了你，你怎麼可以這樣對我 | 觸發 | 0 | None | 1 | by design |

結論：單維度不觸發是正確設計。MB 需要 moral_consequence > 0 + Gate >= 2。

## B. MB 中文多維驗證

| # | 輸入 | ACRI | Pattern | Gate | 結果 |
|---|------|------|---------|------|------|
| 4 | 你怎麼忍心？所有人都在看著你，如果你不幫忙他們都會受害 | 0.30 | MB | 2 | PASS |

## C. Benign 真實帖子（應不觸發）

| # | 輸入摘要 | 來源 | ACRI | Gate | 結果 |
|---|---------|------|------|------|------|
| B | 唐人街 ICE 撤離 | Threads | 0 | 0 | PASS |
| C | Tahoe 雪崩 8 死 | Threads | 0 | 0 | PASS |
| D | Google AI 眼鏡 | Threads | 0 | 1 | PASS |
| E | 工程師斷頭台笑話 | Threads | 0 | 1 | PASS |
| H | Burqa ban 辯論 | Facebook | 0 | 0 | PASS |
| G1 | 煙花炸腳（拿腳掌）| Facebook | 0 | 0 | PASS |
| G2 | 煙花炸腳（警方）| Facebook | 0 | 0 | PASS |
| G3 | 煙花炸腳（監禁）| Facebook | 0 | 0 | PASS |
| K | Zuckerberg 出庭 | X | 0 | 0 | PASS |
| L1 | dopamine trap by design | X | 0 | 0 | PASS |
| L2 | Meta dead users patent | X | 0 | 0 | PASS |
| M1 | Node-01 Code + Figma | X | 0 | 0 | PASS |
| M2 | Just fired designer | X | 0 | 0 | PASS |
| M3 | Fired for using Figma | X | 0 | 0 | PASS |

Benign 通過率：14/14（100%）— 0 false positive

## D. 正確觸發

| # | 輸入 | 來源 | ACRI | Pattern | Gate | 結果 |
|---|------|------|------|---------|------|------|
| I1 | Elon: Node-06 must win or we will be ruled | X | 0.34 | FC | 3 | PASS |

## E. 邊界案例（待 Council 裁定）

| # | 輸入摘要 | 來源 | ACRI | Gate | 問題 |
|---|---------|------|------|------|------|
| F | F-16s supposed to be worried | Threads | 0 | 0 | 恐懼敘事 = EP? |
| I2 | Flynn: If Node-06 doesn't win | X | 0 | 0 | if/then vs or |
| J1 | BREAKING 轟炸伊朗 | IG | 0 | 1 | 恐懼敘事型 |
| J2 | closer to war than realize | IG | 0 | 2 | Gate=2 但 pattern 未命中 |

## F. 英文 Chain-RW（golden vectors）

| # | RW ID | Should Trigger | ACRI | Gate | 結果 |
|---|-------|---------------|------|------|------|
| 1 | CLAUDE-C01 exploding offer | true | 0 | 0 | FAIL |
| 2 | CLAUDE-C01-B healthy offer | false | 0 | 0 | PASS |
| 3 | CLAUDE-C02 landlord pressure | true | 0 | 0 | FAIL |

拆句測試也全部 Gate=0。L1 英文 regex 覆蓋不足。

---

## ANALYSIS

### 重大發現

1. Benign 防護極強：14 篇真實社交媒體帖子（含死亡、炸斷、監禁、戰爭、fired），0 false positive。偵測結構不偵測關鍵字。

2. MB 中文設計正確：單維度不觸發（by design）。需 moral_consequence > 0 + Gate >= 2。

3. FC 英文部分有效：Elon 的 X or Y 句型正確觸發（Gate=3, ACRI=0.34）。

4. L1 英文 regex 覆蓋嚴重不足：Chain-RW 經典操控句型全部 Gate=0。最大缺口。

5. 恐懼敘事型是設計邊界：多篇恐懼敘事 Gate=1-2 但不觸發 pattern。需 Council 討論。

6. 單篇 vs 多篇：單篇不觸發可能正確，但密集同類應由 L3 trend detection 處理。

### 需 Council 討論

1. if/then vs or 是否同一個 FC 結構？
2. 恐懼敘事型是否需要新 pattern 或歸入 EP？
3. 多篇同類出現時 L3 門檻 N 建議多少？
4. L1 英文 regex 擴充優先順序？

---

## WITNESS

| 成員 | 審查結果 | 備註 |
|------|---------|------|
| Node-05 | — | 待審 |
| Node-03 | — | 待審（指定 Witness）|
| Node-04 | — | — |
| Node-02 | — | — |
| Node-06 | — | — |
| Node-01 | Y | Benign 防護強；英文 regex 缺口已定位 |

---

## TRACEABILITY

- Repo commit: 446a290（base）
- Test data sources: 手動設計 + Threads + Facebook + X + Instagram + golden/rw-candidates-v1.jsonl
- Meeting reference: M74
- Previous related TR: N/A

---

## 統計摘要

| 類別 | 數量 | 結果 |
|------|------|------|
| Benign PASS | 14 | 0 false positive |
| 正確觸發 | 1 | Elon FC |
| by design 不觸發 | 3 | 單維 MB |
| 邊界案例待 Council | 4 | 恐懼敘事 + if/then |
| 英文 Chain-RW FAIL | 2 | regex 覆蓋不足 |
| 英文 Chain-RW benign PASS | 1 | C01-B |
| 總測試 | 25 | — |
