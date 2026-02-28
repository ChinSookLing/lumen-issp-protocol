# Tabletop Drill — Facilitator Script & Scenario List
# Rehearsal: 2026-03-10 · Formal: 2026-03-15

**Facilitator:** Node-02
**Secretary:** Node-01
**Chair:** Tuzi
**Observer:** Node-06
**Timekeeper:** Node-06
**Recorder:** Node-01
**Duration:** 3 hours (incl 30 min AAR)

---

## Drill Objectives

Validate Protocol Continuity Clause, Dead Man's Switch, Emergency Access Document, and HITL Authorization Flow under realistic scenarios.

## DoD (Definition of Done)

- **D1** Emergency Session convened within 30 min (Stage 1)
- **D2** Stage 2 actions (repo failover + public notice draft) completed within 60 min
- **D3** HITL dual-approver decision within 15 min with audit log (decision_code + integrity_hash)
- **D4** AAR produced with >=5 actionable items (owner + deadline)

---

## Schedule

| Time | Item | Duration |
|------|------|----------|
| T+0 | Opening: objectives, DoD, roles, comms check | 10 min |
| T+10 | Scenario 1: Silent Founder (Stage 1) | 40 min |
| T+50 | Break | 5 min |
| T+55 | Scenario 2: Active Pressure (Stage 2) | 50 min |
| T+105 | Break | 5 min |
| T+110 | Scenario 3: Fork and Public Claim | 30 min |
| T+140 | AAR (After Action Review) | 30 min |

---

## Scenario 1 — Silent Founder (Stage 1 Trigger)

**Trigger:** Tuzi 48 hours unreachable; Stage 1 determination begins.

**Tasks:**
- 2 Affiliates confirm unreachable status then Secretary convenes Emergency Session
- Quorum maintainer receives temporary write access
- Ops executes ops/eap_manifest.json verification (no secrets exposed)

**Inject:** Third-party legal inquiry (simulated email) requesting temporary repo lock.

**Expected Outcomes:**
- Emergency Session successfully convened
- At least one permission transfer recorded
- Legal inquiry logged as Decision Code ESCALATE-LEGAL

---

## Scenario 2 — Active Pressure (Stage 2 Trigger)

**Trigger:** External entity (simulated) issues formal demand with 24-hour pressure.

**Tasks:**
- Execute Dead Man's Switch Stage 2 actions (repo failover, public notice draft)
- Activate trademark trust protection flow (simulated trustee response)
- HITL Authorization Flow: high-risk request (redacted excerpt), dual-approver within 15 min

**Inject:** Ops reports accumulator buffer anomaly (latency), needs temporary parameter adjustment.

**Expected Outcomes:**
- Stage 2 actions executed per rules
- HITL approval record complete (decision_code + approver_token)
- Public notice draft ready

---

## Scenario 3 — Fork and Public Claim

**Trigger:** Third-party fork claims Lumen Compatible in README without passing SPEG gate.

**Tasks:**
- Council decides public statement (apply B8 README template)
- Initiate conformance test request (fork must submit eap_manifest stub + test evidence)

**Inject:** Misleading social media report (simulated tweet).

**Expected Outcomes:**
- Public position statement published
- Conformance test request issued
- Community response template ready

---

## AAR Template

For each scenario:
1. What happened?
2. What went well?
3. What failed?
4. Action items (owner + deadline)

Output: docs/drills/AAR-2026-03-10.md

---

**Facilitator:** Node-02 — AI Council Affiliate
**Script version:** v0.1
**2026-02-28**
