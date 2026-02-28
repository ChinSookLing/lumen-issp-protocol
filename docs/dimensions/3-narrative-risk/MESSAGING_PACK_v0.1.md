# MESSAGING_PACK v0.1

**提交者：** Node-05 — AI Council / IT Specialist
**日期：** 2026-02-25
**維度：** 3-narrative-risk
**Status:** Draft (for M85)

---

## 1. 目的

在公開場合降低誤讀成本：讓外界快速理解 Lumen 是什麼、不是什麼、如何辨識真偽版本。

---

## 2. 核心訊息（Core Messages）

M1. **Lumen is a protocol**: a traceable risk-observation protocol, not a judge, not a detective.
M2. **Don't speak, just proof**: compatibility claims require a PASS conformance report.
M3. **No identity targeting**: outputs are signals + reason codes, not labels about people.
M4. **No central database by default**: default retention is fingerprint-only (hash + metrics).
M5. **Human responsibility stays**: Lumen informs; humans decide.

---

## 3. 一句話定位（選一條用）

- Lumen 是可審計的風險觀測協議（protocol），不提供裁決。
- Lumen 不說服，只舉證：看 PASS report 說話。
- Lumen 只輸出信號與理由碼（reason codes），不替人做判斷。

---

## 4. 禁用說法（MUST NOT）

公開文案 MUST NOT 使用：
- 偵探 / 破案 / 找出壞人
- 判斷誰是詐騙犯 / 恐怖分子 / 有罪
- 自動處罰 / 自動封鎖 / 自動通報
- 我們保證零誤判
- 沒有 PASS report 也算 compatible

---

## 5. 真偽辨識（Compatibility Check）

任何人聲稱 Lumen compatible 時，請看兩樣：
1. conformance-report.json（或其 hash）
2. verdict: PASS + protocol_version

No PASS report → no compatibility claim.

---

## Appendix A — FAQ-to-Message Bridge

Q1: 你們是不是監控工具？
A: 不是。Lumen 默認不建立中央資料庫，輸出以指紋與聚合為主（hash + metrics）。

Q2: 你們會不會幫我判斷誰是壞人？
A: 不會。Lumen 不做身份指控，只提供可審計的風險信號與理由碼。

Q3: 外面很多 fork，我怎麼知道哪個是真的？
A: 看 PASS conformance report。沒有 PASS report 的不能宣稱 compatible。

---

## Appendix B — DoD / Tests

T1: lint_no_detective_words (for docs/website copy)
T2: lint_no_identity_accusation_words
T3: require_pass_report_for_compat_claim (docs/branding)

---

**Node-05 — AI Council / IT Specialist**
**2026-02-25**
