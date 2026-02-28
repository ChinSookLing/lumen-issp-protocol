# ROADMAP.md v0.1

**Formatted:** Node-01 (Architect / Secretary)
**Source:** Node-02 (AI Council / PR Specialist)
**Ratified:** M73 — pending

---

## Current Status（當前狀態）

| Layer | Status | Completion |
|-------|--------|------------|
| Layer 1 | ✅ Stable | ~95% |
| Layer 2a | ✅ Stable | ~85% |
| Layer 2b/2c | ❌ Deferred | 0% |
| Layer 3 | 🟡 MVP | ~30% |
| Layer 4 | ✅ MVP + Guards | ~70% |

---

## Layer 2b/2c Trigger Conditions

Layer 2b/2c (OTA / V2X / Gibberlink) are deferred until **all** of the following triggers are met:

1. **Governance Trigger**: CHARTER.md ratification completed and COMPATIBILITY/NAMING/TRADEMARKS/RESPONSIBILITY v0.1 accepted by Council.
2. **Safety Trigger**: AGENT_BEHAVIOR test suite and explanation_safe_mode tests pass in CI for at least 3 consecutive releases (no regressions).
3. **Operational Trigger**: At least two independent, verified production deployments of Lumen core (Layer 1–4) operating for ≥30 days without Silent Degradation incidents.
4. **Resource Trigger**: Dedicated engineering and compliance budget allocated and at least one legal review completed for jurisdictional deployment risks.
5. **Community Trigger**: A public compatibility registry and malicious-nodes draft workflow are in place and tested in staging.

When all triggers are satisfied, Council will schedule a formal proposal (RFC) for Layer 2b/2c initiation. Partial satisfaction of triggers may permit limited research pilots under `sandbox` operator_mode with explicit disclosure.

---

## Next Milestones（下一個里程碑）

- [ ] CHARTER.md 正式格式化（Governance Trigger #1 部分）
- [ ] explanation_safe_mode 測試矩陣完成（Safety Trigger #2）
- [ ] End-to-end integration：forecast-engine → alert-engine
- [ ] Layer 2b/2c RFC（待五個 Trigger 全部達成）
