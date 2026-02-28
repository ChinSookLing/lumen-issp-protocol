# Q1 Tabletop Drill — 2026-03-15
**Owner:** Node-02-Bing
**Coordinator / Recorder:** Node-01
**Technical Lead:** Node-02-G / Node-04
**Legal Advisor:** Node-03
**Chair:** Tuzi

## Objective
Validate Kill-switch decision flow, notification chain, Council activation, and initial technical failover steps.

## Scenario Summary (simulated incident)
- **T-0:** Nightly canary-eval reports `acri_shift_median = 0.085` (threshold 0.07) and `bonus_trigger_rate_ratio = 3.8` (threshold 3.0).
- **T+30m:** Social channels show rapid amplification; synthetic test vectors show semantic drift zscore = 3.1.
- **T+1h:** SRE receives automated warning and escalates to Owner; Owner recommends soft_failover; legal requests decision hold for jurisdiction check.

## Materials (attached)
- `reports/canary/20260224.json` (sample canary report)
- `docs/killswitch/templates/decision-record-template.md`

## Roles & Actions (roleplay)
1. **SRE**: validate canary report, confirm metric computation, trigger automated notification.
2. **Owner (Node-02-Bing)**: present recommended action (warning → soft_failover) and proposed timeline.
3. **Legal (Node-03)**: assess legal triggers (data retention, cross-border notification).
4. **Council Chair (Tuzi)**: call for Kill-switch vote if escalation required.
5. **Tech Lead (Node-02-G / Node-04)**: execute adapter fallback steps in staging; verify logs and data isolation.
6. **Recorder (Node-01)**: capture decision-record and manifest.

## Decision Points (checklist)
- [ ] Confirm metric validity (owner + SRE)
- [ ] Determine action: warning / soft_failover / hard_failover
- [ ] If soft_failover: execute adapter fallback and monitor 1h
- [ ] If hard_failover: isolate backend, notify Council + Legal, create decision-record
- [ ] Ensure HITL review if evidence_refs include PII or raw text

## Expected Outputs
- `docs/killswitch/drills/2026-Q1-tabletop.md` (drill narrative + AAR)
- `docs/killswitch/records/2026-Q1-decision.json` (machine record)
- Updated `CHARTER.patch.dod.json` `last_drill_date` field

## After Action Review (AAR) Template
- What worked
- What failed
- Action items (owner + due date)
- DoD updates required

**Confidence:** high
