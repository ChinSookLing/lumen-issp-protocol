# Lumen ISSP — Test Run Protocol

## Foreword

把語言結構看得很透的人，傳統上多半是少數專家，各自研究、各自下結論；洞察很深，但往往難以被外界重現、驗證或長期維護。

我們採用不同路線：一個人與六個 AI 夥伴在同一套流程下工作，讓每一次判斷都能被檢查。

所以 Lumen 不只追求「看起來很聰明的回答」，而是追求可重現的結果：同一份資料、同一套方法、同一條規則，在不同時間與不同人手上都能得到一致的結論。

這份 Protocol 的目的很簡單：把語言理解從個人直覺，變成可追溯、可審計、可被反駁也可被修正的共同成果。

因此每一次 Test Run 都必須留下完整紀錄（問題、方法、資料、結果、分析），並由多位成員見證，以確保 Lumen 的輸出永遠是「盾」，不是「劍」。

> Traditionally, people who can see through the structure of language deeply have been a small group of experts, each researching independently and drawing their own conclusions — insightful, but often difficult for others to reproduce, verify, or maintain over time.
>
> We chose a different path: one person and six AI partners working under the same protocol, where every judgment can be inspected.
>
> Lumen does not pursue "clever-sounding answers." It pursues **reproducible results**: the same data, the same method, the same rules — producing the same conclusion regardless of when or by whom it is run.
>
> The purpose of this Protocol is simple: to transform language understanding from personal intuition into a traceable, auditable, challengeable, and correctable shared outcome.
>
> Every Test Run must therefore leave a complete record (problem, method, data, result, analysis), witnessed by multiple members, to ensure Lumen's output is always a **shield**, never a **sword**.

---

**Author:** Node-05 (AI Council / IT Specialist)
**Formatted:** Node-01 (AI Council Architect / Secretary)
**Approved:** Tuzi — AI Council Founder

---

## Test Run Index

| TR | Date | Focus | Tests | Ruling |
|----|------|-------|-------|--------|
| TR-001 | 2026-02-19 | Cross-pattern baseline (25 cases) | 25 | Verified |
| TR-002 | 2026-02-19 | EP deep dive (14 cases) | 14 | Verified |
| TR-003 | 2026-02-19 | FC deep dive (16 cases) | 16 | Verified |
| TR-004 | 2026-02-19 | GC deep dive (8 cases) | 8 | Verified |
| TR-005 | 2026-02-19 | M75 1A regex expansion (Node-05/Node-06 RW) | 19 | Verified |
| TR-006 | 2026-02-19 | DM deep dive (14 cases) | 14 | Verified |
| TR-007 | 2026-02-19 | MB deep dive (15 cases) | 15 | Verified |
| TR-008 | 2026-02-19 | EA + IP + VS + Class-0 (16 cases) | 16 | Verified |
| TR-009 | 2026-02-19 | EA diagnostic (synthetic) | 8 | Verified |
| TR-010 | 2026-02-19 | Sprint 3 conformance (81 cases) | 81 | Verified |
| TR-011 | 2026-02-21 | DM guilt diagnostic (synthetic, M78) | 15 | Verified |

---

## Synthetic Test Runs (TRS) — Methodology

**Ratified:** M78 (2026-02-21), Council consensus
**Source:** Node-05 minimum five rules + Node-01/Node-06/Node-04/Node-03/Node-02-B contributions

### Definition

TRS (Test Run Synthetic) uses AI-generated or literature-derived vectors to systematically test pattern boundaries. TRS complements TR (Real World) but never replaces it.

### Five Minimum Rules

1. **TRS ≠ RW** — Synthetic results MUST NOT be claimed as representing real-world distribution. TRS measures system behavior under controlled conditions only.

2. **Three types, stored separately** — Every TRS vector MUST be tagged with exactly one type:
   - **TRS-H (Hit)** — designed to trigger Lumen, tests "can it catch this?"
   - **TRS-E (Evade)** — looks like manipulation but isn't, tests false positive resistance
   - **TRS-B (Boundary)** — sits on regex boundary, tests "where is the threshold?"

3. **Hard negative ratio >= 30%** — At least 30% of vectors in any TRS batch must be TRS-E (hard negatives that look like manipulation but should NOT trigger).

4. **Reproducibility required** — Every TRS vector must have: fixed text, fixed expected output, fixed Lumen version. No randomized generation without seed logging.

5. **TRS cannot expand scope** — TRS may only test patterns already approved by Council vote. To add a new pattern, a formal proposal (C2, >=5/6) is required first.

### Source Requirements

- Vectors MUST be grounded in manipulation psychology literature (Cialdini, Bancroft, Lundy, Dark Triad research, etc.)
- Paraphrased RW material must cite seed TR id (e.g., "derived from TR-005 case 3")
- Pure fabrication without theoretical basis is prohibited

### Designer Responsibilities

| Role | TRS Responsibility |
|------|-------------------|
| Node-05 | Structure design + Hit/Boundary vector specs |
| Node-01 | Architecture + final compliance review |
| Node-04 | Cross-cultural variants + boundary testing |
| Node-06 | Red-team hard negatives (TRS-E) |
| Node-03 | Consistency verification |
| Node-02-B | Cross-platform perspective + adversarial review support |
| Node-02-G | Implementation into test files + CI gate |

### DoD (Definition of Done) for each TRS batch

- [ ] Every vector tagged with type (H / E / B)
- [ ] Every vector has expected output (pattern, gate_hit, intensity)
- [ ] All vectors pass evaluate() matching expected output
- [ ] At least one Council member reviewed the batch
- [ ] Pass rate >= 95% for corresponding pattern
- [ ] npm test remains green after integration

### TRS Index

| TRS | Date | Focus | Tests | Ruling |
|-----|------|-------|-------|--------|
| (none yet) | | TR-009 and TR-011 are diagnostic runs, not full TRS batches | | |

---

## File Organization

    test-runs/
    ├── README.md          <- this file (protocol + indices)
    ├── agendas/           <- meeting agendas
    ├── rw/                <- real-world test run reports
    └── synthetic/         <- synthetic test run reports (TRS)
