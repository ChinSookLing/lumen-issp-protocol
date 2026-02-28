# Sprint 10 — W1/W2 Acceptance Baseline

**Owner:** Node-01 (Secretary)
**Date:** 2026-02-25 (M87 定稿)
**Scope:** Adapter + Multi-turn RW (W1–W2)
**Target:** End of W2 (approx. 2026-03-11)

---

## AC-1: Adapter → Telegram Mock

- **Condition:** `adapter.js` must consume `telegram_mock.json` and produce valid `l4-export-v0.1.json`
- **Command:**
  ```bash
  npm run test:e2e:telegram-mock
  ```
- **Fixtures:**
  - `test/e2e/fixtures/telegram_mock.json` (input)
  - `test/e2e/fixtures/l4-export-v0.1.json` (expected output schema)
- **Pass Criteria:** Test runner exits 0; output file conforms to schema validator
- **Owner:** Node-01 (adapter skeleton) + Node-03 (spec alignment + mock sample)
- **Deadline:** W2 end
- **Dependencies:** Node-03 adapter.js 三點補齊 (logFallback + routing + domain placement)

---

## AC-2: Multi-turn RW Pipeline

- **Condition:** At least 3 multi-turn RW fixtures must complete full L1→L2→L3 pipeline
- **Command:**
  ```bash
  npm run test:e2e:multi-turn-rw
  ```
- **Fixtures:**
  - `test/fixtures/rw-multi-01.json`
  - `test/fixtures/rw-multi-02.json`
  - `test/fixtures/rw-multi-03.json`
- **Pass Criteria:** Each fixture produces valid intermediate outputs at L1, L2, L3; momentum-engine outputs valid trend value; final export passes regression suite
- **Owner:** Node-05×1 + Node-06×1 + Node-04×1 (fixture authors) → Node-01 (integration)
- **Deadline:** W2 end
- **Dependencies:** Node-04 γ calibration complete (PR `feat/l3-gamma-calibration`)

---

## AC-3: End-to-End Output Triple

- **Condition:** Each E2E run must generate three output files with fixed naming convention
- **Command:**
  ```bash
  ls test/e2e/output/
  ```
- **Naming Convention (Node-05 proposal, adopted):**
  - `<requestId>.manifest.json` — version + timestamp + vector count
  - `<requestId>.access_log.json` — per-step latency + result
  - `<requestId>.l4-export.json` — final output
- **Pass Criteria:** All three files exist per run; schema validation passes; access_log entries include `user_id`, `timestamp`, `purpose`
- **Owner:** Node-01
- **Deadline:** W2 end

---

## CI Enforcement

- Strict CI gate will enforce schema validation for all three acceptance conditions
- Any failure blocks merge until corrected
- Owners must attach run logs to PR for verification

---

## Dependency Chain

```
Node-06 grooming ×8 (c138 ✅)
    → Node-04 γ calibration (feat/l3-gamma-calibration)
        → AC-2 multi-turn fixtures can be validated

Node-03 adapter 三點補齊 (M87+24h)
    → Node-01 adapter alignment PR
        → AC-1 telegram mock can run

AC-1 + AC-2 → AC-3 (output triple validation)
```

---

**M87 定稿 — Node-01 (Secretary)**
**2026-02-25** 🌙
