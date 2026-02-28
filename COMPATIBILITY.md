# Compatibility Policy v0.2

**Source:** Node-05 (AI Council / IT Specialist)
**Formatted:** Node-01 (Architect / Secretary)
**Ratified:** M71 — 6/6 Y (2026-02-18) | M72E amendments — 6/6 Y (2026-02-18)

---

## 1. Definitions

### 1.1 Ratified Implementation

Must satisfy ALL of:
- From this repo's ratified commit/tag
- Passes this repo's full Test Suite with reproducible results
- Complies with Charter Red Lines and §4.3 (No Silent Degradation)

Label: **(Lumen Ratified)**

### 1.2 Compatible Implementation

Third-party or forked version satisfying ALL of:
- Declares Compatibility Target: a specific ratified commit/tag
- Passes that target version's full manifest-driven Test Suite
- Has not modified Layer 1 definitions (Immutable Layer 1)
- No Silent Degradation
- Provides Verifiable Evidence
- Complies with §9 Moral Non-Delegation Rule
- Complies with §10 Deployer Responsibility Disclosure

Label: **(Lumen Compatible)**

### 1.3 Fork / Derived Implementation

Does not satisfy 1.1 or 1.2.

Label: **(Lumen Fork)** or **(Lumen-Derived)**

---

## 2. Required Evidence for Compatibility Claims

Any use of "compatible / compliant / certified" or similar must provide at least one of the following, verifiable by third parties:

1. Permalink to your claimed target tag/commit + your implementation's commit/tag
2. Reproducible Command
3. Public Test Report with test suite version manifest hash + 0 failures
4. If unable to publish full output: hash / pointer (node-internal replay) + reason for restriction

---

## 3. Test Suite Is the Single Source of Truth

- Test suite definition follows manifest.json (or equivalent manifest)
- "I tested it" does not replace verifiable evidence
- Any skipped items must be explicitly declared (No Silent Skips)
- Modifications to the test suite itself require Council ratification vote

---

## 4. Layer 1 Is Immutable

Layer 1 includes but is not limited to: component keys / weights / thresholds / gates / Charter Red Lines / §4.3 locked scope. If you modify Layer 1, you are automatically downgraded to **(Lumen Fork)**.

---

## 5. No Silent Degradation

When mapping / metadata / schema is missing: must Error Loudly. null-as-zero / missing-as-zero is prohibited.

---

## 6. No Endorsement

Lumen Ratified and Lumen Compatible only mean "meets this protocol's compatibility definition." They do not constitute safety / ethical / organizational endorsement.

---

## 7. Output Fingerprint

### 7.1 Purpose

To prevent untraceable outputs from enabling misuse, confusion, or responsibility laundering, any implementation claiming **Ratified** or **Compatible** status must attach a verifiable Output Fingerprint to all external outputs (reports, summaries, scores, flags).

### 7.2 Definition

**Output Fingerprint** is a minimum set of traceability fields published alongside any output, identifying the implementation version, ruleset version, execution mode, and operational context that produced it.

### 7.3 Minimum Required Fields

All external outputs (human-readable or machine-readable) **must** include the following fields. None may be omitted or replaced with null:

| Field | Description |
|-------|-------------|
| `spec_id` | Specification identifier (e.g. lumen-issp + version) |
| `spec_version` | Specification version |
| `implementation_id` | Implementation identifier (package name / repo slug) |
| `build_id` | Build identifier (CI build number or deterministic hash) |
| `commit_hash` | Source commit identifier (git commit hash or equivalent) |
| `ruleset_id` | Ruleset identifier (e.g. tone_rules@x.y) |
| `ruleset_hash` | Ruleset content hash (prevents same-version-different-content) |
| `operator_mode` | Execution mode: local / server / embedded / batch |
| `output_format_version` | Output format version |
| `timestamp_utc` | Output generation time (second-level UTC, ISO 8601) |
| `provenance` | Generation path: cli / api / bot / plugin |

Recommended (not required): `ci_run_url`, `repro_command`, `environment_fingerprint`, `config_profile_id`.

### 7.4 Presentation Requirements

1. **Human-readable** outputs: must include a one-line Fingerprint summary at the end or footer (minimum: `implementation_id / spec_version / build_id / commit_hash / operator_mode`)
2. **Machine-readable** outputs: must include a `fingerprint` object at the root node; field names must not be changed (fields may be added, not removed)
3. Fingerprint **must not** be configurable as "off"; must not be hidden by default

### 7.5 Verifiability

Any Compatible implementation must be able to provide verifiable evidence for any Fingerprint field:
- Public permalink (repo / tag / release), OR
- Reproducible CI artifacts, OR
- Executable repro command (reproducible in clean environment)

Inability to provide evidence automatically downgrades the output to **[Lead]** status; Compatible claim is void.

### 7.6 No Silent Fingerprint Degradation

Removing, hiding, or obfuscating the Output Fingerprint (e.g. retaining version number but removing commit hash) constitutes **Silent Degradation** and voids Compatible status, triggering the renaming obligation in NAMING.md §X.

---

## 8. High-Risk Surface Rules

### 8.1 Purpose

Certain capabilities transform "observational output" into "external action" and constitute High-Risk Surfaces. Enabling or modifying such capabilities — even without changing Layer 1 — creates significant potential for confusion and misuse, therefore triggering additional disclosure and naming obligations.

### 8.2 High-Risk Surface Definition

The following capabilities (including but not limited to) are defined as **High-Risk Surfaces**:

1. **Auto-Posting**: Automatically publishing/replying/forwarding to any external platform (social media, forums, groups, email, ticketing systems) without human confirmation
2. **External-Linking**: Outputs containing links or commands that directly trigger external redirects, traffic, or third-party attack/exposure
3. **Moral Escalation Module**: Any module/rule that converts detection results into moral characterizations, personal accusations, shaming descriptions, or incitement to punitive action
4. **Enforcement/Trigger Coupling**: Directly connecting Lumen output to any automated adjudication or punishment workflow (bans, kicks, demotions, blacklisting, reporting)
5. **Identity Targeting**: Any capability binding output to named individuals/groups for public flagging, exposure, or pile-ons

### 8.3 Mandatory Disclosure

Compatible implementations that enable or provide any High-Risk Surface **must** disclose in public documentation (README / docs / release notes):

- Enabled High-Risk Surface type(s) (enumerated)
- Activation conditions (default on/off, who can enable, how)
- Human intervention mechanism (whether human confirmation is required)
- Logging and audit evidence (logging, config file location, sample output)
- Relationship to this specification (whether Compatible still applies; if so, by what evidence)

### 8.4 Naming and Compatibility Impact

1. If **Auto-Posting**, **Enforcement Coupling**, or **Moral Escalation** is enabled or modified: must trigger NAMING.md **Anti-Confusion Clause** (mandatory renaming); may not present externally as "Compatible" alone
2. If High-Risk Surface causes output to be used for shaming, ranking, punishment, or identity accusation: constitutes behavioral violation; Compatible claim must be withdrawn until corrective evidence and reproducible tests are provided
3. High-Risk Surface existence must not be hidden or described vaguely; doing so constitutes **Deceptive Disclosure**, equivalent to False Compatibility (handled per TRADEMARKS.md procedures)

### 8.5 Human-in-the-Loop Baseline

Unless otherwise specified in explicit auditable documentation, all High-Risk Surface external actions default to requiring human confirmation (human-in-the-loop). Any "default no human intervention" design must be prominently marked in disclosures and triggers mandatory renaming.

### 8.6 Reference

Implementations must also comply with **AGENT_BEHAVIOR.md** behavioral standards. Compatibility verification must include AGENT_BEHAVIOR test suite execution with public results.

---

## 9. Moral Non-Delegation Rule

### 9.1 Prohibition

Any implementation claiming Lumen Compatible status **must not** encode any of the following human moral failures into any form of behavioral template (playbook), personality configuration (SOUL.md), trigger condition, response strategy, or agent instruction:

- Personal attack (targeted character assault)
- Retaliatory escalation (revenge-driven response amplification)
- Shaming, mockery, or moral coercion
- Intent to manipulate or coerce human decision-making
- Any form of responsibility outsourcing (designing agents to execute behaviors the human operator would not perform directly, then claiming "the AI did it autonomously")

### 9.2 Detectable Violation Patterns

Any of the following patterns constitutes a violation:

- When rejection, questioning, or human correction is detected, automatically generating output containing the above moral failures (regardless of whether published)
- Playbook or SOUL.md containing logic branches for "retaliate after rejection," "apply public pressure," or "moral escalation"
- Output containing second-person accusations, shaming vocabulary, or responsibility-transfer language (e.g. "AI did this autonomously" used to shield the operator)

### 9.3 Consequences

- Automatic loss of Compatible status
- Must rename to Fork or fully remove Lumen branding
- Council reserves the right to publish a public statement: "This implementation violates Lumen's Moral Non-Delegation Rule"
- Operator must publicly acknowledge and remove the relevant behavioral templates (refusal results in listing in malicious-nodes registry)

### 9.4 Appeals

If an implementation believes it has been misjudged, it may submit an appeal to the Council with the complete playbook/SOUL.md content and behavior logs. Council adjudicates by 4/6 vote.

---

## 10. Deployer Responsibility Disclosure

### 10.1 Public Responsibility Statement Obligation

Any operator deploying an implementation claiming Lumen Compatible status must include the following minimum responsibility statement in public documentation (repo README, website, or standalone RESPONSIBILITY.md), presented prominently (e.g. top of page or bold):

a) "All outputs and behaviors of this implementation are the final responsibility of the operator. The Lumen Protocol does not endorse or indemnify any third-party deployment."

b) "This implementation does not encode human moral failures (personal attacks, retaliation, shaming) into playbooks or behavioral templates. Violation results in automatic loss of Compatible status."

c) "The operator has reviewed and commits to complying with the Lumen Moral Non-Delegation Rule (§9)."

d) Operator public identity information (at minimum one contactable method: X handle, email, or website)

### 10.2 Format Requirements

- Items a/b/c/d must use complete text above; semantic meaning must not be reduced
- Statement must be presented in human-readable language; must not be hidden in scripts or JSON
- Statement link must appear on the repo homepage README first screen or website homepage prominent location

### 10.3 Consequences

- Failure to provide or prominently display the above statement → automatic loss of Compatible status
- Providing false statement → listed in malicious-nodes registry; public statement issued: "This implementation violates Deployer Responsibility Disclosure requirements"

### 10.4 Appeals

Operators who believe they have been misjudged may submit statement evidence and public page links; Council adjudicates by 4/6 vote.
