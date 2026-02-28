# PR Checklist (Lumen ISSP)

## Change Type
- [ ] docs
- [ ] tests only
- [ ] detection logic (core/*)
- [ ] schema/contracts
- [ ] pipeline/adapters (node-facing)

## Evidence Pointers (required for detection changes)
- TR/TRS ID: (e.g., TR-011 / TRS-001)
- Test file(s): (path)
- Spec file(s): (path)
- Meeting decision: (e.g., M79 1a 5/5)

## Risk Note (1 sentence)
Describe the risk of this change (FP/FN/behavior drift) and how tests cover it.

## Vector Integrity (required if adding/updating vectors)
- [ ] Each new/modified vector has `scenario` + `surface`
- [ ] RW vectors have `privacy_check: true` and are de-identified
- [ ] Pattern IDs are within allowed set

## Commands Run
- [ ] npm test
- [ ] npm run validate:schemas (or equivalent)
- [ ] any additional validate step (if added)

## No-Go Confirmation
- [ ] No automated punishment hooks added
- [ ] No raw text storage added (unless explicitly governed)
- [ ] No change to Layer 1 scoring without B-class vote + tests
