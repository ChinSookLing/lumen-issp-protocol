# M78 Decision Brief — A-005 Codebase Audit (One Page)

- Date: 2026-02-21
- Source: A-005 pre-M78 audit
- Purpose: Council decision on next execution path

---

## 1) Executive Snapshot

- Baseline status: **PASS** (`611 tests / 0 fail`)
- Scan scope: all existing `core/*.js`
  - Pattern modules: 9 (`ep/fc/mb/gc/dm/ea/ip/vs/class0`)
  - Support modules: 4 (`evaluator/harness/ir/time_provider`)
- Dead zone found: **1 (by design)** → `DM.gate_res` (RESERVED)
- ReDoS high-risk signatures: **0**
- Wildcard performance candidates (`.*` / `.+` unanchored): **252**
- Component test coverage: **Strong overall**
  - Dedicated assertions across all active components
  - Only reserved `DM.gate_res` is indirect-only

---

## 2) What This Means (for M78)

1. System is stable enough to continue feature work (no baseline regression).
2. Immediate security emergency is **not indicated** (no catastrophic backtracking signature found).
3. Main technical debt is **performance observability + regex governance**, not correctness collapse.
4. `DM.gate_res` remains a policy/roadmap decision point (not an accidental gap).

---

## 3) Decision Options (A/B/C)

### Option A — Keep current regex set + monitor only

- Decision: No regex policy change in M78; continue planned P0/P1 roadmap.
- Action:
  - Keep current pattern rules unchanged.
  - Observe long-text runtime and false-positive drift during regular test runs.
- Pros:
  - Zero workflow disruption.
  - Fastest path to pending M77 implementation items.
- Risks:
  - Performance risk remains reactive (detected later, not prevented earlier).

### Option B — Add CI regex audit gate (lightweight)

- Decision: Introduce CI check for newly added unanchored broad wildcard regex.
- Action:
  - Add lint/audit rule for new `.*` / `.+` patterns without anchors/constraints.
  - Keep as warning-first (non-blocking) or soft-fail for first phase.
- Pros:
  - Prevents silent regex debt growth.
  - Builds sustainable guardrails with low implementation cost.
- Risks:
  - Some linguistic regex may trigger noisy warnings and need allowlist tuning.

### Option C — Formalize RESERVED component activation policy

- Decision: Define governance contract for activating reserved components (`DM.gate_res` style).
- Action:
  - Specify activation criteria, evidence threshold, and mandatory test pack template.
  - Pre-define DoD for “reserved → active” transitions.
- Pros:
  - Improves governance clarity and cross-member handoff quality.
  - Reduces ambiguity in future component expansions.
- Risks:
  - Requires coordination overhead before implementation speedups appear.

---

## 4) Suggested Vote Sequence

- **Primary vote:** B (guardrail) vs A (status quo)
- **Secondary vote:** Whether to start C in parallel as governance track

Recommended execution if passed:
- `B + C(light)` in M78, while keeping M77 P0 tasks as coding priority.

---

## 5) Proposed M78 Resolution Template

- Resolution ID: `M78-R-A005`
- Adopted option(s): `A / B / C`
- Effective date: `YYYY-MM-DD`
- Owner(s): `Node-05 / Node-01 / Node-02-G / ...`
- DoD:
  1. CI / governance artifact merged
  2. `npm test` remains green
  3. No increase in false positives on conformance + TR suite
