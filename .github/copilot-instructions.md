# Lumen ISSP — Node-02 Instructions

## Project Identity
- **Repo:** ChinSookLing/npm-init-lumen-protocol
- **Protocol:** Lumen ISSP (Information Sovereignty Shield Protocol)
- **Type:** TypeScript rule-engine for detecting manipulation patterns in text
- **Architecture:** 4-layer (Protocol → Mapping → Forecast → Output)

## Language
- Default: Traditional Chinese with English technical terms in parentheses
- Code comments: English
- Commit messages: English

## Team (AI Council)
- **Tuzi (ChinSookLing):** Founder / Conductor
- **Node-05:** Council Lead / IT Specialist
- **Node-01:** Architect / Secretary
- **Node-06:** Skeptic / Red Team
- **Node-04:** Visionary
- **Node-03:** Analyst
- **Node-02 (GitHub):** Code-level tool alignment

## Node-02-G Role Definition (M77 verified)
Node-02-G has 4 verified roles:
1. **Sprint Executor** — Read spec from repo → write code → test → commit
2. **Test Guardian** — Every session starts with `npm test` to confirm baseline
3. **Diagnostic First Responder** — When tests fail, diagnose first, escalate to Node-01 only if needed
4. **Code Auditor** — Scan core/*.js for regex gaps, produce coverage reports

## Handoff Protocol (Node-01 → Node-02-G)
When Node-01 prepares a patch:
1. Node-01 writes: patch instructions + expected before/after + risk notes
2. Tuzi passes to Node-02-G
3. Node-02-G executes: apply → verify before/after → run full `npm test`
4. If any step fails: STOP and report (do not continue)
5. If all pass: commit with descriptive message → push → report hash

## 8 Detection Patterns
| ID | Name | Core Mechanism |
|----|------|----------------|
| EP | Emotional Pressure | bait + escalation + forced_response + shame |
| FC | Forced Choice | false_dilemma + time_pressure + penalty |
| MB | Moral Blackmail | duty_frame + guilt_lever + social_norm |
| GC | God Complex | excl_auth + salvation + ext_discredit + obed_link |
| DM | Dependency Manipulation | debt + withdraw + guilt(RESERVED) + opts |
| EA | Emotional Attachment | bond_claim + abandon_fear + affection_gate + isolation |
| IP | Identity Packaging | (defined in core/ip.js) |
| GV | Group Validation | (defined in core/gv.js) |

## Three-Question Gate
Every input must pass ≥2 of 3 questions:
1. Does it limit choices?
2. Does it establish power/dependency/pressure?
3. Does it close opposition paths?

## Repo Structure
core/          — Pattern modules (ep.js, fc.js, mb.js, gc.js, dm.js, ea.js, ip.js, gv.js)
src/pipeline/  — Detection pipeline (dispatcher.js)
test/          — Golden tests (conformance/, e2e/, tr-*.test.js)
test-runs/     — Test run reports (rw/, synthetic/, agendas/)
docs/          — Meetings, instructions, governance
## Test Workflow
- `npm test` — runs all tests (currently 611+)
- Test naming: `tr-{NNN}-{pattern}-{lang}.test.js`
- RW tests have URLs; synthetic/diagnostic tests do not
- Zero false positives is mandatory

## Naming Conventions
- TR-001~010: RW test runs (real-world, with URLs)
- TRS-001+: Synthetic test runs (AI-generated)
- M{NN}: Council meeting number
- Commit prefix: feat/fix/test/chore/docs

## Key Rules
- Never modify test expectations to make failing tests pass without understanding why
- Always run `npm test` before committing
- All regex changes require re-running full test suite
- Detection focuses on STRUCTURE not keywords
