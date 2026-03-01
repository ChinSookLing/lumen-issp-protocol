# Lumen ISSP — Metrics & Iteration Specification
# Step 24A · M94-V5 Authorized

> **5 Core Metrics:** latency · TPFP · usage · feedback · uptime
> **Storage:** metrics.json (node-local) · SPEG compliant
> **Job:** Nightly aggregation script

---

## 1. Metrics Schema (metrics.json)

```json
{
  "version": "1.0.0",
  "node_id": "reference-render",
  "generated": "2026-02-28T03:00:00Z",
  "period": "24h",
  "metrics": {
    "latency": {
      "avg_ms": 45,
      "p95_ms": 120,
      "p99_ms": 250,
      "samples": 1024
    },
    "tpfp": {
      "true_positive": 42,
      "false_positive": 3,
      "false_negative": 1,
      "precision": 0.933,
      "recall": 0.977,
      "f1": 0.955
    },
    "usage": {
      "messages_processed": 1024,
      "patterns_detected": 46,
      "unique_chats": 15,
      "by_pattern": {
        "P01": 12,
        "P03": 8,
        "P05": 6
      }
    },
    "feedback": {
      "total": 10,
      "confirm": 7,
      "dismiss": 1,
      "fp": 2,
      "fn": 0,
      "response_rate": 0.217
    },
    "uptime": {
      "status": "healthy",
      "uptime_pct": 99.95,
      "last_restart": "2026-02-27T08:00:00Z",
      "health_checks_passed": 2880,
      "health_checks_failed": 0
    }
  },
  "history": []
}
```

---

## 2. Metric Definitions

| # | Metric | What it measures | Source | Alert threshold |
|---|--------|-----------------|--------|----------------|
| 1 | **Latency** | Detection pipeline response time | index.js timing | p95 > 500ms |
| 2 | **TPFP** | Detection accuracy (precision/recall/F1) | feedback.json + test results | F1 < 0.90 |
| 3 | **Usage** | Volume — messages, patterns, chats | Telegram adapter counters | N/A (informational) |
| 4 | **Feedback** | User signal quality | feedback.json | FP rate > 15% |
| 5 | **Uptime** | Node availability | /health endpoint | uptime < 99% |

---

## 3. Dashboard Integration

Dashboard shows:
- Real-time: latency (last 5 min avg) + uptime status
- Daily: TPFP chart + usage volume + feedback summary
- Alert banner if any threshold breached

---

## 4. Nightly Job

Runs at `METRICS_NIGHTLY_CRON` (default: 03:00 UTC).

Tasks:
1. Aggregate 24h latency samples → avg/p95/p99
2. Calculate TPFP from feedback entries
3. Count usage metrics from adapter logs
4. Append to history array (rolling 30 days)
5. Write metrics.json
6. Check alert thresholds → log warnings

---

## 5. Files

| File | Purpose |
|------|---------|
| `api/metrics.js` | GET /api/metrics endpoint + nightly job |
| `data/metrics.json` | Node-local metrics store (gitignored) |
| `data/metrics.schema.json` | JSON Schema for validation |
| `scripts/metrics-nightly.js` | Nightly aggregation script |
| `test/metrics.test.js` | Unit tests |
