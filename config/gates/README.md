# Gates Config

This folder contains machine-readable gate specifications used by runners/CI to produce pass/fail outcomes.

Source-of-truth:
- Gates here MUST match the corresponding policy docs (VDH / Gov-UN).
- Do NOT duplicate thresholds elsewhere (avoid drift).

Expected flow:
1) Runner loads `config/gates/*.json`
2) Runner evaluates inputs and emits per-gate pass/fail + reason codes
3) CI enforces hard-gate failures

Any change to gates SHOULD go through the governance change gate and include tests.
