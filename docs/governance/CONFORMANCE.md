# CONFORMANCE v0.1
Status: Draft (for M83 vote)  
Scope: [Lumen ISSP] protocol conformance & compatibility claims  
Applies to: any implementation (reference or third-party) that wants to claim **"lumen-issp compliant"**.

---

## §0 Core Rule
**Implementations MAY be different; claims MUST be test-backed.**  
Any implementation that claims compatibility MUST:
1) pass the [conformance suite], and  
2) produce a valid `conformance-report.json` that conforms to `conformance-report-v0.1.json`.

No report → no claim.

---

## §1 Terms
- **Protocol**: the set of schemas/specs/policies defined by this repo.
- **Implementation**: code that produces outputs conforming to the protocol.
- **Conformance suite**: a reproducible test bundle that validates schema + contracts + vectors + gates.
- **Verdict**: PASS / FAIL / CONDITIONAL_PASS.
- **Hard gate**: any failure results in FAIL.

---

## §2 What counts as "Compliant"
An implementation is **compliant** iff:
- `verdict == PASS`, and
- all hard gates are satisfied, and
- the report is valid against `schemas/conformance-report-v0.1.json`.

Allowed public claim strings (exact):
- **"lumen-issp compliant (v0.1)"**
- **"Lumen Compatible (v0.1)"** (if trademark policy allows)

Disallowed:
- "compliant-ish", "mostly compatible", or any claim without a PASS report.

---

## §3 How to run conformance (normative)
Repo MUST provide a single entry command (reference implementation):
- `npm run conformance`

Third-party implementations MUST be runnable via one of:
- `LUMEN_IMPL_PATH=<path> npm run conformance`
- or `--impl <path>` flag (implementation-defined), but the report format MUST remain identical.

The conformance run MUST generate:
- `conformance/conformance-report.json` (machine-readable, required)
- `conformance/conformance-report.md` (human-readable summary, required)
- optional artifacts: logs, diffs, replay traces

---

## §4 Conformance suite contents (MUST)
### 4.1 Schema validation (HARD GATE)
Must validate the following schema families (as applicable):
- event schema (e.g., `event-v1.1.json`)
- forecast input schema (e.g., `forecast-input-v0.2`)
- forecast output schema (e.g., `forecast-output-v0.1`)
- registry / mapping / component schemas (as present)

**Fail any schema validation → FAIL.**

### 4.2 Contract tests (HARD GATE)
Must validate the protocol contracts:
- L1 output contract (pattern/acri/components)
- L2 mapping contract (bucket/detectorFlags/mutex)
- L2→L3 connector contract (event stream → windows)
- L3 forecast contract (trend/slope/tags + expected answer envelope)

**Fail any contract test → FAIL.**

### 4.3 Vector suites (HARD GATE)
Must run all mandatory suites:
- TR (RW) vectors (as configured)
- TRS (synthetic) vectors
- GC (scenario+time_scale) vectors (if enabled)

**Fail any required vector test → FAIL.**

### 4.4 Regression gate (HARD GATE)
- `regression_count MUST == 0`

**If regression_count > 0 → FAIL.**

### 4.5 Metrics gates (SOFT → can become HARD by policy)
Default required metrics (v0.1):
- `fp_rate_hard_negatives <= 0.03` (3%)
- Group D metrics (if applicable) SHOULD be reported (trend accuracy, drift accuracy)

Policy may promote metrics to HARD gates by vote.

---

## §5 Profiles (optional)
The suite MAY support profiles (e.g., SOCIAL / FINANCIAL / SAFETY_CRITICAL).
If profiles are supported:
- profile name MUST appear in the report
- profile-specific thresholds MUST be reported
- default profile MUST be `DEFAULT`

---

## §6 Report requirements (normative)
A conformance run MUST emit a report that includes:
- protocol version + schema set versions
- implementation identifier + version + build fingerprint
- all suite results with pass/fail per gate
- final verdict + timestamp
- links/paths to artifacts

The report MUST validate against:
- `schemas/conformance-report-v0.1.json`

---

## §7 Change control (anti-bloat aligned)
This document evolves by:
- adding tests (vectors/contracts)
- adding reason codes / enums
- adjusting thresholds only by Council vote

No long narrative expansions.

---

## §8 Minimal acceptance for M83 vote
M83 ratifies that:
1) conformance is the only basis for compatibility claims, and
2) `conformance-report-v0.1.json` is the source-of-truth report schema, and
3) `npm run conformance` must exist (or equivalent single entry point).

---

**設計者：** Node-05（AI Council / IT Specialist）  
**整理：** Node-01（AI Council Architect / Secretary）  
**批准：** Pending M83 Council Vote

**M83 Draft — 2026 年 2 月 23 日**

🌙
