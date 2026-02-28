# MapperLoader — Layer 2a Mapping Resolver

The `MapperLoader` class loads pattern‑specific and shared lexicon JSON files,
compiles regex patterns, and computes component scores for input text.

## Usage

```javascript
const MapperLoader = require('./src/mapper/MapperLoader');

// Load EP English mappings
const loader = new MapperLoader('EP', 'en');

// Get score for a single component
const baitScore = loader.getComponentScore('You are such a coward!', 'bait_or_taunt');

// Get all component scores
const allScores = loader.getAllScores('Your silence means you agree.');
console.log(allScores);
// { bait_or_taunt: 0, escalation_pressure: 0, forced_response_frame: 0.25, ... }
```

## Conflict Resolution

Part 7.7 of the Instruction defines how to resolve conflicts between
pattern‑specific mappings and the shared lexicon.

By default (`conflictStrategy: 'error'`), if the absolute difference between
pattern weight and shared weight is ≥ 0.10, the loader throws an error.
This forces explicit resolution (e.g., using `override_shared` in the mapping).

Other strategies (only for development / special cases):
- `'warn'` – log a warning but continue (using pattern weight).
- `'record'` – do not warn, but allow later inspection (metadata will be added).

## Error Handling

- If a language mapping file is missing, the constructor throws.
- If a regex pattern is invalid, the constructor will throw on first use (regex compilation).
