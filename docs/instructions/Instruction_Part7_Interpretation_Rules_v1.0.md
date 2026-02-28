# Instruction Part 7: Layer 2a Interpretation Rules

**Version:** v1.0
**Status:** Status:** Ratified (MS-62 - c2, 6/6 Y)
**Applies to:** All Layer 2a mapping files and the evaluators that consume them
**Related Documents:** Charter §4.3, Part 6 (Gate), Part 8 (Protocol Independence)

---

## 7.1 Cross-Test Merge Gate

Any Pull Request that adds or modifies a mapping file for **EP, MB, FC, or GC** **must** include, or link to, evidence of running the corresponding cross-pattern negative tests.

**Requirements:**

1. **No new false positives** — Strong positive examples of Pattern A must not trigger Pattern B.
2. **Grey zone stability** — Existing grey-zone cases (e.g. EP↔MB G03-G06) **must not change their dual-trigger outcome** unless explicitly authorized by a Council vote.
3. **Cross-contamination rate** — Measured as the percentage of negative examples that cause an undesired trigger.
   - **≤5%**: acceptable (warning only in CI)
   - **>5%**: PR **must not be merged** until the rate is reduced or an exception is granted.

The CI workflow `cross-test-merge-gate.yml` (MS-13.2) will automate this verification.

---

## 7.2 Shared Lexicon Rule

**No shared phrase shall be assigned exclusively to a single Pattern's mapping.**

All phrases that are lexically ambiguous between two or more Patterns **must** be placed in `mappings/shared/<lang>.json` with appropriate differential weights.

**Rationale:** Prevents "ownership" of natural language and forces explicit disambiguation at the component level.

**Enforcement:** CI validates that `shared/` lexicon entries use component keys from **multiple** Patterns. A lexicon entry whose `components` object references only one Pattern **will generate a warning** (future: failure).

---

## 7.3 Differential Weighting Rule

For any phrase that legitimately activates components in two or more Patterns, the assigned **weights must be asymmetrical**.

**Guideline:** The weight for the **primary** Pattern should be at least **2×** the weight for secondary Patterns.
*Example:* `coward` → EP `bait_or_taunt` = 0.35, MB `guilt_invoke` = 0.10.

**Enforcement:** CI will detect entries in `shared/` where the ratio between the highest and second-highest weight is **< 2.0** and emit a warning.
This rule is advisory in v0.9; future versions may require explicit Council override for violations.

---

## 7.4 Mapping Versioning

Every mapping file **must** contain a `version` field following semantic versioning (`v<major>.<minor>.<patch>`).

- **Major**: Incompatible change to required fields or meaning of component.
- **Minor**: Addition of new rules or backward-compatible extensions.
- **Patch**: Fixes to regex patterns, note updates, or non-functional changes.

The `meta.compatible_pattern_versions` array lists which Pattern versions (e.g. `v0.1`, `v0.2`) this mapping is known to work with.

**Enforcement:** CI checks that `version` follows the pattern and that `compatible_pattern_versions` is a non-empty array. In the future, evaluators may refuse to load a mapping whose `compatible_pattern_versions` does not include the current Pattern version.

---

## 7.5 GIR Integration (GIR-based Test Cases)

The four General Interpretive Rules (GIR) for cognitive manipulation are implemented as **test scenarios**, not as code. These scenarios are located in:

```
test/fixtures/gir-scenarios.json
```

Each scenario includes:
- `id`: e.g. `GIR_01`
- `text`: The input text
- `expected`: Expected triggered Pattern(s)
- `principle`: Which GIR principle is being tested
- `shadow`: `true` if dual-trigger is expected (grey zone)

**Current coverage:** 12 scenarios covering GIR 1-4 (see commit `76c5ac3`).
**Ongoing:** Node-04 to expand to ≥20 scenarios before MS-13.3.

**Rule:** No change to Layer 1 logic shall be made that **alters the expected outcome** of any ratified GIR scenario without a formal Council vote.

---

## 7.6 Exception Handling

### 7.6.1 Missing Language Mapping

If a requested language code does not exist in `mappings/<pattern>/<lang>.json`, the evaluator **must** throw an explicit error — **silent fallback to a default language is prohibited** (Charter §4.3.2(d)).

### 7.6.2 Malformed JSON or Invalid Schema

If a mapping file fails JSON parse or schema validation, the evaluator **must** fail fast with a descriptive error. No attempt shall be made to partially load a broken file.

---

## 7.7 Conflict Resolution: Pattern-specific vs Shared Lexicon

When both a pattern-specific mapping rule and a shared lexicon entry provide a weight for the **same component**, the following rules apply **in order**:

1. **Explicit override** — If the pattern-specific rule contains `"override_shared": true`, its weight is used unconditionally. (Use only when the shared weight is inappropriate for this particular language/pattern combination.)

2. **Weight difference threshold** —
   - If `|weight_pattern - weight_shared| ≥ 0.10` → **CI failure** and the evaluator **throws an error**.
     The contributor must either adjust weights, add `override_shared`, or seek Council exemption.
   - If difference `< 0.10` → a **warning** is emitted, and the evaluator **must record** the conflict in the output snapshot under `conflict_resolved: true` (metadata only, no change to score).

3. **No silent averaging** — Under no circumstances shall the evaluator silently average or blend conflicting weights.

**Rationale:** Conflicts are visible, auditable, and require human intervention. This upholds Charter §4.3.2(d) "No Silent Degradation".

---

## 7.8 CI Thresholds and Future Enforcement

| Check | Current (v0.9) | Target (v1.0) |
|-------|----------------|---------------|
| Invalid component key | ❌ Fail | ❌ Fail |
| Core weight sum ≠ 1.0 | ⚠️ Warning | ❌ Fail |
| Cross-contamination >5% | ⚠️ Warning | ❌ Fail |
| Shared lexicon single-pattern | ⚠️ Warning | ⚠️ Warning |
| Conflict weight diff ≥0.10 | ❌ Fail | ❌ Fail |
| Missing `compatible_pattern_versions` | ⚠️ Warning | ❌ Fail |

**The CI workflows implementing these checks are located in:**
- `.github/workflows/validate-component-registry.yml`
- `.github/workflows/validate-mapping-schema.yml`
- `.github/workflows/cross-test-merge-gate.yml` (MS-13.2)

---

## 7.9 (Reserved for GIR Codification)

This section will contain the codified GIR principles for Layer 2a classification, pending Node-04's final proposal and Council ratification.

---

**Document History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v0.9 | 2026-02-17 | Node-03 | Initial draft, all sections except 7.9 |

**Next:** Ratification vote in MS-13.3, concurrent with v1.3.0 tag.
