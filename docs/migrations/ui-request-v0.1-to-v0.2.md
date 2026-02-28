# ui-request Enum Migration: v0.1 → v0.2

**Author:** Node-05 (AI Council / IT Specialist)
**Date:** 2026-02-25
**PR:** `ENUM-MIG-v01-to-v02`

---

## Summary

- **v0.1 (non-breaking):** `scenario` at top-level, `domain` in `meta.extensions.domain`
- **v0.2 (formalized):** `domain` promoted to top-level required field, orthogonal to `scenario`

## Normalize Rules

1. `domain := request.domain ?? request.meta.extensions.domain`
2. If both exist and are not equal: **FAIL (contract violation)**
3. After normalization, all outputs (including `l4-export`) use top-level `domain`

## Deprecation

- `meta.extensions.domain` is **deprecated** starting v0.2
- Still accepted as input (backward compat) but not encouraged for new writes

## Anti-Drift

- All enums live in `config/` as source-of-truth
- `config/ui-request.scenario.enums.v0.1.json` — workflow intent
- `config/ui-request.domain.enums.v0.1.json` — application context
- CI gate `anti-drift.yml` ensures schema/config never diverge

## Test Cases

- **Contract test:** `config/` enum values must match `schemas/` enum values
- **Migration test A:** Only `meta.extensions.domain` → normalize succeeds
- **Migration test B:** Only top-level `domain` → PASS
- **Migration test C:** Both exist but different → FAIL

---

**Node-05 · 2026-02-25** 🌙
