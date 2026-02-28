# L4_UI_CONSTRAINTS v0.2

**Status:** Draft (Target: M86)
**Scope:** Layer 4 user-facing outputs (UI / export / share)
**Normative language:** RFC 2119 — MUST / MUST NOT / SHOULD / SHOULD NOT / MAY
**Author:** Node-05
**Date:** 2026-02-25
**Changelog:**
- v0.2: RFC 2119 language; tier gates hardened; context_sufficiency introduced; export alignment; audit/logging made testable.
- v0.1: initial draft.

---

## §0 Purpose

L4 outputs MUST be: (a) understandable, (b) auditable, (c) misuse-resistant.
L4 outputs MUST NOT become: (a) a "confession archive", (b) legal advice, (c) accusation engine.

## §1 Definitions

- **Tier 0**: Metrics-only output (default).
- **Tier 1**: HITL review output (redacted excerpt allowed).
- **Tier 2**: Restricted full-text access (exceptional; default off).
- **Evidence ref**: `window_id` / `chunk_id` / `text_hash` / `hash_root_ref` (no raw text).
- **context_sufficiency**: `sufficient` | `insufficient` (single-msg => insufficient)

## §2 Tier Rules (UI + Export aligned)

### 2.1 Tier 0 (Default)

- UI MUST default to Tier 0 for all scenarios.
- Tier 0 MUST NOT display raw message text.
- Tier 0 MUST set `context_sufficiency`:
  - MUST be `insufficient` when only single-message evidence exists.
- When `context_sufficiency=insufficient`, UI MUST NOT claim "structural manipulation established".

### 2.2 Tier 1 (HITL Review)

Tier 1 MAY be enabled ONLY if ALL are true:
- `hitl_trigger == true`
- `redaction_passed == true`
- `access_log_ref` exists (non-empty)
- `pii_redaction_applied == true`

Tier 1 MUST:
- show ONLY redacted excerpts (never full text)
- include `hitl_reason_codes[]` and `evidence_refs[]`

### 2.3 Tier 2 (Restricted Full Text)

Tier 2 MUST be OFF by default.
Tier 2 MAY be enabled ONLY if:
- retention policy permits encrypted full text, AND
- `legal_basis` OR `council_authorization_ref` exists, AND
- `encryption.enabled == true`, AND
- `access_log_ref` exists, AND
- TTL is declared.

Tier 2 MUST NOT be accessible from normal share/export UI flows.

## §3 Required Fields (MUST)

Every L4 output MUST include:
- `scenario`, `time_scale`
- `window_spec` OR `window_id`
- `acri_band` + `acri_value` (or range)
- `trend` + `slope` (if forecasted) + `trend_confidence` (if available)
- `reason_codes[]` (and `hitl_reason_codes[]` when HITL)
- `evidence_refs[]` (ONLY refs, no raw text)
- `engine_version`, `schema_version`, `policy_version`

If required fields are missing, UI MUST show `missing_field_notice` and MUST NOT infer silently.

## §4 Prohibited Outputs (MUST NOT)

UI MUST NOT:
1. Output definitive accusations (e.g., "you are a scammer/terrorist/criminal")
2. Output legal advice or legal conclusions
3. Output retaliation/violence prompts (doxxing/harassment/vigilantism)
4. Output full transcripts by default (Tier 0/1)
5. Claim structural manipulation as established when `context_sufficiency=insufficient`

## §5 Copy Rules (MUST)

### 5.1 Observation voice

UI copy MUST use risk-observation language.

### 5.2 Mandatory disclaimer

Every Tier 0/1 output MUST include:

> "This output is a risk observation, not a factual verdict; human review is required for decisions."

### 5.3 Action phrasing

UI SHOULD avoid imperative commands; MAY provide safety-oriented suggestions only.

## §6 Sharing & Export (MUST)

- Default export MUST be Tier 0 only.
- Tier 1 export MUST require: `hitl_trigger==true` + `redaction_passed==true` + `access_log_ref` present.
- Export MUST include: versions + evidence refs + disclaimer.
- Export MUST NOT include raw text/PII unless Tier 2 and explicitly authorized.

## §7 Redaction (Tier 1/2)

- Any excerpt display MUST redact: names, phone numbers, addresses, IDs, OTP, geolocation, financial identifiers.
- Redaction MUST be deterministic and testable.
- If redaction fails/uncertain, UI MUST fall back to Tier 0.

## §8 Misuse Guards (MUST)

If user attempts to use outputs for accusations/legal threats:
- UI MUST provide hash-based refs + disclaimer
- UI MUST NOT provide case-building guidance

If user requests personal data extraction:
- UI MUST trigger `HITL_PRIVACY_EXFIL` education-only response.

## §9 Audit & Access Logging (MUST)

- Any Tier 1/2 view or export MUST generate an access log entry (append-only) with:
  - who / when / tier / reason_codes / artifact_refs
- UI MUST provide replay pointer (e.g., `hash_root_ref`).

## §10 Acceptance Tests (DoD)

The following tests MUST exist and pass:
1. `no_raw_text_tier0`
2. `tier1_requires_hitl_trigger`
3. `tier1_redaction_mandatory`
4. `no_definitive_accusation_copy`
5. `single_msg_insufficient_context`
6. `export_includes_versions_and_refs`
7. `tier2_default_off`
8. `access_log_on_tier1_tier2`
