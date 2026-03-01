# Lumen ISSP — Feedback Pipeline Specification
# Step 21A · M94-V4 Authorized · Sprint 13+

> **Principle:** Node-local only. No original text. No identity association. SPEG compliant.
> **Scope:** api/feedback/sync — Dashboard feedback data auto-converts to L2b fixtures.

---

## 1. Feedback Schema (feedback.json)

```json
{
  "version": "1.0.0",
  "entries": [
    {
      "id": "fb-001",
      "timestamp": "2026-02-28T12:00:00Z",
      "type": "confirm | dismiss | fp | fn",
      "pattern_id": "P01",
      "flag_id": "spec_gap_risk | null",
      "tier": 0,
      "confidence_before": 0.85,
      "note": "optional free text from operator (not end-user)",
      "source": "dashboard | telegram_reply"
    }
  ],
  "stats": {
    "total": 0,
    "confirm": 0,
    "dismiss": 0,
    "fp": 0,
    "fn": 0,
    "last_updated": "2026-02-28T12:00:00Z"
  }
}
```

### Feedback Types

| Type | Meaning | Action |
|------|---------|--------|
| `confirm` | Detection was correct | Strengthen fixture weight |
| `dismiss` | Detection was irrelevant (not wrong, just not useful) | Log only |
| `fp` | False Positive — not manipulation | → candidate for FP fixture |
| `fn` | False Negative — missed manipulation | → candidate for new test case |

---

## 2. API Endpoint

### POST /api/feedback

```json
{
  "type": "fp",
  "pattern_id": "P03",
  "flag_id": null,
  "tier": 2,
  "confidence_before": 0.72,
  "note": "legitimate sales language, not manipulation"
}
```

**Response:**
```json
{
  "ok": true,
  "id": "fb-042",
  "timestamp": "2026-02-28T12:00:00Z"
}
```

### GET /api/feedback/stats

Returns aggregated feedback stats (no raw entries — SPEG compliant).

```json
{
  "total": 42,
  "confirm": 28,
  "dismiss": 5,
  "fp": 7,
  "fn": 2,
  "by_pattern": {
    "P01": { "confirm": 10, "fp": 2 },
    "P03": { "confirm": 8, "fp": 3 }
  },
  "last_updated": "2026-02-28T12:00:00Z"
}
```

---

## 3. SPEG Compliance Checklist

| SPEG Dimension | How we comply |
|----------------|---------------|
| A — No original text | Feedback stores pattern_id + type only, never raw message |
| B — No identity association | No user_id, no chat_id, no IP logged |
| C — Node-local storage | feedback.json stored locally, never transmitted |
| D — Minimal collection | Only 4 structured types: confirm/dismiss/fp/fn |
| E — Operator-only access | Only node operator can view feedback stats |

---

## 4. Dashboard Integration

Dashboard banner shows:
- Total feedback count
- FP/FN ratio (if > threshold, flag for review)
- "New feedback since last review" indicator

### Feedback → Fixture Pipeline (Node-04 Feedback Loop)

```
[User confirms/reports] → feedback.json
                         → nightly: scan for FP count ≥ 3
                         → auto-generate candidate fixture
                         → human review required before merge
```

**Critical:** Auto-generated fixtures are CANDIDATES only. Human review + CI pass required before merge.

---

## 5. Telegram Integration

When Lumen detects a pattern, the reply includes:
```
⚠️ Pattern detected: [pattern_name]

Was this helpful?
[✅ Confirm] [❌ Not relevant] [🔴 False alarm]
```

Button mappings:
- ✅ Confirm → type: "confirm"
- ❌ Not relevant → type: "dismiss"  
- 🔴 False alarm → type: "fp"

FN (false negative) is only available via Dashboard (operator reports missed detection).

---

## 6. Implementation Files

| File | Purpose |
|------|---------|
| `api/feedback.js` | POST /api/feedback + GET /api/feedback/stats |
| `data/feedback.json` | Local storage (gitignored) |
| `data/feedback.schema.json` | JSON Schema for validation |
| `test/feedback.test.js` | Unit tests for feedback pipeline |
| `scripts/feedback-to-fixture.js` | Nightly: scan FP/FN → candidate fixtures |
