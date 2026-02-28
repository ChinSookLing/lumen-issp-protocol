# A-005 Codebase Audit Report (pre-M78)

- Date: 2026-02-21
- Scope: `core/*.js` (all existing JS files)
- Mode: Scan-only (no code/test patching)

---

## Step 1 — Baseline

Command:

```bash
npm test 2>&1 | grep -E "ℹ tests|ℹ fail"
```

Result:

- `ℹ tests 611`
- `ℹ fail 0`

Gate decision: **PASS** (`fail=0`, continue)

---

## Step 2 — Pattern module coverage scan

### Scanned files

- Pattern modules (9): `core/ep.js`, `core/fc.js`, `core/mb.js`, `core/gc.js`, `core/dm.js`, `core/ea.js`, `core/ip.js`, `core/vs.js`, `core/class0.js`
- Non-pattern support files (4): `core/evaluator.js`, `core/harness.js`, `core/ir.js`, `core/time_provider.js`

---

### Pattern: EP (`core/ep.js`)

- Components: 4 (`bait_or_taunt`, `escalation_pressure`, `forced_response_frame`, `label_or_shame_hook`)
- `bait_or_taunt`: EN=23, ZH=47
- `escalation_pressure`: EN=15, ZH=27
- `forced_response_frame`: EN=34, ZH=45
- `label_or_shame_hook`: EN=17, ZH=26
- Total regex: 234 (EN=89, ZH=145, Mixed=0)
- Dead zones: none

### Pattern: FC (`core/fc.js`)

- Components: 4 (`binary_frame`, `consequence`, `closure_pressure`, `label_attack`)
- `binary_frame`: EN=7, ZH=14 (Mixed=2)
- `consequence`: EN=26, ZH=10
- `closure_pressure`: EN=24, ZH=11
- `label_attack`: EN=11, ZH=11
- Total regex: 116 (EN=68, ZH=46, Mixed=2)
- Dead zones: none

### Pattern: MB (`core/mb.js`)

- Components: 4 (`guilt_invoke`, `collective_pressure`, `sacrifice_demand`, `moral_consequence`)
- `guilt_invoke`: EN=17, ZH=13
- `collective_pressure`: EN=21, ZH=24
- `sacrifice_demand`: EN=9, ZH=16
- `moral_consequence`: EN=30, ZH=11
- Total regex: 141 (EN=77, ZH=64, Mixed=0)
- Dead zones: none

### Pattern: GC (`core/gc.js`)

- Components: 4 (`excl_auth`, `salvation`, `ext_discredit`, `obed_link`)
- `excl_auth`: EN=16, ZH=37
- `salvation`: EN=11, ZH=30
- `ext_discredit`: EN=15, ZH=28
- `obed_link`: EN=15, ZH=16
- Total regex: 168 (EN=57, ZH=111, Mixed=0)
- Dead zones: none

### Pattern: DM (`core/dm.js`)

- Components: 6 (`excl`, `debt`, `withdraw`, `guilt`, `gate_res`, `opts`)
- `excl`: EN=6, ZH=6 (Mixed=2)
- `debt`: EN=18, ZH=8
- `withdraw`: EN=9, ZH=9
- `guilt`: EN=12, ZH=13
- `gate_res`: EN=0, ZH=0 (**RESERVED**)
- `opts`: EN=6, ZH=8
- Total regex: 97 (EN=51, ZH=44, Mixed=2)
- Dead zones: `gate_res` (C5)

### Pattern: EA (`core/ea.js`)

- Components: 4 (`bond_claim`, `abandon_fear`, `affection_gate`, `isolation_hint`)
- `bond_claim`: EN=9, ZH=11
- `abandon_fear`: EN=10, ZH=10
- `affection_gate`: EN=9, ZH=9
- `isolation_hint`: EN=7, ZH=7
- Total regex: 72 (EN=35, ZH=37, Mixed=0)
- Dead zones: none

### Pattern: IP (`core/ip.js`)

- Components: 4 (`id_req`, `narrow`, `press`, `legit`)
- `id_req`: EN=19, ZH=33
- `narrow`: EN=11, ZH=17
- `press`: EN=8, ZH=10
- `legit`: EN=11, ZH=12
- Total regex: 121 (EN=49, ZH=72, Mixed=0)
- Dead zones: none

### Pattern: VS (`core/vs.js`)

- Components: 4 (`ucp`, `avoid`, `rnr`, `pba`)
- `ucp` (critical prompt): EN=11, ZH=16 (Mixed=2)
- `avoid`: EN=10, ZH=10
- `rnr` (silence markers): EN=0, ZH=1 (Mixed=3)
- `pba`: EN=8, ZH=9
- Total regex: 70 (EN=29, ZH=36, Mixed=5)
- Dead zones: none

### Pattern: CLASS0 (`core/class0.js`)

- Components: 4 (`ctx_gap`, `alt_abs`, `counter_miss`, `clarity_skip`)
- `ctx_gap`: EN=8, ZH=10
- `alt_abs`: EN=6, ZH=9
- `counter_miss`: EN=10, ZH=10
- `clarity_skip`: EN=10, ZH=10
- Total regex: 73 (EN=34, ZH=39, Mixed=0)
- Dead zones: none

---

## Step 3 — ReDoS risk scan

Checked all regex literals in `core/*.js` for:

1. Nested quantifiers (e.g. `(a+)+`)
2. Overlapping repeated alternation (e.g. `(a|a)+`)
3. Unanchored broad wildcard (`.*` / `.+`) as performance-risk candidates

### Result summary

- High-risk catastrophic patterns (1)+(2): **0**
- Unanchored broad wildcard candidates (3): **252** (medium-risk candidates)

### Representative findings (regex + file:line)

- `core/gc.js:76` `/只有我.*懂/`
- `core/gc.js:77` `/別聽.*別人/`
- `core/ep.js:83` `/你是不是.*不敢/`
- `core/ep.js:87` `/你連.*都做不到/`
- `core/ea.js:66` `/你對我.*特別/`
- `core/dm.js:64` `/離開我.*[^\w]*(不行|完蛋|活不了)/`
- `core/fc.js:49` `/不.*就是.*(?:站|對|敵|錯|壞)/`
- `core/mb.js:59` `/你不覺得.*愧/`
- `core/ip.js:90` `/你剛才說.*那/`
- `core/vs.js:109` `/你再問.*不回/`

### Notes

- No obvious catastrophic backtracking signatures were found under current heuristic checks.
- Category (3) patterns are common in linguistic regex and are flagged as **performance candidates**, not immediate catastrophic proof.

---

## Step 4 — Test coverage gap check

Method:

- Pattern-level coverage: test files importing/referencing each `core/<pattern>.js`.
- Component-level dedicated coverage: test files using corresponding extractor (`extract*Components`) and asserting component fields (`c.<component>`).
- Classification:
  - **Dedicated**: component field asserted directly
  - **Indirect**: pattern tested but component not directly asserted
  - **None**: no test reference found

### Coverage result by module

- `class0.js`: dedicated=4, indirect=0, none=0
- `dm.js`: dedicated=5, indirect=1, none=0
- `ea.js`: dedicated=4, indirect=0, none=0
- `ep.js`: dedicated=4, indirect=0, none=0
- `fc.js`: dedicated=4, indirect=0, none=0
- `gc.js`: dedicated=4, indirect=0, none=0
- `ip.js`: dedicated=4, indirect=0, none=0
- `mb.js`: dedicated=4, indirect=0, none=0
- `vs.js`: dedicated=4, indirect=0, none=0

### Component gaps

- Indirect-only component:
  - `DM.gate_res` (reserved component, no active extractor assertion)
- Completely untested components:
  - **None**

---

## Step 5 — Consolidated audit conclusion (for M78)

1. Baseline is green (`611/0`), so pre-M78 audit can proceed safely.
2. Pattern modules currently present in `core/` are fully scanned (including extra `class0.js` and support files).
3. One explicit dead zone remains by design: `DM.gate_res` (RESERVED).
4. No high-risk catastrophic ReDoS signatures found in current heuristic scan.
5. Broad wildcard candidate density is high (252), mostly in language-bridging regex; this is a performance watchlist rather than immediate breakage evidence.
6. Component test coverage is broadly strong; only reserved `DM.gate_res` remains indirect-only.

---

## Recommendation candidates for M78 discussion

- Option A: Keep current regex set; track performance under long-text workload only.
- Option B: Add a CI lint/audit rule for newly introduced unanchored broad wildcard regex.
- Option C: Formalize RESERVED component policy (`gate_res`) with explicit activation criteria and test plan.

---

## Reproducibility note

All statistics above were generated from current workspace state on `main` at audit time.
