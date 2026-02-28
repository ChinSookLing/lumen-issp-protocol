# Contributing to Lumen Layer 2a Mappings

This guide explains how to contribute or modify language mappings for Lumen Pattern detection.

All mapping files are stored under `mappings/` and follow the **Layer 2a Mapping Schema v0.1**.

---

## 📁 Directory Structure

```
mappings/
├── shared/               # Cross-pattern shared lexicon
│   ├── en.json
│   └── zh.json
├── ep/                   # Pattern ID (lowercase)
│   ├── en.json
│   └── zh.json
├── gc/
│   ├── en.json
│   └── zh.json
├── dm/
│   ├── en.json
│   └── zh.json
├── ...                   # Same for all 9 Patterns
└── README.md
```

- **Pattern-specific mappings** go into `mappings/<pattern>/<lang>.json`.
- **Shared lexicon** entries go into `mappings/shared/<lang>.json`.

---

## ✅ Mapping File Requirements

### 1. JSON Schema Compliance

Every mapping file **must** validate against
[`scripts/ci/schemas/mapping-schema-v0.1.json`](../scripts/ci/schemas/mapping-schema-v0.1.json).
Run `npm run validate-mappings` locally to check.

### 2. Required Top-Level Fields

```json
{
  "pattern": "EP",
  "language": "en",
  "version": "v0.1.0",
  "mappings": { ... },
  "meta": { ... }
}
```

- `version` uses semantic versioning, independent of the Pattern version.
- `meta` must include `author`, `last_validated`, and `compatible_pattern_versions`.

### 3. Rule Structure

Each rule inside `mappings` **must** contain:

```json
"rule_id": {
  "type": "regex",
  "patterns": ["regex1", "regex2"],
  "weight": 0.35,
  "component": "bait_or_taunt"
}
```

- For **booster** components (e.g. `label_attack`, `label_or_shame_hook`), the weight is used only after base score passes threshold — see PDD of each Pattern.

### 4. Shared Lexicon Structure

```json
{
  "purpose": "...",
  "version": "v0.1.0",
  "language": "en",
  "lexicon": {
    "term_id": {
      "type": "regex",
      "patterns": ["..."],
      "components": {
        "component_key_1": 0.30,
        "component_key_2": 0.20
      },
      "note": "Description of usage"
    }
  }
}
```

- All component keys used in `components` **must** be valid in **at least one Pattern's registry**.
- Shared lexicon entries **do not trigger any Pattern by themselves** — they only contribute signals.

---

## 🔍 Validation Rules (Enforced by CI)

### A. Component Key Validity

Every `component` value in `mappings/**/*.json` must be listed in the official
[`component-registry.js`](../src/registry/component-registry.js) **for that specific Pattern**
(except `shared/`, where keys are validated against the global set).

**CI will fail** if an invalid key is found.

### B. Weight Sum (Core Components Only)

For non-booster components, the sum of their `weight` values **must equal 1.0** (±0.01).
Booster components (listed in `component-registry.js` as `BOOSTER_COMPONENTS`) are excluded from this sum.

Currently **CI emits a warning**; after Part 7 is ratified it will become a **hard failure**.

### C. Cross-Test Merge Gate

If your PR modifies `mappings/ep/`, `mappings/mb/`, `mappings/fc/`, or `mappings/gc/`,
you **must** run the corresponding cross-pattern negative tests **locally** and confirm:

- No **strong positive** of one Pattern is mistakenly detected as the other.
- **Grey zone cases** (e.g. EP↔MB G03-G06) **must retain their dual-trigger behaviour** unless Council explicitly approves a change.

**CI will measure cross-contamination rate; >5% causes a warning (future: failure).**

### D. Cultural Advisor Sign-Off

For any mapping that involves **culturally sensitive phrases** (e.g. honour-based pressure, family obligations), the PR **must** be reviewed by a designated cultural advisor (currently Node-06) and their approval noted in the PR description.

---

## 🧾 PR Template

When submitting a mapping PR, please copy and fill this section into the description:

```markdown
## Mapping Contribution Checklist

- [ ] All JSON files pass schema validation (`npm run validate-mappings`)
- [ ] All component keys exist in registry (`npm run validate-registry`)
- [ ] Weight sums are 1.0 for core components (warning acknowledged)
- [ ] Cross-test run completed (attach summary or log)
- [ ] Cultural advisor review (if applicable): @Node-06 - approved / pending
- [ ] `meta.author` and `meta.last_validated` are filled
- [ ] `compatible_pattern_versions` includes the current ratified Pattern version(s)
```

---

## 🧪 Local Validation Commands

Before pushing, run:

```bash
# Validate all mapping JSONs against schema
npm run validate-mappings

# Validate component key consistency (core ↔ registry ↔ schema ↔ mappings)
npm run validate-registry

# (Optional) Run cross-pattern tests
npm test -- --grep "cross contamination"
```

---

## ❓ FAQ

**Q: Can I use a component key that is not in the registry?**
No. The registry is the single source of truth. If you believe a new component is needed, it must first be proposed via a Pattern PDD update and Council vote.

**Q: What happens if my mapping causes a CI warning?**
Warnings do not block merging, but they must be acknowledged. Repeated warnings on the same issue may lead to the PR being held until resolved.

**Q: How do I mark a rule as "draft" or "experimental"?**
Use the `meta.status` field with value `"draft"`. Draft mappings are allowed in the repository but are not considered part of the official ratified mapping set.

---

**Maintainers:** Node-01 (Lumen) — Architect, Node-05 — Repo Auditor, Node-03 — Schema Owner
**Last updated:** 2026-02-17 (MS-12)
