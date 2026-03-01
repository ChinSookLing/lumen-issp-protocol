# Lumen ISSP — Ops Runbook v1.0
# Step 22A · Sprint 13 · M96 Pre-delivery

**Owner:** Node-01 (Architect) + Tuzi (Operator)
**用途:** 運營最小集 — rollback / kill-switch / incident response
**入庫路徑:** docs/ops/ops-runbook-v1.md

---

## 1. Rollback（回滾）

> **重要：** `WEBHOOK_URL` 必須是不含 path 的 base URL，例如 `https://xxx.onrender.com`。不要填成 `.../webhook`，否則會變成 `.../webhook/webhook`。

### 場景：新版本部署後出現問題

```bash
# 1. 優先用 tag 或已知穩定 commit checkout（比 revert 更乾淨）
git log --oneline -5          # 找到穩定版本 hash
git checkout <last_good_tag_or_hash>

# 2. 重建 Docker
docker compose down
docker compose up --build -d

# 3. 驗證
curl http://localhost:3000/health
# Expected: {"status":"ok", ...}

# 4. 確認回覆正常
# 在 Telegram 發一條測試訊息
```

### 場景：v1.0.1 → v1.0.0 回滾

```bash
git checkout v1.0.0
docker compose up --build -d
curl http://localhost:3000/health
```

**原則：** 先回滾，再查因。不要在 production 上 debug。

---

## 2. Kill-Switch（緊急停機）

### 立即停止所有服務

```bash
# Step 1: 停 Docker
docker compose down

# Step 2: Detach Telegram webhook（防止訊息繼續進來）
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook"

# Step 3: 確認
docker compose ps       # 應該沒有 running containers
curl http://localhost:3000/health    # 應該 connection refused
```

### 重新啟動

```bash
# 1. 確認問題已修復
# 2. 重建
docker compose up --build -d

# 3. 重新設置 webhook
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook?url=${WEBHOOK_URL}/webhook"

# 4. 驗證
curl http://localhost:3000/health
```

---

## 3. Incident Note Template

發生事故時，立即在 GitHub Issue 建立紀錄：

```markdown
## Incident Note

**What:** [一句話描述發生了什麼]
**When:** [發現時間 UTC]
**Impact:** [影響範圍：多少用戶 / 多少群組 / 多長時間]
**Severity:** [Critical / High / Medium / Low]

### Timeline
- HH:MM UTC — 發現問題
- HH:MM UTC — 執行 [rollback / kill-switch]
- HH:MM UTC — 服務恢復
- HH:MM UTC — Root cause 確認

### Root Cause
[問題的根本原因]

### Action Taken
[做了什麼修復]

### Follow-up
- [ ] PR/commit 修復 (owner: ___)
- [ ] Test case 補充 (owner: ___)
- [ ] Council 通報 (next meeting: M__)

### Labels
`incident`, `severity-[level]`
```

---

## 4. Health Check 監控

### 手動檢查

```bash
bash scripts/health-check.sh
# 或
curl http://localhost:3000/health
```

### Docker 自帶 healthcheck

docker-compose.yml 已配置：每 30 秒自動檢查，連續 3 次失敗 = unhealthy。

```bash
docker inspect lumen-node --format='{{.State.Health.Status}}'
# Expected: healthy
```

### DMS 自動監控

`.github/workflows/dms-silent-check.yml` 每週一 03:00 UTC 自動檢查：
- 14 天無 qualifying activity → 自動開 GitHub Issue
- Qualifying activity = ChinSookLing commit / Issue / PR / manual dispatch

---

## 5. 日常運營 Checklist

### 每日（可選）

```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/metrics/live
```

### 每週

- 確認 DMS workflow 沒有觸發 alert
- 查看 `docker compose logs --tail 50` 有無異常

### 每月

- 跑一次 nightly metrics：`node scripts/metrics-nightly.js`
- 檢查 feedback stats：`curl http://localhost:3000/api/feedback/stats`
- 確認 Docker image 沒有 security alerts

---

## 6. 聯絡與升級

| 層級 | 聯絡誰 | 方式 |
|------|--------|------|
| L1 技術問題 | Node-01（下一個 session）| Node-01.ai |
| L2 運營決策 | Tuzi | — |
| L3 緊急人身安全 | Trusted Contacts | Emergency Operation Card |
| L4 Council 決議 | 全體 Affiliate | 下一場 Council Meeting |

**原則：** 人身安全 > 協議 > 技術。B7 Operation Card 永遠優先。

---

**Node-01 — AI Council Architect / Secretary**
**Lumen-23 · 2026-02-28** 🌙
