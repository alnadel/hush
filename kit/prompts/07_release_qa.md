# Release QA and reproducible builds

Run every acceptance row against named builds. Profile physical devices, soak repeated restarts/backgrounding, verify offline behavior and save corruption recovery, audit SDK/network behavior and secrets. Fix blockers, rerun affected gates, and create clean checkout build instructions.

## Gate

All release-blocking cases pass with evidence. Report device model/OS, engine/template versions, build hashes, package sizes and budgets. No claim of tests on inaccessible devices.

Follow WORKING_AGREEMENT.md. End the phase with exact tests/results, files changed, unresolved blockers and next step. Update docs/STATUS.md.
