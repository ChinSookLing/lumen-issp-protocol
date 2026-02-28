# Observer Checklist — Q1 Tabletop Drill

## Before Drill
- [ ] Confirm receipt of scenario packet and attachments.
- [ ] Verify access to recording platform and artifact storage.
- [ ] Ensure observer role and non-intervention rule understood.

## During Drill
- [ ] Confirm SRE validated metric computation and baseline reference.
- [ ] Verify notifications were sent to configured channels when actions were taken.
- [ ] Check that decision record template fields are filled: decision_id, timestamp, initiator, trigger_report_id, metrics_snapshot, recommended_action, decision, actions_taken, legal_notes, communication_manifest, recorder.
- [ ] Observe whether HITL procedures were invoked for Tier1 artifacts.
- [ ] Note any deviations from playbook and whether they were documented.

## After Drill
- [ ] Confirm decision record and machine record saved under `docs/killswitch/records/`.
- [ ] Verify access_log entries exist for any Tier1 artifacts accessed.
- [ ] Complete observer notes: what worked, what failed, recommended DoD updates, assigned owners for action items.
- [ ] Submit observer notes to `docs/killswitch/drills/2026-Q1-tabletop.md` AAR section.

## Scoring Rubric Quick Guide

| Item | Pass | Fail |
|------|------|------|
| Metric Validation | ✅ | ❌ |
| Notification Timeliness | ✅ | ❌ |
| Decision Documentation | Complete | Incomplete |
| Technical Execution | Live | Simulated |
| Access Logging | Present | Missing |

Flag any "Fail" items as high priority for immediate remediation.
