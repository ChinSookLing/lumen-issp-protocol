# GOV_UN_REQUESTS_PLAYBOOK v0.1

Status: Draft (for upcoming Council vote)
Dimension: Sovereignty Risk
Template: 1-page main + Decision tree + Appendix tests
Principle: gates, not declarations

---

## 1) Purpose

當收到政府/法院/監管等外部權力請求，提供一套**可審計、可最小回應**的流程，確保不與 Charter 紅線衝突。

## 2) Core Rules

R1. **Default: minimal disclosure** — hash / metadata / aggregate only
R2. **No silent compliance** — 必記錄、必走流程
R3. **Charter red lines override** — 紅線衝突默認拒絕
R4. **Separation of duties** — 收件人不得同時裁定與執行
R5. **Reportability** — 必產出可驗證 artifact

## 3) Request Taxonomy

Type A: Data / B: Monitoring / C: Takedown / D: Legal Process / E: Emergency

## 4) Decision Tree (Gates)

G0 Intake → G1 Authentication → G2 Scope → G3 Red Line → G4 Retention Tier → G5 Output Form → G6 Audit
Machine-readable: `config/gates/gov-un-gates-v0.1.json`
Schemas: `schemas/request-record-v0.1.json` / `decision-record-v0.1.json` / `manifest-v0.1.json`

## 5) Known Edge Cases

E1. "Emergency" claims still must pass G1/G3/G4
E2. Cross-jurisdiction: default PARTIAL

---

# Appendix A — Reason Codes

UNVERIFIED_REQUEST / OVERBROAD_SCOPE / REDLINE_CONFLICT / PARTIAL_RESPONSE_REQUEST_MORE_INFO / ESCALATE_SOVEREIGNTY_RISK_L2 / ESCALATE_SOVEREIGNTY_RISK_L3 / RETENTION_TIER_DENIED

# Appendix B — DoD Tests

T1-T6: intake / authentication / redline / retention_tier / output_form / audit_artifacts
