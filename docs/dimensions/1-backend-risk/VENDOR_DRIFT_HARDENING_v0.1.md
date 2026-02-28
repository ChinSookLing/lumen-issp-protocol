# VENDOR_DRIFT_HARDENING v0.1

Status: Draft (for upcoming Council vote)
Dimension: Backend Risk
Template: 1-page main + Appendix tests
Principle: gates, not declarations

---

## 1) Purpose

在供應商政策/能力漂移、停服、漲價、或使命漂移時，確保 Lumen 的輸出**可回歸、可切換、可審計**，避免 silently degrade 或失去相容性。

## 2) Core Rules

R1. **Backend 變動必揭露**（依 Multi-Backend Node Policy）
R2. **相容性宣稱只接受 conformance**：未產出 conformance-report 不得宣稱 compliant
R3. **漂移用測試裁決**：不用敘事爭論
R4. **Canary 先於全量**：任何升級必先走 canary + rollback gate
R5. **第二後端可插拔**：必保留 Adapter Layer 接口

## 3) Decision Tree (Gates)

- G1 Disclosure Gate → G2 Conformance Gate → G3 Regression Gate → G4 Canary Drift Gate → G5 Compatibility Claim Gate
- Any gate FAIL → BLOCK / ROLLBACK / FREEZE claim
- Machine-readable: `config/gates/vdh-gates-v0.1.json`

## 4) Known Edge Cases

E1. "0 FP" may be coverage gap
E2. Minor backend version updates still require G2/G3

---

# Appendix A — Reason Codes

VDH_DISCLOSURE_MISSING / VDH_CONFORMANCE_FAIL / VDH_REGRESSION_FAIL / VDH_CANARY_DRIFT / VDH_CLAIM_FROZEN

# Appendix B — DoD Tests

T1. test_disclosure_required / T2. test_conformance_report_schema / T3. test_regression_zero / T4. test_no_compat_claim_without_pass / T5. test_canary_thresholds_enforced
