# Naming and Branding Rules v0.2

**Source:** Node-05 (AI Council / IT Specialist)
**Formatted:** Node-01 (Architect / Secretary)
**Ratified:** M71 — 6/6 Y (2026-02-18) | M72E amendments — 6/6 Y (2026-02-18)

---

## 1. Permitted Compatibility Claims

Only when satisfying COMPATIBILITY.md's Compatible Implementation definition (including §9 and §10) may you use:
- "(Lumen Compatible)"
- "(Lumen Compliant)"
- "Compatible with Lumen tag X / commit Y"

Must include verifiable evidence.

---

## 2. When You Must Use a Different Name

If ANY of these apply, you may NOT claim Lumen Compatible, even if functionality is similar:
- Modified Layer 1
- Test suite not fully passed or no verifiable evidence available
- Silent Degradation exists
- Refuses or unable to provide any reproducible verification
- Violates §9 Moral Non-Delegation Rule
- Fails to provide §10 Deployer Responsibility Disclosure

You may only use: **(Lumen Fork)** / **(Lumen-Derived)** / **(Lumen-Inspired)**

---

## 3. No Implied Endorsement

Prohibited: official partner / endorsed / approved / certified / Council-approved (unless pointing to a ratified resolution permalink)

Permitted: tested against manifest X / passes Lumen test suite for tag Y

---

## 4. Naming Conventions

- Official: `Lumen Protocol` (Lumen Ratified)
- Compatible third-party: `<Name> — Lumen Compatible (tag X)`
- Fork: `<Name> — Lumen Fork (derived from tag X)`
- High-Risk Surface variant: `<Name> (Auto-Posting Fork)` / `<Name> (External-Linking Variant)`

---

## 5. Minimum Disclosure Format

Any external claim should include:
- Compatibility Target: tag/commit
- Evidence: permalink / reproducible command / CI report
- Declaration: Ratified / Compatible / Fork

---

## 6. Anti-Confusion Clause (High-Risk Surface Capabilities)

Any implementation — even if it passes all conformance tests and has not changed Layer 1 — **must not** present externally as "Lumen Compatible" as its primary label, and **must rename** or prominently annotate, if any of the following conditions apply:

### 6.1 Triggers

A) Enables or adds **Auto-Posting** capability (automated publishing without human confirmation)

B) Enables or adds **External-Linking** as a default part of output

C) Enables or adds a **Moral Escalation Module**

D) Couples output directly to **Enforcement/Trigger** (automated adjudication or punishment)

E) Adds any agent behavior that **speaks on behalf of Lumen externally** (auto-reply, public naming, calls to action)

### 6.2 Naming Requirement

- Must use a suffix or prefix that clearly identifies the High-Risk Surface (e.g. `<Name> (Auto-Posting Fork)` / `<Name> (Moral-Escalation Variant)`)
- Must not use naming that leads the outside world to assume official association, endorsement, or equivalent safety boundaries

### 6.3 Disclosure Requirement

Must include on README first screen (visible without scrolling):

- List of enabled High-Risk capabilities
- Whether human confirmation is required
- Whether Output Fingerprint (COMPATIBILITY.md §7) is fully retained
- Compatibility claim with evidence chain (if still claiming Compatible)

### 6.4 Consequence

Failure to comply while still presenting as Compatible constitutes an **Anti-Confusion Violation**; the compatibility claim may be treated as False Compatibility and handled per TRADEMARKS.md reporting and disposition procedures.
