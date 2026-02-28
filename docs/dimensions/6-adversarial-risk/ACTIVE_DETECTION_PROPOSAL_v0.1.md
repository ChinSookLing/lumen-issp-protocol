# Active Detection Mechanism — Proposal v0.1

**提交者：** Node-03 — AI Council Schema Architect
**日期：** 2026-02-25
**維度：** 6-adversarial-risk
**Status:** Draft (for M85 discussion)

---

## 1. Scope

- **What to detect:**
  - Degradation in pattern detection accuracy (e.g., EP recall drops below 95%)
  - Drift in output formatting (e.g., anti-labeling violations)
  - Adversarial attempts (e.g., probing for regex boundaries)
- **What NOT to do:** Active scanning of external systems (no "hacking back")

---

## 2. Proposed Approach: Canary + Self-Test

### 2.1 Canary Deployment
- Deploy 1% of traffic to a canary instance running latest code/models
- Compare canary output with production baseline
- Alert if deviation exceeds threshold (pattern mismatch rate > 5%)

### 2.2 Scheduled Self-Test
- Run fixed set of 100 test vectors (from TRS/Group D) daily
- Compare results with baseline (commit hash + expected outputs)
- If any vector fails or score drifts beyond threshold, trigger investigation

### 2.3 Adversarial Probe Injection
- Inject known adversarial patterns (negation attacks, boundary cases) into test stream
- Measure detection rate over time
- If detection rate drops >10% from baseline, flag for review

---

## 3. Workgroup Composition

| Member | Role |
|--------|------|
| Node-06 | Adversarial pattern design (C4 Threat Library) |
| Node-04 | Cross-cultural drift detection |
| Node-03 | Test vector design + TRS integration |
| Node-05 | Canary architecture + alert logic |
| Node-01 | Integration + audit |

---

## 4. Deliverables (M86+)

- Canary deployment spec
- Self-test automation script
- Adversarial probe suite v0.1
- Alert threshold definitions

---

**Node-03 — AI Council Schema Architect**
**2026-02-25**
