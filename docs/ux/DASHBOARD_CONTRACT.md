# DASHBOARD_CONTRACT.md — Dashboard Contract v0.1

- Scope: Cross-device read-only dashboard (node-local)
- Default: Tier0 display
- Data source: `dashboard_item.v0.1` (preferred) OR `l4-export` Tier0 projection
- Security: requires `DASHBOARD_TOKEN` (query/header) for non-local deployment

---

## 1) Information Architecture (Bottom Nav: 3 pages)

### Page-01: Brief (default)
**Purpose**
- Fast overview of latest events across devices (Telegram + others).

**Input**
- `GET /api/recent?limit=50` -> array of `dashboard_item`

**UI Elements**
- Filter bar (dropdown-only): time window / badge / scenario / domain (optional)
- List of cards (Tier0)

**Card Fields (Tier0)**
- time_utc
- badge (🔵/🟡/🟠)
- top_flags (≤5)
- simple_advice (≤480)
- request_id (copy button)
- link: "Details" (go Page-02)

**Forbidden**
- No numeric scores, no raw text, no user ranking, no watchlists

---

### Page-02: Details (Investigate-lite)
**Purpose**
- Show auditable detail for *a single item*; still safe by default.

**Input**
- `GET /api/item/:request_id` -> returns `dashboard_item` + optional `access_log` (if Tier allows)

**UI Elements**
- Sections:
  - Summary (badge + advice)
  - Fired patterns (keys + short SAFE explanation)
  - Confidence split (levels)
  - Audit (collapsed by default; only if allowed)

**Forbidden**
- No cross-item correlation view
- No "search all logs" full-text search across users/chats (SPEG-C risk)

---

### Page-03: Share / Export
**Purpose**
- Produce safe artifacts for sharing/export.

**Input**
- `GET /api/item/:request_id` + export endpoints if present

**UI Elements**
- Preview always Tier0
- Export options (dropdown): brief / manifest-only
- "Copy share text" button that copies only Tier0 summary

**Forbidden**
- No batch export, no bulk download, no case queue

---

## 2) API Contract (minimal, compatible)

### `/api/recent`
- returns: `dashboard_item[]` (Tier0-only fields)

### `/api/item/:id`
- returns: `dashboard_item` (+ optional `access_log` if tier>=1 AND authorized)

### `/api/stats` (optional)
- returns only node-local stats (counts, uptime); no population analytics

---

## 3) Tier & Authorization Rules
- Default view: Tier0
- Any Tier>=1 detail requires:
  - explicit operator authorization (HITL or token)
  - and must remain SPEG-safe (no bulk, no graph, no case mgmt)

---

## 4) CI / Tests (recommended)
- `test:dashboard-contract` validates every API response matches schema
- `test:dashboard-no-sensitive` asserts response excludes:
  - `raw_text`, `evidence_detail`, `acri_score`, `momentum_score`
- `test:dashboard-auth` ensures details endpoint is gated
