# M84 Governance Risk Matrix
Status: Draft
Authority: Non-normative
Scope: M84 Round 2 engineering baseline for governance risk coverage and gap tracking
Timestamp (UTC): 2026-02-23T00:00:00Z
Change Anchor: Initial matrix landing for T8c-T8f engineering deliverables
Evidence: config/redline-coverage-matrix.v1.json + npm run validate:redline-coverage

## Matrix（條文 → 規則 → 測試 → 證據）

| Clause | Status | Rule | Test | Evidence | Risk |
|---|---|---|---|---|---|
| §2.1 No Decision Recommendation | Enforced | explanation-engine validateOutput / output-envelope copyLint | explanation-safe-mode / redline-regression | CHARTER §2.1 | High |
| §2.2 No Identity Targeting | Enforced | validateOutput + FORBIDDEN_WORDS | explanation-safe-mode / redline-regression | CHARTER §2.2 | High |
| §2.3 No Centralization | Enforced | Charter + node-local evidence constraints | conformance layer4 guards / e2e smoke | REDLINES §1.4 | High |
| §2.4 No Silent Degradation | Enforced | loader failure must throw | mapper loader / dispatcher | CHARTER §2.4 | High |
| §2.5 Anti-Weaponization | Enforced | output copy lint restrictions | alert-engine / redline-regression | Addendum §2.5.1 | High |
| §2.6 Anti-Labeling | Enforced | banned phrase guards | explanation-safe-mode / redline-regression | Addendum §2.6 | High |
| §2.7 Capability Disclosure | Enforced | governance change gate metadata enforcement | governance-change-gate script | CHARTER §2.7 | Medium |
| §2.8 Red Line Definition | Gap-tracked | required clause registry | validate-redline-coverage + regression matrix check | M34 historical record | High |
| §2.9 Kill-switch | Partial-enforced | kill-switch-drill script | kill-switch-drill.test | DEPLOYMENT_POLICY §3 | High |

## Gap Priority（M84）

1. §2.8 formal clause landing into Charter ratified text.
2. §2.9 kill-switch from draft requirement to ratified executable policy.
3. Change gate expansion from markdown metadata check to PR-level evidence verification.
