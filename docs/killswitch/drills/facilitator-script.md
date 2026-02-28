# Facilitator Script — Q1 Tabletop Drill

**Duration:** 120 minutes
**Owner:** Node-02-Bing
**Coordinator:** Node-01

## 00:00 Opening and Objectives (10 minutes)
- Welcome participants, state drill objectives: validate Kill-switch decision flow, notification chain, and initial technical failover.
- Confirm roles, communication channels, and recording method.
- Read the scenario summary and expected outputs.

## 00:10 Scenario Briefing (20 minutes)
- Present timeline: canary metrics, alerts, amplification signals, and sample logs.
- Walk through the canary report highlights and baseline references.
- Clarify decision points and available actions: warning, soft_failover, hard_failover.

## 00:30 Role Play Decision Phase (30 minutes)
- SRE reads validation findings and demonstrates metric computation.
- Owner presents recommended action and rationale.
- Legal gives quick assessment of jurisdictional or retention constraints.
- Chair calls for a decision and records vote; recorder captures decision record fields in real time.

## 01:00 Technical Validation and Execution Walkthrough (20 minutes)
- Tech Lead executes adapter fallback steps in staging or simulates failover actions.
- Verify log capture, data isolation, and access logging.
- Confirm that decision record and manifest are generated and stored.

## 01:20 Communications and External Messaging Drafting (20 minutes)
- Messaging owner drafts internal notify list and a safe external statement template.
- Confirm redaction rules and evidence_refs to include.
- Ensure access control for any Tier1 artifacts.

## 01:40 After Action Review and Close (20 minutes)
- Recorder reads AAR template and captures immediate action items with owners and due dates.
- Update CHARTER DoD `last_drill_date` and note any required DoD changes.
- Close drill and confirm next steps and publication of drill artifacts.

## Facilitator Prompts and Timing Cues
- Use concise prompts: "Validate metrics now", "Owner recommends action", "Legal input recorded", "Chair calls vote".
- Keep each decision window to 5 minutes; call time checks at 5 and 1 minute remaining.
- If technical execution cannot be run live, run a simulated checklist and mark as simulated in the decision record.
