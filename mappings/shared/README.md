# mappings/shared/ — Shared Lexicon

Shared lexicon entries list component keys from MULTIPLE patterns.
This is intentional and does NOT violate the component-registry rule
that each component belongs to one pattern.

- component-registry.js defines OWNERSHIP (which pattern owns which key)
- shared_lexicon defines SIGNAL CANDIDATES (which keys a phrase might trigger)

The evaluator uses shared_lexicon as input hints only.
Final component scoring is always done by each pattern's own evaluator.

Do NOT use shared_lexicon weights directly as component scores.
