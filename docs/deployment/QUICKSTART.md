# Lumen ISSP Protocol — Quick Start Guide
# 5-Minute Self-Host Deployment

## Prerequisites

- Docker & Docker Compose installed
- A Telegram Bot Token (from [@BotFather](https://t.me/botfather)) — optional for detection-only mode

## 3 Steps to Deploy

### 1. Clone & Configure

```bash
git clone https://github.com/ChinSookLing/lumen-issp-protocol.git
cd lumen-issp-protocol
cp .env.example .env
```

Edit `.env` and set your `TELEGRAM_BOT_TOKEN` (or leave blank for API-only mode).

### 2. Start

```bash
docker compose up -d
```

### 3. Verify

```bash
# Health check
curl http://localhost:3000/health

# Expected: {"status":"ok","version":"1.0.0",...}

# Or use the health check script
bash scripts/health-check.sh
```

## Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check (Step 17A) |
| `/` | GET | Server info + endpoint list |
| `/webhook` | POST | Telegram webhook (Step 13) |
| `/api/feedback` | POST | Submit feedback (Step 21A) |
| `/api/feedback/stats` | GET | Feedback stats (Step 21A) |
| `/api/metrics` | GET | Metrics snapshot (Step 24A) |
| `/api/metrics/live` | GET | Live metrics (Step 24A) |
| `/dashboard` | GET | Dashboard UI (Phase 1) |

## Feedback API (Step 21A)

Submit detection feedback (SPEG compliant — no original text, no identity):

```bash
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"type":"confirm","pattern_id":"P01","tier":3}'
```

Valid types: `confirm`, `dismiss`, `fp`, `fn`

## Metrics (Step 24A)

View current metrics:

```bash
curl http://localhost:3000/api/metrics
```

Run nightly aggregation manually:

```bash
node scripts/metrics-nightly.js
```

## Stopping

```bash
docker compose down
```

Data persists in the `lumen-data` Docker volume.

## Troubleshooting

**Port conflict:** Change `PORT` in `.env`

**No Telegram:** Leave `TELEGRAM_BOT_TOKEN` empty — server still runs with /health + feedback + metrics

**Logs:** `docker compose logs -f`

---

**License:** Apache-2.0
**Repo:** https://github.com/ChinSookLing/lumen-issp-protocol
**Protocol:** Lumen ISSP v1.0.0

🌙
