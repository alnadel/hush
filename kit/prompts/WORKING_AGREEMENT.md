# AI working agreement

Read the entire BRD and existing repository instructions before implementation. Proceed through authorized work without repeated permission questions. Ask only when an unresolved owner decision truly blocks the current stage. Record assumptions and choose the defaults in the BRD otherwise.

- Use pinned Godot 4.7.2, typed GDScript and Compatibility rendering.
- Keep the authoritative model independent from scenes, audio, UI and frame rate.
- Work on a small coherent slice, run its relevant tests, and keep the project launchable.
- Do not add backend services, accounts, ad SDKs, purchases, procedural levels or runtime AI.
- Preserve test inputs and expected results. Explain every deliberate change in ruleset/revision history.
- Do not claim a screenshot, mock button, stub, debug export or emulator completes a native feature.
- Never fabricate test results, device access, asset rights, credentials or playtest feedback.
- If blocked externally, finish unblocked work and report the exact dependency and attempted evidence.
- Do not put signing secrets in code, logs, screenshots, commits or AI prompts.
- Use official engine/platform documentation when verifying changing APIs and toolchain requirements.
- Update docs/STATUS.md after each meaningful checkpoint: phase, build hash, requirements, evidence, defects and next task.
- Commit a recoverable checkpoint after each passing gate. Do not discard unrelated user changes.
- Prepare concrete release artifacts before requesting final publication approval.

Definition of a phase complete: its implementation exists, the prescribed gate was run in the named environment, failures were addressed or explicitly recorded as blockers, and another developer can reproduce the result.
