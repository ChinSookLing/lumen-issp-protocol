# M91 Agenda — One-Page Summary (from Post-M88 Scan)
Status: Informational
Authority: Non-normative
Scope: Decision-ready summary of Post-M88 scan findings (c155-c188)
Timestamp (UTC): 2026-02-26T00:00:00Z
Change Anchor: Extracted from Node-02-G Post-M88 scan for M91 agenda use
Evidence: docs/scan/Node-02-G-Scan-Post-M88.md

## 1) Overall Snapshot

- Total findings: 10
- P0: 0
- P1: 6
- P2: 4
- Immediate posture: no critical breakage, but governance consistency + async safety require M91 decisions.

## 2) P1 Items (Decision Required)

1. Backend lock window gap (Dim 1)
   - Risk: same chatId may enter overlapping flush/process windows.
   - Owner proposal: Node-01 + Node-03.

2. Missing explicit fail-closed guards in processFlush (Dim 1)
   - Risk: function dependency assumptions are implicit (evaluate/adapt/output path).
   - Owner proposal: Node-01.

3. RW index broken reference (Dim 3)
   - Risk: narrative evidence chain has one broken link (RW-20260225-002 naming drift).
   - Owner proposal: Node-01 + Secretary.

4. Charter canonical drift + clause gap (Dim 5)
   - Risk: active charter path diverges; §2.8/§2.9 not in main charter body.
   - Owner proposal: Governance team.

5. Node-06 8-vector v2 fixture not test-wired (Dim 6)
   - Risk: fixture exists but no clear executable gate.
   - Owner proposal: Node-06 + test owner.

## 3) P2 Items (Hardening Queue)

1. Dashboard token compare hardening (Dim 4)
   - Suggestion: normalize auth parsing + optional constant-time compare + empty-token misconfig warning.

2. Runtime schema enforcement for dashboard item (Dim 4)
   - Suggestion: optional runtime validation before store; current control is test/schema-driven.

3. hashId length risk at high scale (Dim 4)
   - Suggestion: consider 96/128-bit truncated hash if dashboard cardinality grows.

4. Retention policy ambiguity (Dim 4)
   - Suggestion: decide fixed 90d vs policy-flex enum (90d/30d/7d) and align docs/schema/tests.

## 4) Proposed M91 Decisions (Vote Prompts)

1. Approve P1.1 + P1.2 as Sprint-Blocking Engineering Tasks (yes/no).
2. Approve Charter canonical path + §2.8/§2.9 merge plan as Governance Task (yes/no).
3. Approve Node-06 v2 8-vector wiring into executable adversarial gate (yes/no).
4. Assign P2 hardening into next sprint backlog (priority order: token > retention > runtime validation > hash length).

## 5) Suggested Owners & Severity Mapping

- Node-01 + Node-03: P1 backend concurrency + fail-closed guards.
- Secretary track: P1 narrative index integrity.
- Governance team: P1 charter merge/canonicalization.
- Node-06 + test owner: P1 adversarial fixture execution path.
- Security reviewer + dashboard owner: P2 hardening set.

## 6) Exit Criteria for M91

- P1 tasks each have owner + target commit window.
- Governance path/canonical doc decision recorded in minutes.
- Adversarial v2 fixture has executable test gate definition.
- P2 items accepted into prioritized backlog with due cycle.
