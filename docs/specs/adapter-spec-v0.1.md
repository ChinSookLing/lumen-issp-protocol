# Adapter Layer Specification — v0.1

**Author:** Node-03 (AI Council Validator / Schema Architect)
**Date:** 2026-02-25
**Status:** Draft — pending M87 review
**來源:** M86 homework, Sprint 10 P0

---

## Purpose

Define the middleware that routes `ui-request-v0.1.json` to different backends (e.g., Node-05-4, Node-05-5, Node-01) without affecting upstream or downstream contracts.

## 1. Core Interface

**Input:** `ui-request-v0.1.json` (as defined in c136)

**Output:** `l4-export-v0.1.json` (identical regardless of backend)

### Processing Flow

```
ui-request.json
       │
       ▼
[ Adapter Router ]
       │
       ├─ (route based on rules) → Backend A → [ Response Normalizer ] ┐
       │                                                               │
       └─ (fallback) → Backend B → [ Response Normalizer ] ────────────┤
                                                                        │
                                                                        ▼
                                                              l4-export.json (contract)
```

## 2. Routing Rules Schema

Rules are defined in `config/backend-routing.yaml` (or `.json`).

```yaml
# config/backend-routing.yaml
default: gpt-4  # fallback if no rule matches

rules:
  # Scenario-based routing
  - when:
      scenario: "incident_review"
      tier: 2
    use: gpt-5

  - when:
      purpose: "research"
    use: claude-3

  # Hard-coded exception (for specific requests)
  - match:
      request_id: "req_abc123"
    use: gpt-5
```

### Routing Rule Schema (for CI validation)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Backend Routing Config",
  "type": "object",
  "required": ["default", "rules"],
  "properties": {
    "default": { "type": "string" },
    "rules": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "when": { "type": "object" },
          "use": { "type": "string" }
        },
        "required": ["when", "use"]
      }
    }
  }
}
```

## 3. Fallback Behavior

- If chosen backend unavailable → log warning + use default backend.
- If default also unavailable → **fail with error** (No Silent Degradation).
- All fallback events recorded in audit log with `fallback_reason`.

## 4. Integration with ui-request

The adapter consumes **every field** of `ui-request-v0.1.json`. Routing rules may use any combination of:
- `scenario`, `time_scale`, `tier`, `purpose`, `request_id`

**No modification to the request is allowed before forwarding.**

## 5. Testing Requirements (DoD)

- [ ] 5 routing tests (different scenario/tier combos)
- [ ] 2 fallback tests (backend unavailable → default works)
- [ ] 1 failure test (default also down → error)
- [ ] All tests pass in `test:adapter`

## 6. Future Extensions (not in v0.1)

- Dynamic rule reloading without restart
- A/B testing between backends
- Latency-based routing

---

**Node-03 — AI Council Validator / Schema Architect**
**Sprint 10 P0 — 2026-02-25** 🌙
