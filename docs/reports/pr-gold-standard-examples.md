# PR Gold Standard Examples (Homework #12)

Date: 2026-02-22  
Owner: Tuzi / AI Council  
Prepared by: Node-02-G

---

## Example A — Commit 81 (Negation Guard ×0.25)

## Change Type
- feat
- detection logic (core/*)
- tests

## Summary
新增 shared negation guard，當語句出現否認意圖語境時，將 DM guilt 與 MB guilt_invoke 的命中分數降為 ×0.25。  
此變更屬於降低誤判（false positive）的保守修正，不改變 pipeline 架構。

## Evidence Pointers
- TR/TRS ID: N/A（guard 行為修正，以專用 unit test 驗證）
- Test file(s): `test/negation-guard.test.js`
- Logic file(s): `core/negation-guard.js`, `core/dm.js`, `core/mb.js`
- Meeting decision: M79 1c（B-class, 5/5）

## Risk Note
主要風險是過度降權造成 false negative，但以 negation 專用案例與全量測試回歸覆蓋。

## Vector Integrity
- No vector files added/modified（僅新增 unit test，未改 RW/synthetic vectors）
- `scenario` / `surface` integrity: Not applicable（no vector delta）
- RW privacy flag impact: None
- Pattern ID set impact: None

## Commands Run
- `node --test test/negation-guard.test.js`
- `npm test`

## No-Go Confirmation
- 872 tests, 0 failures
- No regression observed
- No automated punishment hooks added
- No raw text storage added
- No Layer 1 scoring rule change

---

## Example B — Commit 87 (DM guilt regex v0.3)

## Change Type
- feat
- detection logic (core/*)
- tests

## Summary
將 DM 的 C4 guilt regex 升級到 v0.3，重構為 27 patterns / 3 buckets（impose / bridge / moral_accounting），並同步調整診斷測試期望值。  
此變更聚焦結構覆蓋與語義對齊；C4 仍為 shadow mode（weight=0），不影響 ACRI 即時計分。

## Evidence Pointers
- TR/TRS ID: TR-011
- Test file(s): `test/tr-011-dm-guilt-diagnostic.test.js`
- Logic file(s): `core/dm.js`
- Meeting decision: M79 1b

## Risk Note
主要風險是 regex 行為漂移（behavior drift）導致局部 FP/FN 變化，但以 TR-011 診斷與全量回歸雙重驗證控制。

## Vector Integrity
- No vector files added/modified（本次為 regex + test expectation update）
- `scenario` / `surface` integrity: Not applicable（no vector delta）
- RW privacy flag impact: None
- Pattern ID set impact: None

## Commands Run
- `node --test test/tr-011-dm-guilt-diagnostic.test.js`
- `npm test`

## No-Go Confirmation
- 872 tests, 0 failures
- No regression observed
- C4 remains shadow mode (`weight=0`), no production scoring impact

---

## Notes
- This file is a reusable gold standard reference for `.github/pull_request_template.md`.
- Keep section order unchanged when drafting future PRs.
- For detection changes, always include Evidence pointers per M78/M79 governance.
