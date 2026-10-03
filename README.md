# Hush!

A portrait, offline mobile puzzle game: quietly rearrange a room with one hand while a sleepwalker
heads for bed. Working title.

- Requirements: [`kit/spec/Hush_BRD.md`](kit/spec/Hush_BRD.md)
- Implementation plan: [`docs/PLAN.md`](docs/PLAN.md)
- Development kit, prototype and reference evidence (read-only `prototype_v1` baseline): [`kit/`](kit/)

## Current state

Planning only. No Godot project exists yet; Phase 0 starts next. See `docs/PLAN.md`, section 1.

## Reference checks that run today

Requires Node 18+ and Python 3.10+.

```sh
(cd kit && python3 tools/validate_reference.py && node tools/run_reference_tests.js)
node tools/integer_clock_probe.js
```
