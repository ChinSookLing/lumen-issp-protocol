# PORTAL_CONTRACT.md — UI Portal Contract v0.1

- Scope: Layer 4 UI Portal (Adapter)
- Principle: UI is replaceable adapter; only stable interface is contract
- Default: Dropdown-first; Tier0 view by default; SAFE-mode language

## 0) Non-negotiables (must)
1) UI MUST consume `l4-export` + `manifest` + (optional) `access_log` and MUST NOT require raw text.
2) UI MUST implement Tier gating: Tier0 default; Tier1/2 requires HITL.
3) UI MUST be contract-testable: views follow allowed inputs/outputs; forbidden fields never shown.
4) UI MUST be SPEG-safe: must not ship scale primitives A–E via UI affordances.

---

## 1) View List (5 views)

### View-01: Home / Quick Brief
**Purpose**
- Show the latest observation summary immediately (minimal, safe, share-friendly).

**Entry**
- Default landing.
- Or from any completed run (redirect to latest item).

**Inputs (from pipeline)**
- `dashboard_item.v0.1` OR `l4-export` (Tier0 projection)
  - required: `badge`, `simple_advice`, `top_flags`, `time_utc`, `request.request_id`
  - optional: `confidence` (levels only)

**Outputs (UI renders)**
- Card list: time + badge (🔵/🟡/🟠) + top_flags (≤5) + simple_advice (≤480 chars)
- Minimal filters (dropdown): `badge`, `time_window`, `chat_id` (if present)

**Forbidden**
- No raw text, no long quotes, no "who is this person" inference
- No numeric scores (ACRI/VRI/momentum) shown
- No "export list of users" / "top offenders" / "watchlist" affordances

---

### View-02: Investigate (Detail Read)
**Purpose**
- Drill down into *auditable* signals, not psychological diagnosis; show what fired and why, within Tier gates.

**Entry**
- Click from a Home item ("Investigate")
- OR choose `scenario=incident_review` in dropdown.

**Inputs**
- `l4-export` Tier1/2 projections (only if HITL passed)
- Optional: `access_log` (event-level), `manifest`

**Outputs**
- Signals panel: fired pattern keys + brief rationale (SAFE, non-accusatory)
- Confidence split (levels only): stat/rule/hint
- Evidence index (if present): *index only* (no raw content)
- Audit panel (if allowed): access_log timeline (event type + timestamp + module)

**Forbidden**
- Mind-reading, diagnosis, moral judgment, identity essentialism
- Any instruction enabling surveillance, tracking, watchlisting
- Any bulk search across many users or cross-chat correlation

---

### View-03: Share / Export
**Purpose**
- Produce share-safe artifacts; enforce downgrade to Tier0 for sharing.

**Entry**
- "Share/Export" action from Home or Investigate

**Inputs**
- `l4-export` (must support Tier0 share projection)
- `manifest` (metadata only)

**Outputs**
- Share preview: badge + one-liner advice + redaction_state
- Export options (dropdown):
  - Export brief (Tier0 only)
  - Export manifest-only (metadata)
- Explicit warning if user tries to export anything beyond Tier0

**Forbidden**
- Export of raw text, detailed evidence, access_log full timeline by default
- "Batch export all chats/users" (SPEG-A/C/D/E risk)

---

### View-04: RW Lab (Fixture Runner)
**Purpose**
- Run curated RW fixtures through the pipeline safely (internal testing), generating artifacts + TRS entries.

**Entry**
- Internal-only nav (not public)
- Requires operator token / local-only

**Inputs**
- RW fixture file (local upload) OR selection from `docs/rw/INDEX.md`
- Dropdown params: scenario/time_scale/tier/output_mode/purpose (no freeform long text)

**Outputs**
- Run result: same as Home + links to artifacts (`manifest/access_log/l4-export`)
- TRS generator: one-click create `docs/trs/TRS-...md` from artifact + template

**Forbidden**
- Any connector for background crawling or platform bulk ingest
- Any UI that suggests "connect your accounts and we'll scan everything"
- Any auto-run schedule across many chats/users (SPEG-A/E)

---

### View-05: Settings / Consent / Node Health
**Purpose**
- Manage consent gates, HITL authorization, and node-local health status.

**Entry**
- Settings icon (internal)
- Telegram-specific: consent gate status per chat

**Inputs**
- Node-local config snapshot (read-only display)
- Consent state store (minimal)

**Outputs**
- Consent status: ON/OFF + timestamp
- HITL prompts queue (if implemented)
- Node health: last run time, backlog count, version hash

**Forbidden**
- No PII display beyond minimal chat id/hash
- No user profiling dashboard ("high-risk users", "network graph")

---

## 2) Tier Behavior Summary (must)

- Tier0 (default): show only badge + simple_advice + top_flags; always redacted; share-safe.
- Tier1: requires HITL; may show evidence index + limited audit timeline; still no raw text.
- Tier2: requires HITL; may show deeper audit + manifest; still no scale primitives; no population analytics.

---

## 3) Contract-Test Expectations (for CI)
- UI MUST pass `test:contracts` for view inputs/outputs (whitelist).
- UI MUST pass `test:speg-ui` (forbidden affordances not present).
- UI MUST pass `test:tier` (Tier0 downgrade on share/export).
