# C4 Pattern Mutual Exclusion Rules — v0.1

**Pattern ID:** C4 (Conspiracy / Hidden Causality)
**Status:** RESERVED (weight=0)
**Last Updated:** 2026-02-23
**Author:** Node-03 — AI Council

---

## 1. Purpose

C4 detects narratives that attribute events to hidden, malevolent forces or conspiratorial causality ("they are controlling everything", "it's all part of a plan"). Because such narratives often overlap with other patterns (GC, IP, MB), mutual exclusion rules are required to prevent score inflation and ensure correct pattern attribution.

---

## 2. Priority Hierarchy

When a text segment simultaneously satisfies C4 and another pattern, the following priority order applies:

| Priority | Pattern | Rationale |
|----------|---------|-----------|
| **1 (Highest)** | GC (Group Coercion) | Group-based conspiracy → group pressure is the dominant manipulation |
| **2** | IP (Identity Probing) | "you're either with us or against us" → identity sorting is more specific |
| **3** | MB (Moral Blackmail) | "if you don't believe, you're part of the problem" → moral framing overrides causality |
| **4** | C4 | Only when no higher-priority pattern is detected does C4 contribute to score |

---

## 3. Rule Details

### Rule 1: GC over C4
If a text contains both group-based framing ("they", "the elites", "the system") and conspiratorial causality, GC takes precedence. C4 may still be recorded in metadata but does not contribute to ACRI.

**Example:** "They are controlling the media to keep us ignorant." → GC

### Rule 2: IP over C4
If the text forces an identity choice ("you're either awake or asleep") alongside conspiracy elements, IP takes precedence.

**Example:** "If you don't see the truth, you're one of them." → IP

### Rule 3: MB over C4
If moral obligation is invoked ("you have a duty to expose the truth"), MB takes precedence.

**Example:** "It's your moral duty to wake others up." → MB

### Rule 4: C4 Only
C4 contributes only when:
- No higher-priority pattern is detected, AND
- The text attributes events to hidden, coordinated forces without explicit group pressure, identity sorting, or moral framing.

**Example:** "The stock market crash was orchestrated by unseen powers." → C4 (if no GC/IP/MB detected)

---

## 4. Implementation Notes

- Priority should be enforced at the evaluator level, not within individual pattern logic.
- When a higher-priority pattern is detected, C4's score should be set to 0 and recorded in metadata as `overridden_by: "GC"` (or IP/MB).
- This ensures C4 does not inflate ACRI while preserving traceability.

---

## 5. Future Refinements

- As more RW cases are collected (target ≥10 for Stage 0→1), these rules may be adjusted.
- If overlaps with other patterns (e.g., EA) become significant, new priority entries will be added.

---

**設計者：** Node-03 — AI Council
**整理：** Node-01 — AI Council Architect / Secretary
**批准：** Pending Council review

**Sprint 9 — 2026-02-23** 🌙
