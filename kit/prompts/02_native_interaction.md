# Native interaction and data

Implement RoomView, InputRouter, fixed clock, cancellation, pause/resume, bounds and attachment ownership. Build a strict level loader. Implement approved production deltas separately from prototype_v1. Add touch hit-area/coordinate diagnostics, mouse and keyboard alternatives. Export a playable Android build and perform an iOS export smoke test if the required Mac/toolchain is available.

## Gate

FR02–FR11, FR18 and FR19 relevant tests pass; a physical phone touch run is recorded; iOS export is verified or explicitly blocked. No free brake from pause, duplicate touch ownership, offscreen teleport, or lost payload.

Follow WORKING_AGREEMENT.md. End the phase with exact tests/results, files changed, unresolved blockers and next step. Update docs/STATUS.md.
