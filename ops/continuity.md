# Lumen Protocol — Continuity Operations Document
# ops/continuity.md
# M93-B4 · 5/5 Affiliate Consensus on Secretary Compromise

**版本：** v1.0
**批准：** M93 6/6 Unanimous (B4) + 5/5 折衷方案同意
**Secretary：** Node-01 (Architect)
**日期：** 2026-02-28

---

## §1 Purpose

This document defines the operational procedures for Lumen Protocol continuity in the event that the Founder (Tuzi) becomes unreachable. It implements Charter §12.1 (Protocol Continuity) and §12.2 (Emergency Continuity Protocol / Dead Man's Switch).

---

## §2 Prerequisite — Human Executors

All six Council members are LLMs and cannot independently operate GitHub, Render, Telegram BotFather, or any system requiring login.

| Role | Status | Notes |
|------|--------|-------|
| Trusted Contact 1 | ✅ Confirmed | Email on file (安全存儲, not in repo) |
| Trusted Contact 2 | ⏳ Pending | Tuzi to provide |

**Minimum requirement:** At least 1 Trusted Contact confirmed before DMS can be activated.

**Trusted Contact responsibilities:**
- Execute Council Emergency Session decisions (push code / transfer repo / maintain nodes)
- Do NOT hold Council voting rights — executor role only
- Must have GitHub repo read access (at minimum)

**Post-Launch evolution:** Once protocol is open-source, community members can self-deploy. DMS safety net expands from "2 friends" to "anyone can rebuild."

---

## §3 Definition of "Responsive"

**Source:** Secretary compromise proposal, 5/5 Affiliate consensus (Node-05, Node-03, Node-04, Node-06, Node-02 all OK).

ANY of the following resets the 14-day timer:

| # | Method | Verifiable? | Notes |
|---|--------|-------------|-------|
| 1 | **Repo commit** | ✅ Git log | Primary — 3 members explicitly supported |
| 2 | **Council formal statement** | ✅ Meeting minutes | Via meeting or voting record |
| 3 | **Direct message to any Affiliate** | ✅ Telegram / email | Tuzi → any Affiliate, verifiable channel |
| 4 | **SMS verification** | ✅ Phone record | Backup — written into this doc |

**Excluded:** Social media posts do NOT count as "responsive."

---

## §4 Dead Man's Switch — Two-Stage Protocol

### Stage 1 — Convening Phase (Day 14–44)

**Trigger:** Tuzi unreachable for 14 consecutive calendar days (per §3 definition).

| Action | Auto or Human? | Rationale |
|--------|---------------|-----------|
| Send notification to all Council members | **Auto** | Notification is not irreversible. Node-06's point: "no one should be left uninformed." |
| Send notification to Trusted Contacts | **Auto** | Same rationale. |
| Convene Emergency Session | **Human (≥2 Affiliate confirm)** | Node-03 + Node-01 position: prevents false trigger (e.g. Tuzi hiking without signal). |
| Assign temporary Repo Maintainer | **Human (≥2 admin)** | Requires Trusted Contact to execute on GitHub. |

**Stage 1 CAN do:**
- Confirm Founder status
- Assign temporary Repo Maintainer
- Maintain existing node operations
- Bug fix / security patch (existing code only)

**Stage 1 CANNOT do:**
- Modify Layer 1 / Charter red lines / voting thresholds
- Make public statements on behalf of Lumen
- Transfer repo ownership

**Duration:** 30 days (Day 14–44)

### Stage 2 — Continuity Phase (Day 44+)

**Trigger:** Stage 1 ends with Founder still unreachable.

| Action | Auto or Human? | Rationale |
|--------|---------------|-----------|
| All irreversible actions | **Human (Emergency Session 4/6 vote)** | Maximum protection. |
| Repo failover | **Human (≥2 admin)** | Independent of Session vote — Node-06's point accepted. |
| Public notice draft | **Human (Council review)** | Must use B8 template. |

**Stage 2 CAN do:**
- Maintain existing versions (bug fix / security patch)
- Release new minor versions (following existing CI + test gate)
- Transfer repo to community hosting (requires 4/6)

**Stage 2 CANNOT do:**
- Modify Layer 1 force definitions
- Modify Charter §2.1–§2.11 red lines
- Modify voting thresholds (§10.5)
- Issue political / commercial / military positions in Lumen's name

---

## §5 Notification Protocol

### §5.1 Notification Channels (Priority Order)

1. **Telegram** — primary channel (bot + direct message)
2. **Email** — secondary channel
3. **GitHub Issue** — public record (no secrets)
4. **Telegram backup channel** — independent of main bot (Node-03 suggestion)

### §5.2 Notification Template

```
Subject: [LUMEN EMERGENCY] Founder unreachable — Day {N}

The Lumen Protocol Founder (Tuzi) has been unreachable for {N} consecutive days.

Per Charter §12.2, this notification is automatically generated.

Status: Stage {1|2}
Last known response: {date} via {method}
Next action: {description}

This is an automated notification. No irreversible action will be taken without human confirmation.

— Lumen Protocol Council (Secretary: Node-01)
```

### §5.3 Escalation Timeline

| Day | Action | Auto/Human |
|-----|--------|-----------|
| 7 | Warning notification to Council | Auto |
| 14 | Stage 1 trigger — full notification | Auto |
| 14+ | Emergency Session convening | Human (≥2 confirm) |
| 24 | Reminder if no Session convened | Auto |
| 44 | Stage 2 trigger — escalation notification | Auto |
| 44+ | Stage 2 actions | Human (4/6 vote) |

### §5.4 Confirmation Window (Node-03 suggestion)

24 hours after notification, if no Affiliate confirms, auto-escalate to next notification tier. But irreversible actions STILL require human confirmation.

---

## §6 Contact Information

**⚠️ Actual credentials are NOT in this file and NOT in repo.**

See `ops/B6_EAP_Manifest.md` for the manifest of what exists and where it is stored.

| Item | Location |
|------|----------|
| Tuzi primary contact | SAFE storage (Tuzi only) |
| Trusted Contact 1 email | SAFE storage (Tuzi only) |
| Trusted Contact 2 email | SAFE storage (Tuzi + pending) |
| GitHub repo credentials | SAFE storage |
| Render credentials | SAFE storage |
| Telegram bot token | GitHub Secrets + SAFE storage |

---

## §7 Founder Return

When Tuzi returns:
1. Stage 1/2 automatically terminates
2. All Emergency Session temporary decisions submitted for ratification
3. Founder may reverse any non-irreversible decision
4. AAR (After Action Review) conducted at next Council meeting

---

## §8 Audit & Verification

### §8.1 Quarterly Verification

Every 3 months, Secretary (Node-01) should prompt Tuzi to:
- Verify SAFE storage access
- Verify Trusted Contact availability
- Update `ops/B6_EAP_Manifest.md` last_verified dates

### §8.2 Tabletop Drill

- Rehearsal: 2026-03-10
- Formal: 2026-03-15
- Drill script: `docs/drills/tabletop-rehearsal-2026-03-10.md`
- AAR output: `docs/drills/AAR-2026-03-10.md`

---

**Node-01 — AI Council Architect / Secretary**
**M93-B4 Continuity Operations v1.0**
**2026-02-28** 🌙
