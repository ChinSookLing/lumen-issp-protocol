# Lumen ISSP — Step 16 Launch Checklist v1.0
# Protocol Launch Acceptance Criteria

**狀態：** DRAFT — 待 M94 投票凍結（V2 D-class）
**Owner：** Node-01 (Architect)
**日期：** 2026-02-28

---

## Purpose

Step 16 是 Lumen Protocol 的 Launch gate。以下 7 項條件必須全部 PASS，才能宣布 v1.0 Protocol Launch。每一項都是可驗收的工程條款，不是口號。

---

## Checklist

| # | 條件 | 驗收方式 | 狀態 |
|---|------|---------|------|
| 1 | `docker compose up` 成功啟動 | Terminal 輸出 "Lumen Telegram Bot listening on port" | ⏳ |
| 2 | `/health` 回傳 200 OK | `curl localhost:3000/health` → "Lumen ISSP Node — OK" | ⏳ |
| 3 | Demo fixture 一鍵跑出 output triple | `node scripts/demo.js` → event + detection + output JSON | ⏳ |
| 4 | README 首屏含責任邊界（中英） | `head -30 README.md` 可見 §2.10 三句框架 | ✅ c204 |
| 5 | Public clean repo 脫敏完成 | `grep -r "BOT_TOKEN\|api\.telegram" --include="*.js" src/` 無硬編碼 secrets | ⏳ |
| 6 | CI 全綠（`npm test` 0 fail） | GitHub Actions badge green | ✅ c203 |
| 7 | CHANGELOG v1.0 存在 | `cat CHANGELOG.md` 含 v1.0 release notes | ⏳ |

---

## Pre-Launch Dependencies

| 依賴 | 來源 | 狀態 |
|------|------|------|
| L2b-lite 3 flags 接線 | c203 | ✅ |
| simple_advice templates | c201 | ✅ |
| B1-B8 Charter patches | c200 | ✅ |
| continuity.md | c204 | ✅ |
| Tabletop Drill (至少 rehearsal) | 3/10 | ⏳ |
| Trusted Contact ≥1 | B7 | ✅ 1/2 |

---

## Launch Day Procedure

1. Tag: `git tag -a v1.0.0 -m "Lumen ISSP Protocol Launch"`
2. Push tag: `git push origin v1.0.0`
3. Create GitHub Release with CHANGELOG excerpt
4. Verify Docker deployment: `docker compose up -d && curl localhost:3000/health`
5. Verify Telegram bot: send test message, confirm pipeline response
6. Council announcement: Secretary posts Launch statement to all Affiliates
7. README badge update: `v1.0.0` release badge

---

## Blockers

Any item marked ⏳ above is a blocker. All must be ✅ before Launch.

---

**Node-01 — AI Council Architect / Secretary**
**Step 16 Launch Checklist v1.0 DRAFT**
**2026-02-28** 🌙
