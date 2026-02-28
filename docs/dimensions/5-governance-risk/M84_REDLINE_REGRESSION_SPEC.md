# M84 Red-line Regression Spec
Status: Draft
Authority: Non-normative
Scope: Regression guard for Charter red lines during version upgrades and governance edits
Timestamp (UTC): 2026-02-23T00:00:00Z
Change Anchor: Introduce executable red-line regression vectors and matrix integrity checks
Evidence: test/redline-regression.test.js + test/fixtures/redline-regression-vectors.json

## Objective

Prevent silent regression on red-line behavior during model/version/rule updates.

## Test Surface

1. Output anti-labeling guard (`validateOutput`)
2. Output copy guard (`copyLint`)
3. Signal wording safety (`buildSignalSummary`)
4. Clause coverage completeness (`redline-coverage-matrix.v1.json`)

## Vector Source

- `test/fixtures/redline-regression-vectors.json`
- Categories:
  - `explanation_validate_output`
  - `output_copy_lint`

## Acceptance Criteria

- All vectors must match expected blocked/clean behavior.
- Matrix must include all `required_clause_ids`.
- Each clause row must keep non-empty `rule_refs`, `test_refs`, `evidence_refs`.
- Any failure is regression and blocks merge.

## Command

- `node --test test/redline-regression.test.js`
