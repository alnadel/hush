# Hush! — Implementation Plan

Plan date: 3 October 2026 · Source of requirements: `kit/spec/Hush_BRD.md` (v1.0, 2 Oct 2026) · Kit: `kit/` (vendored unchanged)

This plan turns the BRD and development kit into ordered, checkable work. The BRD remains the
authority. Where this plan picks a default the BRD leaves open, it says so and logs it under
"Decisions this plan proposes". Every phase ends at the BRD gate. A phase only passes when its
evidence exists. Writing the code is not enough.

---

## 1. Where things stand (checked in this session)

| Item | Finding | Evidence |
| --- | --- | --- |
| Repository | Empty: branch `claude/magical-hawking-475fat`, no commits, no remote branches | `git status`, `git ls-remote` |
| Kit integrity | All 38 files match `kit/SHA256SUMS.json` | SHA-256 check |
| Kit contract validator | PASS (schema, semantics, 10 invalid-data rejections) | `cd kit && python3 tools/validate_reference.py` |
| Kit reference regressions | 8/8 scenarios PASS, 6/6 original rule groups PASS | `cd kit && node tools/run_reference_tests.js` |
| **Integer-clock risk** | **Retired.** The reference model with the BRD's two clock-level differences (integer tick clock and an immediate stop on failure) passes all 8 scenarios. Worst peak delta is 0.040 (limit 0.25). Win time is 15.000 s against 15.008 s (one tick or less). Event times are identical. | `node tools/integer_clock_probe.js` |
| Godot | **Not installed.** The environment's network policy blocks `downloads.godotengine.org` and `github.com` release downloads (HTTP 403 at the proxy) | `curl` through agent proxy |
| Other tools present | Node 22.22, Python 3.11, OpenJDK 21 | `--version` |
| Missing for Android | JDK 17 (the BRD and Godot docs specify it), Android SDK, build-tools, platform 36 | — |
| Missing for iOS | macOS + Xcode 26: cannot exist in this Linux container | — |
| Uploads not vendored | `Hush_BRD.docx`. The kit's `spec/Hush_BRD.md` is byte-identical to the uploaded `.md`, and the BRD states the Word edition has the same content | `diff` |

What the probe means: the hardest parity question has an answer before any GDScript is written.
The production clock can be exact (integer ticks) and still meet the BRD 9.3 tolerances. If the
native port misses those tolerances, the port has a bug; the tolerances are not too tight.

---

## 2. How the work is split

| Who | Does what |
| --- | --- |
| **AI, cloud container or CI** | All code, data, tests, validators, replays, the debug inspector, headless evidence, Android debug/release *builds* (once the SDK is reachable), docs, store-copy drafts |
| **Owner** | Network allowlist; physical Android phone runs; Mac with Xcode for iOS; art/audio direction approval; recruiting and observing 10 playtesters; developer accounts, IDs, price, title clearance, signing keys; final submission go-ahead |

The AI never reports an emulator run as a device run, a debug build as store-ready, or a scripted
replay as a playtest (BRD 20.1).

---

## 3. Repository layout (target)

```text
README.md
project.godot                    # Godot 4.7.2, Compatibility renderer, portrait
kit/                             # vendored dev kit — READ-ONLY prototype_v1 baseline
app/                             # AppStateMachine, screens (home, rooms, pre-room, play HUD, pause, result, settings, help)
game/model/                      # pure typed GDScript rules — no Node, no scene, no audio
game/view/                       # RoomView, sprites, feedback, audio/haptic adapters
game/input/                      # InputRouter, keyboard focus, hit testing
data/levels/                     # versioned room JSON (production schema)
data/localization/               # string tables (keys only in code)
assets/                          # imported art/audio + provenance
services/                        # SaveService, lifecycle, diagnostics ring buffer
tests/runner.gd                  # tiny headless runner (SceneTree script), exit code = failures
tests/unit/  tests/scenarios/  tests/integration/
tools/                           # validators, replay CLI, probes, build scripts
docs/PLAN.md  docs/STATUS.md  docs/BUILD_ENVIRONMENT.md  docs/DECISIONS.md  docs/RULESETS.md  docs/evidence/
.github/workflows/ci.yml         # headless tests + validators + Android export (proposed, see D-01)
```

Rules: `kit/` is never edited, which preserves `prototype_v1`. Gameplay lives only in
`game/model/`. Views read snapshots and presentation events. Nothing outside the model writes model
state.

---

## 4. Phase plan

The phases are the BRD's (Section 20.2). Milestones: **M1 = Phases 0–2**, **M2 = Phase 3**,
**M3 = Phases 4–8**. Each phase lists its work, then its exit gate.

### Phase 0 — Environment

**Owner, first:** allow the Godot download hosts in this cloud environment's network settings
(environment menu → Edit → Network access → Custom). Add `downloads.godotengine.org`,
`github.com`, `objects.githubusercontent.com` and `release-assets.githubusercontent.com`, and keep
the default package-manager list. Docs: https://code.claude.com/docs/en/cloud-environments#network-access.
Later, for Android builds in the cloud, also add `dl.google.com`. The fallback when the allowlist
can't change: run everything in GitHub Actions (D-01). Feedback is slower, but it works.

AI work:
1. Install the Godot 4.7.2 standard Linux editor and the matching export templates. Verify both
   against the official SHA-512 sums. If 4.7.2 is not on the official archive, stop and log a
   decision; do not substitute another version silently.
2. Create `project.godot`:
   - Compatibility renderer, portrait orientation.
   - Base viewport 720×1280, stretch mode `canvas_items`, aspect `expand`. The 400×474 room
     scales uniformly inside the safe area.
   - GDScript warnings for untyped declarations and unsafe calls raised to errors, which keeps
     the code typed.
3. Add `tests/runner.gd`. It discovers `test_*.gd`, runs them under
   `godot --headless --path . -s res://tests/runner.gd`, writes a log to `docs/evidence/`, and
   exits non-zero on any failure. Warm the import cache once before the first run.
4. Add `tools/test.sh`, which runs the kit validator, the kit regressions, the integer-clock probe
   and the Godot runner, then prints a single PASS/FAIL line.
5. Add `.github/workflows/ci.yml` (D-01). It pins and checksums Godot, then runs `tools/test.sh`
   on every push and uploads logs as artifacts.
6. Optional: a cloud SessionStart hook that installs the pinned Godot, so later sessions start
   ready.
7. Write the docs:
   - `docs/BUILD_ENVIRONMENT.md` from the kit template, with real versions only.
   - `docs/STATUS.md` from the kit template.
   - `docs/DECISIONS.md` (the BRD 2.4 decision log).
   - `docs/RULESETS.md` (the approved differences from `prototype_v1`).
8. Inventory the Android toolchain: JDK 17, SDK cmdline-tools, platform 36, build-tools. List
   each blocker exactly. iOS is marked "blocked: needs owner Mac + Xcode 26".

**Gate:**
- The empty project launches headless with exit 0.
- `BUILD_ENVIRONMENT.md` has only verified values.
- Blockers are listed by name.
- Commit and push.

### Phase 1 — Reference model (pure, headless)

Port `kit/prototype/core.js` to typed GDScript under `game/model/`. Do this as a structured
rewrite with BRD names and responsibilities, not a line-by-line transliteration.

Components (BRD 17.1), each a small typed `RefCounted` class:

| Class | Holds | Notes |
| --- | --- | --- |
| `SimClock` | `active_tick:int`, `room_units:int` | Room time is counted in **1/480 s units**: +4 per active tick in normal mode, +3 in relaxed. This makes relaxed pace (0.75×) exact integer math. In normal mode it is identical to 120 Hz quantization (checked: `ceil(s·480)/4` rounds to the same tick as `ceil(s·120)`). Building it now saves a clock refactor in Phase 3. |
| `LevelDef` + parsers | Typed copy of the fixture | Phase 1 maps `kit/data/hard_room_reference.json`. Times are quantized once at import: `ceili(seconds*hz - 1e-7)`. |
| `RoomModel` | All authoritative state | Public API per BRD 17.2: `reset(level, mode)`, `apply(cmd)`, `step()`, `snapshot()`, `summary()` |
| `NoiseSystem` + `ListenerState` | Per-listener meters, peaks, last-heard tick | Per-listener cover (strongest single multiplier), distance gain, 0.001 epsilon, quiet delay, recovery floor |
| `HazardScheduler` | Cup timers, gust intervals, cover intervals | Half-open intervals in ticks |
| `WalkerPath` | Waypoint interpolation | Clamps at the last waypoint (14.969 s fractional endpoint is evaluated per tick) |
| Family logic | Duck, Cushion, Train, Cup, Window | One file per family, called from `RoomModel.step()` in BRD 5.3 order |
| `RuleEvaluator` | Completion, deadline, loss | Loss stops the rest of the step; loss beats win |
| Value types | `InputCommand`, `NoiseEvent`, `OutcomeEvent` | Fields exactly as BRD 17.2 |
| `ReplayRecorder` / `ReplayRunner` | Command lists ↔ JSON | Bounded event history; records build, ruleset and level revision |

Parity hazards the port must handle. Each one gets its own test:
- **Precision:** Godot's `Vector2` is 32-bit in standard builds; GDScript `float` is 64-bit. Model
  positions are stored as `float` scalar pairs, never `Vector2`. Vectors appear only at the view
  boundary.
- **Epsilon-sensitive recovery:** covered train rolling noise is 0.8 × dt × 0.16 ≈ 0.00107 raw,
  which sits close to the 0.001 meaningful-gain epsilon after distance falloff. Small math
  differences can toggle whether recovery runs. The tight oracle below exists to catch this.
- **Release-time noise:** noise from a release is emitted during the command phase and stamped
  with the pre-advance tick, so a 6.00 s train release is masked by the 5.5–6.8 cover. Match the
  reference.
- **Target clamping:** the reference clamps every target to the cushion's region and then clamps
  the duck's *position*. Production clamps the *target* to the object's own legal region; BRD
  AT03 calls this "no phantom distance". The two are identical for all reference targets. Add a
  test that shows the difference and record it in `RULESETS.md`.
- **Grab offset belongs to the `InputRouter`:** a model `target` command is the desired object
  anchor, so scripted replays stay valid.
- **Selection rules:** a cup is selectable before its trigger and until age 0.95; after that,
  selection is rejected. Selecting the train brakes it. Selecting a docked train is rejected.
  Selecting the cushion sets it back to floor/held, retrieving it from a wedge or the train.
- **Deadline:** the reference fails at `t > 24` (strict). Production uses `tick > deadline_tick`
  to match (D-04).
- **Causes:** the reference returns English sentences. Production returns
  `{listener_id, cause_id, explanation_key}`. The parity test maps each JS reason, for example
  "The walker woke. Cup A hit the floor" → `{walker, cupA, crash}`.

Two oracles, both in `tests/scenarios/`:
1. **Contract** (`kit/data/reference_replays.json`): state, caught count and cause must match.
   Event and finish times within one tick. Peaks within 0.25. These are the BRD 9.3 tolerances.
2. **Tight** (`tests/scenarios/expected_integer_clock.json`, generated by
   `node tools/integer_clock_probe.js --write`): the same semantics as production, so peaks,
   noise totals and event ticks should agree within about 1e-6. Last-bit differences between
   `Math.hypot`/`exp` and Godot are allowed for. A tight-oracle miss points at a real port bug
   long before the 0.25 tolerance would.

Unit tests:
- The 6 kit rule groups.
- The BRD 21 edge cases:
  - cover start tick, the tick before cover end, and the excluded end tick;
  - catch at just-inside / exactly-on / just-outside each threshold;
  - train release on pause→resume, both inside and outside cover;
  - a cup tipping while a stale select command is queued;
  - duplicate and invalid commands rejected without side effects.
- Fifty `reset()` calls give snapshots identical to a fresh model (FR11, model half).
- The same replay run twice gives an identical snapshot hash (FR19).

**Gate:**
- AT01 passes, plus the model-level parts of AT04, AT05, AT07, AT08, AT09, AT11 and AT19.
- Logs are in `docs/evidence/`.
- `STATUS.md` is updated.
- Commit and push.

### Phase 2 — Native interaction, data and the debug inspector (completes M1)

1. **Fixed-step driver** in `_process`:
   - accumulator at 120 Hz;
   - at most 0.25 s of simulation per frame; beyond that, auto-pause with "Game paused after an
     interruption" and drop the backlog (BRD 16.3);
   - the view interpolates between the last two snapshots and never writes the model.
2. **RoomView**: draws the hard room with code primitives first, using the prototype palette in
   `kit/prototype/ui.js`, so no art is needed for M1.
3. **InputRouter**:
   - one gameplay pointer by touch index; later touches are ignored until it ends;
   - pointer capture equivalent;
   - screen→world conversion through the room's actual canvas transform;
   - grab offset preserved;
   - clamping instead of teleporting when the finger leaves the room.
   - Hit areas are at least **48 UI units at the current scale**, converted to world units per
     layout, so on small phones the world-space hit radius grows. Overlap is resolved by: active
     object, then closest anchor, then authored priority, then ID. The engine anchor (+67 px) and
     the carriage socket stay separate.
   - Mouse and keyboard (Tab / Space / arrows / Escape) feed the same command queue.
4. **Lifecycle:** touch cancel, focus loss, app pause/background and the long-frame stall all
   enter Paused. Resume applies the pending release exactly once (BRD 5.2). Verify the exact
   Godot 4.7.2 notification and touch-cancel APIs against official docs, not from memory.
5. **AttachmentSystem** (production ruleset):
   - parent → child slots, Train → Cushion → Cup;
   - capacity 2, so a third cup is a miss;
   - a loaded cushion cannot wedge;
   - caught cups belong to the cushion, never directly to the train (BRD 3.2).
6. **CollisionResolver:** legal-region clamp plus a swept segment check against declared blockers.
   An invalid release falls back along the last segment, then to the last valid position. The
   reference room has no blockers, so parity is unchanged.
7. **LevelRepository + strict validator in GDScript.** Production schema v2 adds:
   - sockets with explicit priority;
   - blockers and legal regions;
   - payload capacity;
   - per-cover `listener_ids` (already present).
   
   One implementation serves both the game and `tools/validate_levels.gd` in CI. It ports the
   kit validator's checks and adds the BRD 18.2 checks. The kit's Python validator remains the
   check for the kit fixture only.
8. **Debug inspector** (BRD 18.3): toggles for path, hit areas, legal regions, sockets, noise
   sources, per-listener contributions, object states and upcoming triggers, plus pause,
   single-step, restart and replay load. Debug builds only.
9. **Android:** debug APK export, built by CI or in the cloud once `dl.google.com` is allowed. The
   owner installs it on a physical phone and records model, OS and build ID. **iOS:** the owner
   runs an export smoke test on a Mac with Xcode 26; until then it is marked blocked.

Integration tests are headless. Synthetic `InputEventScreenTouch` and `InputEventScreenDrag`
events cover:
- second-touch rejection;
- UI pause during a drag;
- cancel mid-drag;
- offscreen clamp;
- pause→resume releasing exactly once;
- no free brake.

**Gate (= M1):**
- AT02, AT03, AT06, AT09 and AT10 pass, plus AT18 for the hard room.
- An inspector screenshot and a replay are in the evidence.
- The physical Android touch win is recorded by the owner.
- iOS is verified or explicitly blocked.

### Phase 3 — Vertical slice (M2, the fun gate)

Rooms (D-03):
- **A — Tiny Squeak (Room 01):** one duck, no cover.
- **B — One Hand (the Room 05/06 brief):** one cup, a gusting window and the cushion. Two viable
  schedules: hold the window then catch, or wedge the window and catch in time.
- **C — Night Shift (Room 12):** the player-facing hard room, tuned as its own data file.

The parity fixture stays untouched as a developer scene.

Build:
- **Screens:** Home, Room select (slice only), Pre-room, Playing HUD, Pause (with the
  pending-release text), Result (cause sentence plus three facts), Settings, Help.
- **Feedback:** per-listener meters with three face states; covered-ring style plus a "Covered"
  cue; the snore breathing countdown; a cue at least 1 s before each gust.
- **Failure presentation:** freeze on the culprit, then one causal sentence, adding "Already
  restless" when it applies.
- **Hints:** two steps. Opening a hint pauses the room and removes Quiet Night eligibility.
- **Relaxed pace:** room units +3 per tick, hand movement unscaled, gust integrated noise
  unchanged (AT17).
- **Accessibility:** reduced motion, text size.
- **Basic save:** temp file → flush → validate → replace, plus one backup.
- **Localization:** keys from day one in `data/localization/`.
- **Art and audio:** representative but not final, from a style sheet the owner approves (D-05).
  Placeholder audio comes with provenance entries in the asset manifest.
- **Performance sampling:** on the owner's phone, measured against the BRD 16.3 budgets.

**Owner:** run the 10-person formative test using `kit/qa/PLAYTEST.md` and record real counts.
The AI must not invent results.

**Gate:**
- M2 acceptance rows pass: AT11 (full), AT12, AT16 (basic), AT17, plus samples of AT21, AT22
  and AT24.
- Playtest numbers are recorded.
- **Decision:** proceed, iterate or revisit the mechanic. If the gate fails, run a small targeted
  iteration, not more rooms (BRD 1.3, 23).

### Phase 4 — Meta and new families

- **Progression:** unlock chain, normal and relaxed records kept apart, Quiet Night, chapter
  cosmetics.
- **Save:** schema migration functions, backup recovery, reset progress vs reset all.
- **Rug:** footprint containment at the exact contact tick; 42 / 4 raw step noise.
- **Swing door:**
  - normalized opening, max 1.5/s, the given opening-noise formula;
  - spring close at 0.35/s with a 55 crash when it had opened at least 0.2 since the last close;
  - cushion latch at 0.8 or more;
  - failure if the crossing happens below 0.75.
- Build each family in isolation, with its own schema v3 revision and tests, before any combination.
- Inspector overlays for both families.

**Gate:**
- AT13, AT15 and AT16 (full: fresh, migrated, truncated, corrupted, backup-only, interrupted)
  pass.
- A process-kill relaunch keeps completed progress.

### Phase 5 — Content (only after a passing M2)

- 24 rooms, following the BRD 10.1 curriculum, and 12 remixes (three per chapter, built on that
  chapter's last two rooms).
- Each room gets: data, at least one winning replay with margin, failure checks, localization and
  hint keys, and a phone review by the owner.
- Rooms 12, 21 and 24 and at least four remixes need two witnesses with different object-role
  sequences.
- ±0.15 s perturbation checks where a broad window is promised.
- Six-object limit; timing floors of 0.35 s (0.6 s target), 0.25 s for mastery.
- A generated content-coverage report.

**Gate:** AT14 passes: 36 valid unique IDs, all rooms win, required witnesses and margins pass.

### Phase 6 — Production polish

- Final assets per `kit/assets/asset_manifest.csv` with provenance and licenses.
- Anchors and timings unchanged; replays re-run after the art swap.
- Final audio with coalesced loops; reduced motion; credits.
- Layout review on small, tall, notched and tablet screens.

**Gate:** AT20 and AT24 pass, plus AT17 for the full game.

### Phase 7 — Release QA

- Every acceptance row run against named builds.
- Device matrix: support floor, current midrange, older iPhone, current iPhone, tablet.
- Soak, interruption and fuzz suite.
- Airplane-mode checks.
- Binary network and SDK audit.
- Clean-checkout reproducible build.

**Gate:**
- AT21, AT22, AT23 and AT25 pass.
- No open release blockers (the BRD 21 definition).

### Phase 8 — Store handoff

- Recheck the official Google and Apple requirements.
- Signed AAB and iOS archive.
- Screenshots from the release build.
- Truthful descriptions and privacy declarations.
- Ratings questionnaires.
- `kit/qa/RELEASE_CHECKLIST.md` complete.

**Gate:** the owner reviews the concrete candidate and authorizes submission. Nothing is
published without that.

---

## 5. Requirement traceability

| Req | Test | Built in | Verified where |
| --- | --- | --- | --- |
| FR01 parity | AT01 | P1 | Headless (two oracles) |
| FR02 one pointer | AT02 | P1 model / P2 router | Headless synthetic input + phone |
| FR03 drag and noise | AT03 | P1 follow/noise, P2 sweep | Headless |
| FR04 cup hold | AT04 | P1 | Headless |
| FR05 noise model | AT05 | P1 | Headless |
| FR06 cushion ownership | AT06 | P1 catch, P2 attachments | Headless |
| FR07 train | AT07 | P1 | Headless |
| FR08 window | AT08 | P1 | Headless |
| FR09 outcome rules | AT09 | P1, P2 deadline text | Headless |
| FR10 pause/lifecycle | AT10 | P1 semantics, P2 lifecycle | Headless + phone |
| FR11 retry reset | AT11 | P1 model, P3 view/audio | Headless + device memory trend |
| FR12 onboarding/hints/results | AT12 | P3 | Integration + playtest |
| FR13 rug/door | AT13 | P4 | Headless |
| FR14 36 levels | AT14 | P5 | Headless + phone review |
| FR15 progression | AT15 | P4 | Headless |
| FR16 save | AT16 | P3 basic, P4 full | Headless + process kill on device |
| FR17 accessibility/pace | AT17 | P3, P6 | Headless + review |
| FR18 level validation | AT18 | P2, P5 packaging guard | Headless + CI |
| FR19 replays/diagnostics | AT19 | P1, P2 inspector | Headless |
| FR20 assets/strings/licenses | AT20 | P6 | Audit script + review |
| NFR01 performance | AT21 | P3 sample, P7 full | Physical devices only |
| NFR02 offline/no telemetry | AT22 | P3, P7 | Device + binary audit |
| NFR03 reproducible signed builds | AT23 | P7, P8 | CI + owner credentials |
| NFR04 layouts/menu a11y | AT24 | P3, P6 | Device + review |
| NFR05 no crash/soft-lock | AT25 | Every phase | Soak/fuzz + devices |

`kit/qa/acceptance_tests.csv` is copied to `docs/evidence/acceptance_tests.csv`, and its status,
build, device and evidence columns are filled as rows pass.

---

## 6. Decisions this plan proposes (to log in `docs/DECISIONS.md`)

None of these blocks Phase 0 or 1. The owner can overrule any of them.

| ID | Decision | Default | Why |
| --- | --- | --- | --- |
| D-01 | Add GitHub Actions CI (dev infrastructure, not a game service) | Yes | Reproducible evidence (NFR03). Also works around the cloud network block. |
| D-02 | Vendor the kit read-only at `kit/` | Yes (done) | Uploads disappear with the container. Keeps `prototype_v1` intact. |
| D-03 | Middle slice room = the "One Hand" brief (cup + window + cushion) | Yes | It is the BRD's "two competing hazards" and teaches the core one-hand trade-off before the hard room. |
| D-04 | Deadline is strict `tick > deadline_tick` | Match the reference | Keeps parity; it is a one-tick difference either way. |
| D-05 | Slice art: code-drawn shapes for M1, then an owner-approved style sheet before any M2 art | Yes | BRD 13.2: approve the style sheet before a full set. |
| D-06 | Room clock in 1/480 s integer units | Yes | Makes relaxed pace exact with no float drift; identical to 120 Hz in normal mode. |
| D-07 | Temporary IDs `com.example.hush` (Android package and iOS bundle) | Temporary | BRD 22.1 requires clearly temporary IDs until the owner picks final ones. |

---

## 7. Owner checklist, in order of need

| When | What |
| --- | --- |
| **Now (Phase 0)** | Allow the Godot download hosts listed in Phase 0, or approve CI-only test runs (D-01) |
| Phase 2 | One physical Android phone; add `dl.google.com` to the allowlist, or accept CI-built APKs; sideload and report results |
| Phase 2 | Mac with Xcode 26 for the iOS export smoke test (or accept "iOS blocked" at M1) |
| Phase 3 | Approve the style direction; recruit and observe 10 testers with `kit/qa/PLAYTEST.md`; make the M2 decision |
| Before Phase 8 | Title/name clearance, final IDs, store accounts, price and countries, support contact, signing keys kept outside the repo, submission approval |

---

## 8. Risks specific to this implementation

| Risk | Mitigation |
| --- | --- |
| Godot 4.7.2 unreachable or not as described | Verify with the official archive and checksums at install; a version change goes through a logged decision, never a silent swap |
| float32 `Vector2` drift breaks parity | Model uses float64 scalars (Phase 1 rule) |
| Recovery epsilon toggles under tiny numeric differences | Tight oracle catches it; dedicated covered-train recovery test |
| Port quietly reproduces reference shortcuts (train-owned cups, unbounded duck nudge, pause free-brake) | Each approved difference has its own test and a `RULESETS.md` entry |
| Testing slows to a crawl without local Godot | CI fallback (D-01); keep the model test suite under a few seconds |
| Content begins before the fun gate | Phase 5 is hard-gated on the recorded M2 decision |
| Touch targets on small phones overlap (engine vs carriage, window vs train socket) | Hit-area overlay at the smallest layout; priority rules; phone review at M1 |

---

## 9. First session after this plan

1. Owner applies the network allowlist (or says "CI only").
2. AI completes Phase 0 and commits.
3. AI completes Phase 1:
   - model, then oracles, then edge-case tests, then replay recorder;
   - every gate command and its output recorded in `docs/STATUS.md`;
   - commit after the gate passes.
4. AI stops at the Phase 1 gate and reports real results before starting Phase 2.
