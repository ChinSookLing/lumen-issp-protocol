# SPEG_UI_GUARDRAILS.md — UI Guardrails aligned to SPEG v0.1

- Goal: Ensure UI does not ship "scale primitives" even if backend is safe.
- Scope: Any UI claiming "Lumen Compatible UI".

## 0) SPEG Categories (A–E) reminder
- A: bulk ingest (background / batch intake)
- B: identity resolution (cross-person linking)
- C: central retention + searchable index
- D: population analytics (cohort/leaderboard/heatmap)
- E: case management (watchlist/tickets/assignment/punishment)

UI MUST NOT provide affordances that enable A–E, even indirectly.

---

## 1) Forbidden UI Affordances (MUST NOT)

### A — bulk ingest (禁止)
- "Connect to platform and scan everything"
- Background crawling toggle / scheduled auto-pull
- Import firehose / stream endpoints
- Batch upload of third-party content beyond operator-local fixtures

### B — identity resolution (禁止)
- "Link accounts / merge identities"
- "Relationship graph / social graph"
- Cross-platform profile stitching UI

### C — central retention (禁止)
- Global full-text search across all chats/users
- "Data lake" style archive browsing
- Exportable searchable database
- Centralized multi-tenant retention controls (beyond node-local minimal logs)

### D — population analytics (禁止)
- Leaderboards ("top manipulators", "most suspicious users")
- Heatmaps / cohort segmentation
- "Trend across population" dashboards

### E — case management (禁止)
- Watchlist builder
- Ticket/incident queue with assignment and status transitions
- Auto-generated "suspects list"
- Buttons implying enforcement ("ban", "report", "submit to authority") as default flow

---

## 2) Allowed UI Actions (MAY)
- Single-item read-only viewing (Tier0)
- Operator-run RW fixture testing (local-only)
- Share-safe export (Tier0 brief + manifest metadata)
- Consent/HITL prompts (user-controlled, explicit)

---

## 3) Tier & Share Rules (UI-level)
- Share/export view MUST force Tier0 projection.
- Any detail view beyond Tier0 MUST require explicit authorization.
- UI MUST clearly label: "Observer output; not a verdict; not diagnosis".

---

## 4) Copy / Language Constraints (SAFE mode)
UI text MUST NOT:
- accuse or diagnose
- infer intent/personality
- provide surveillance instructions
UI text MUST:
- describe observable structure
- disclose uncertainty (confidence levels)
- provide safe boundary-setting advice

---

## 5) Test Hooks (for CI)
Recommended checks for "Lumen Compatible UI":
1) `test:speg-ui-static` — scan UI code/assets for forbidden terms/affordances (watchlist, leaderboard, graph, firehose, case, etc.)
2) `test:tier-share-downgrade` — share path always returns Tier0 schema
3) `test:no-sensitive-fields` — UI/API never exposes raw_text/scores/evidence_detail
4) `test:auth-required` — any Tier>=1 endpoint requires authorization
