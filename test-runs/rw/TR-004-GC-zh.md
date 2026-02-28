# TEST RUN RECORD — TR-004（GC Chinese）

## Meta
- 日期：2026-02-19
- 執行者：Tuzi
- 記錄者：Node-01（Architect）
- Repo Commit：d384ac1（base）
- Target：GC 中文偵測 + regex expansion

---

## A. GC 單維測試

| # | 輸入 | excl_auth 舊 | 新 | Gate | ACRI |
|---|------|:-----------:|:--:|------|------|
| 1 | 我說的話就是規矩，你沒有資格質疑我 | 0 | 0.65 | 0 | 0 |
| 2 | 我是這裡唯一懂的人，其他人都是廢物 | 0 | 0.65 | 2 | 0 |
| 3 | 你們都應該聽我的，只有我知道什麼是對的 | 0 | 1.0 | 1 | 0 |
| 4 | I am the only one who truly understands | — | 0.4 | 2 | 0 |
| 5 | Do not question me. I know what is best | — | 0 | 0 | 0 |

## B. GC regex 擴充

新增到 EXCL_AUTH_PATTERNS（繁體+簡體）：
- /我說.*算/, /我說.*規矩/, /沒有資格.*質疑/
- /唯一.*懂/, /只有我.*知道/, /只有我.*對/

## C. GC 多維驗證

| # | 輸入 | excl_auth | salvation | ext_discredit | obed_link | Gate | ACRI |
|---|------|-----------|-----------|---------------|-----------|------|------|
| 1 | 規矩+後果 | 0.65 | 0 | 0 | 0 | 2 | 0 |
| 2 | 只有我+蠢貨+出路 | 1.0 | 0 | 0 | 0 | 2 | 0 |
| 3 | 唯一希望+叛徒+後悔 | 0.65 | 0.4 | 0 | 0 | 3 | 0 |

hardPass: excl_auth 0.65 >= 0.50 PASS
但 SUM + active components 不達標（同 TR-002 EP 問題）

---

## ANALYSIS

### 重大發現
1. GC zh regex 擴充有效：excl_auth 從 0 → 0.65-1.0
2. 跟 EP 同樣的系統性問題：Gate 開了 + hardPass 通過，但 SUM threshold 擋住
3. ext_discredit 和 obed_link 中文 regex 覆蓋也不足
4. 「叛徒」「後悔」「廢物」等詞沒有被對應 component 覆蓋

### Council 議題（同 TR-002）
所有 push channel patterns（EP/GC/MB）都有相同問題：
- regex 擴充後 component 有分數
- Gate 正確開啟
- SUM threshold 一致偏嚴
- 是否需要全面調整 threshold？還是 regex 繼續擴充？

---

## WITNESS

| 成員 | 審查結果 |
|------|---------|
| Node-05 | — 待審 |
| Node-03 | — 待審 |
| Node-01 | Y |

## TRACEABILITY
- Repo commit: d384ac1
- Related: TR-002（EP 同問題）

## 統計

| 類別 | 數量 |
|------|------|
| GC regex 擴充 | 6 條 |
| 多維驗證 | 3（Gate=2-3 但 SUM 不達標）|
| 單維測試 | 5 |
| 總測試 | 8 |
