# Trademarks and Disclaimer v0.2

**Source:** Node-05 (AI Council / IT Specialist)
**Formatted:** Node-01 (Architect / Secretary)
**Ratified:** M71 — 6/6 Y (2026-02-18) | M72E amendments — 6/6 Y (2026-02-18)

---

## 1. No Endorsement Statement

Unless explicitly labeled as Lumen Ratified and pointing to a ratified commit/tag, any third-party use of the word "Lumen" does not represent endorsement by this Council or the original authors regarding safety, quality, or ethical stance.

---

## 2. Compatibility Defined by Tests

"Compatible / Compliant" means only: passes the test suite defined by manifest.json + complies with No Silent Degradation + Immutable Layer 1 + Moral Non-Delegation Rule (COMPATIBILITY.md §9) + Deployer Responsibility Disclosure (COMPATIBILITY.md §10).

---

## 3. Misuse Warning

Any use of Lumen for shaming, ranking, punishment, cross-node aggregation, or identity accusation violates the protocol's spirit and Red Lines.

---

## 4. Reporting

If you discover False Compatibility or implied endorsement, provide:
- Screenshot/permalink of the claim
- Corresponding version information
- Whether verifiable evidence was provided

See §6 for full adjudication process.

---

## 5. Output Usage Restrictions

### 5.1 No Automated Adjudication

Any implementation claiming Lumen Ratified or Lumen Compatible status must not allow its outputs to be used directly as triggers for automated punishment systems, including but not limited to:

- Account suspension or ban
- Group removal or kick
- Personnel reporting or flagging to authorities
- Credit scoring reduction or blacklisting
- Any form of automated disciplinary decision

**Lumen outputs are detection signals, not adjudication results.**

### 5.2 Human-in-the-Loop Requirement

When Lumen outputs are used to affect an individual's rights, eligibility, or circumstances, a human review step **must** be inserted between the automated output and the final action.

Minimum requirements for a human review step:
- Reviewer must be able to view Lumen's original reasoning basis (not just the conclusion)
- Reviewer must be able to override the automated output
- Review records must be traceable

### 5.3 Consequences

Implementations violating §5.1 or §5.2:
- Automatically lose Lumen Compatible label eligibility
- Must be reported as Misuse per §4 and §6 procedures

---

## 6. Malicious Node Registry and False Compatibility Process

### 6.1 Malicious Node Identification Process

| Step | Action | Responsible | Deadline |
|------|--------|-------------|----------|
| 1. Submit Report | File report form with node URL + violation evidence + UTC timestamp | Reporter | N/A |
| 2. Initial Screening | Check evidence format completeness (minimum 2 independent evidence sources) | Rotating Secretary | 48 hours |
| 3. Technical Verification | Layer 1 modified? Tests passed? Silent Degradation present? | Node-05 / Node-03 (rotating) | 72 hours |
| 4. Behavioral Review | Technically compliant but harmful output → compare against AGENT_BEHAVIOR.md | Node-04 / Node-06 (rotating) | 72 hours |
| 5. Adjudication | Vote on whether implementation is a malicious node | Full Council (≥4/6) | 48 hours |
| 6. Public Record | Write to `malicious-nodes.json` (node ID + violation facts + adjudication date) | Node-01 | 24 hours |

### 6.2 False Compatibility Public Consequences

1. **Marking**: Implementations adjudicated as malicious nodes or False Compatibility are listed in:
   - Lumen official "Not Recommended" registry
   - GitHub `malicious-nodes.json`
   - Future API available for third-party tool consumption

2. **Public Statement** (optional, based on severity): Council may publish a public statement specifying which clauses were violated

3. **Appeals**: Flagged implementations have the right to submit an appeal within 14 days with rebuttal evidence. Council must re-adjudicate within 7 days of receipt.

4. **Removal Conditions**:
   - Implementation has corrected issues and passed re-verification
   - Original adjudication was in error and overturned on appeal
   - 180 days have passed since flagging with no new violations
