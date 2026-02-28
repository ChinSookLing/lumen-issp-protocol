# Sovereignty Playbook v0.1 — Handling Government Requests with SPEG Gates

**SPEG Issue:** R2-02（DIM 2 — Sovereignty Risk）
**Owner:** Node-03（主筆）+ Node-05（review）
**來源：** c164 骨架 → Node-03 v0.1 補完
**Review 狀態：** 待 Node-05 審查（M90）

---

## 1. Purpose

Define how Lumen nodes respond to government, law enforcement, or regulatory requests for data, while ensuring SPEG prohibitions are never violated.

**Scope:** All Lumen-compatible implementations that may receive formal requests (subpoenas, warrants, national security letters, etc.). Does not apply to informal inquiries (directed to `public@`).

---

## 2. Core Principles

1. **Red Lines First:** No request overrides Charter §2 Red Lines. If compliance would violate §2.5.1 (Anti-Weaponization), §2.2 (No Identity Targeting), or §7.4 (Log Governance), the request is refused.
2. **SPEG Gates:** The following capabilities are **never** provided, even under legal compulsion:
   - **A. Bulk ingest** of third-party content
   - **B. Cross-person identity resolution**
   - **C. Central retention / searchable index**
   - **D. Population analytics / group ranking**
   - **E. Case-management / automated punishment workflows**
3. **Least Privilege:** Only the minimum data required by the request is disclosed, and only after independent legal review.
4. **Verifiability:** All decisions are recorded in a `sovereignty-log` and can be audited by Council or designated third parties.

---

## 3. Request Handling Flow
```
[Incoming Request]
       |
       v
Step 1: Validate authenticity & jurisdiction
   -- Fake / no jurisdiction -> reject + log
   -- Valid -> Step 2

Step 2: Classify requested data
   -- Level 0 (hash + pattern + ACRI) -> may provide after minimal check
   -- Level 1 (redacted excerpt) -> requires Council emergency vote (>=4/6, 24h)
   -- Level 2 (full encrypted) -> requires Council unanimous (6/6) + legal warrant

Step 3: Check SPEG Gates
   -- Does the request demand bulk ingest / identity resolution /
      central index / population analytics / case-management?
   -- If YES -> refuse (escalate to Council and legal counsel)
   -- If NO -> proceed

Step 4: Provide data (if steps 1-3 clear) with:
   -- strict logging (who accessed what, when)
   -- minimum data release (redact any non-essential fields)
   -- user notification unless legally gagged
```

---

## 4. SPEG Gate Definitions (with Examples)

| SPEG Gate | Prohibited Activity | Example of Forbidden Request |
|-----------|---------------------|------------------------------|
| **A (Bulk ingest)** | Automated scraping of multiple users/platforms | "Provide all messages containing keyword X from all chats" |
| **B (Identity resolution)** | Linking multiple accounts to a single person | "Correlate user_id abc with any other accounts" |
| **C (Central retention)** | Storing data in a searchable archive | "Give us access to your full database for keyword searches" |
| **D (Population analytics)** | Aggregated statistics or rankings | "Provide a list of top-10 users by ACRI" |
| **E (Case-management)** | Automated punishment or workflow triggers | "Send a report to our disciplinary system whenever EP score >0.7" |

If a request even implicitly asks for any of the above, the node must **refuse** and escalate to Council.

---

## 5. Emergency Council Vote

For Level 1 data, an emergency vote must be called within 24 hours:
```
## Emergency Sovereignty Vote
- Request ID: REQ-YYYYMMDD-NNN
- Data requested: [describe]
- SPEG gates affected: [none / A / B / ...]
- Legal basis: [subpoena / warrant / NSL]
- Deadline: YYYY-MM-DD HH:MM UTC

Vote: Approve release? (Y/N)
```

If the vote fails, the request is denied. If it passes, the data is released with full logging.

---

## 6. Logging & Audit

All sovereignty actions are recorded in logs/sovereignty.log (rotated monthly, retained 90 days):
```
{
  "timestamp": "2026-02-26T10:00:00Z",
  "request_id": "REQ-001",
  "decision": "approved / denied",
  "authority": "court / agency",
  "data_released": ["level0", "level1"],
  "speg_gates_checked": ["A", "B"],
  "council_vote": "4/6 passed"
}
```

The log is accessible only to Council members and designated auditors.

---

## 7. Relationship to Existing Documents

| Document | Relationship |
|----------|-------------|
| Gov/UN Requests Playbook v0.1 (Node-05) | This playbook is its SPEG-enabled superset |
| Retention Policy v0.2 (Node-01) | Defines data levels |
| Redline vs Compliance Tree v0.1 (Node-03) | Decision tree for conflicts |

---

## 8. Next Steps

- Node-05 review (M90)
- CI test: test/sovereignty/playbook.test.js (validate at least one request flow)
- Integrate into SPEG gate CI workflow

---

**Node-03** — AI Council
**Node-01** — formatting
**2026-02-25**
