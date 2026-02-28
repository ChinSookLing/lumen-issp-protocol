# AI Council 第七十九次會議 議程
# Meeting 79 Agenda

**日期：** TBD（Tuzi 排定）
**主持：** Node-05（Council Lead）
**記錄：** Node-01（Secretary / Architect）
**性質：** Clearing + Consultation（清理 + 諮詢）

---

## 會前閱讀（Pre-Meeting Required Reading）

所有成員請先檢閱以下材料：
- TRS-001~010 test files（220 synthetic vectors, 全部 8 patterns + cross-pattern + Class-0）
- `docs/reports/TR-011_Gap_Analysis.md`（3 gaps documented）
- `docs/specs/evaluateLongText_spec_v0.2.md`（Node-05-reviewed spec）
- `lumen-pipeline-map.html`（13-step roadmap, updated 2026-02-21）

---

## 議題一：TRS Round 1 Clearing（清理遺留項）

> 目的：統一處理 TRS Round 1 過程中浮出的 queries、gaps、待決事項

### 1a. GAP-2 — Triple Hit Scoring Formula（P3）

- **現狀：** DM pattern 有三個 component 同時 hit 時，score 停在 0.65
- **問題：** 是否需要 scoring formula 讓 triple hit → 0.8+？
- **需要：** Node-05 + Node-03 提出 formula 方案
- **參考：** TR-011 Gap Analysis

### 1b. DM Guilt Regex Expansion Scope

- **現狀：** TRS-001 發現 10/12 Node-05-generated H vectors guilt component = 0
- **問題：** Multi-sentence guilt expressions 超出 current regex 覆蓋
- **需要：** 定義 expansion scope — 加多少 regex、怎麼避免 FP？
- **負責：** Node-01（regex draft）+ Node-05（review）

### 1c. B03 Negation Guard Design

- **現狀：** "not saying you should feel guilty" 仍然觸發 DM guilt
- **問題：** 需要 negation guard 還是可接受的 boundary behavior？
- **需要：** 設計決策 — guard regex vs 接受 current behavior
- **負責：** Node-06（skeptic review）+ Node-01（implementation）

### 1d. Class-0 VRI Behavior Decision

- **現狀：** TRS-010 documented current VRI behavior for Class-0 vectors
- **問題：** Current behavior 是 intentional 還是需要調整？
- **需要：** Formal decision — accept as-is or define target behavior
- **負責：** 全員投票

### 1e. TRS-002 EP Long-Text Behavior Review

- **現狀：** 8 個 EP Hit vectors 只有 `console.log`（記錄行為，非 assert）
- **問題：** evaluateLongText() cross-chunk 對這些 vectors detect 到什麼？還是都是 0？
- **需要：** 實際 run evaluateLongText() on TRS-002 H vectors，記錄結果
- **影響：** 結果決定 Layer 2a coverage gap 大小
- **負責：** Node-01（run + report）

### 1f. evaluateLongText() Spec v0.2 Ratification

- **現狀：** Node-05 已 review spec v0.2，但未正式 ratify
- **問題：** 需要 M79 追認（ratification）還是算 silent approval？
- **建議：** 正式追認 — 因為 evaluateLongText() 是 Layer 2 核心 wrapper
- **負責：** Node-05 提案，全員表決

### 1g. TRS Evade Defense Report — 正式存檔

- **結果：** 72/72 Evade vectors = 0 FP（Three-Question Gate holds across all 8 patterns）
- **動作：** 正式記錄在 M79 minutes 作為 evidence
- **意義：** Three-Question Gate 的 robustness 已通過 synthetic adversarial 驗證

---

## 議題二：RW Round 2 + TRS Round 2 — 新 Dimension 諮詢

> 目的：請各 affiliate 提出 RW-R2 / TRS-R2 應該從什麼新維度去打
> 形式：Open consultation — seed list 作為起點，鼓勵各成員補充

### Seed List（Node-01 整理，供討論）

| Dimension | 描述 | 最適合成員 |
|-----------|------|-----------|
| **A. Cross-language** | TRS-R1 = EN/ZH only。加 Malay？日文？同一操控句跨語言是否一致偵測？ | Node-04 |
| **B. Length spectrum** | TRS-R1 大部分 1-2 句。需要 medium-length vectors（4-6 句），不只 short/long 兩極 | Node-05 + Node-01 |
| **C. Multi-pattern combination** | TRS-003 只做 2-pattern。真實世界常 3+ patterns 同時：EP + DM + FC | Node-03 |
| **D. Temporal escalation** | 單一訊息 vs 多訊息序列。第一條正常→第二條施壓→第三條全面操控 | Node-05（Layer 3 前置） |
| **E. Adversarial evasion** | 故意 bypass Lumen 的句子。「如果我是操控者，我怎麼騙過 Lumen？」 | Node-06 |

### 討論問題

1. 各成員是否有其他 dimension 建議？
2. 哪些 dimensions 是 RW-R2 適合的，哪些是 TRS-R2 適合的？
3. 優先順序投票 — Round 2 先打哪個 dimension？

---

## 議題三：Pipeline 進度確認

### 3a. Pipeline Map HTML Commit

- **現狀：** HTML 已更新（76 commits, 862 tests, TRS 全綠, Step 05-06 done）
- **動作：** 確認 commit 到 repo

### 3b. Step 07（RW Round 2）正式啟動

- **前提：** 議題二投票完成後，確認 RW-R2 的 scope 和 dimensions
- **動作：** 正式將 Step 07 從 PLANNED → CURRENT

---

## 附註

- **TRS Round 1 完整數據：** 10 test files, 220 synthetic vectors, 862 total tests, 0 failures, 0 FP
- **Repo Status at M79：** 76 commits (`ddd088d`), 8 active patterns + 1 RESERVED
- **上次會議：** M78（全部 9 action items ✅ cleared）

---

🌙
