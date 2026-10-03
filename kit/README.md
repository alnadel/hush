# Hush! AI Development Kit

Start here. This kit specifies a game to build; it is not a finished Godot project.

1. Read `spec/Hush_BRD.md`, especially scope, evidence, simulation and Phase 0.
2. Give your coding AI this entire folder and `prompts/00_start_here.md`.
3. Have it implement one phase at a time and maintain `docs/STATUS.md` in the new project.
4. Run the native phase gates before continuing. The owner must perform real phone playtests at the vertical-slice gate.

## Contents

- `spec/`: canonical BRD, identical in content to the editable Word edition.
- `prototype/`: supplied working browser reference and recorded evidence.
- `data/`: JSON Schema, reference level contract, solution inputs and expected outcomes.
- `tools/`: dependency-free contract validator and reference regression runner.
- `prompts/`: a working agreement and phased instructions for the coding AI.
- `qa/`: acceptance matrix, human playtest and release checklists.
- `assets/`: asset manifest and style/asset generation brief.
- `docs/`: status and build-environment templates.

## Run the existing evidence locally

Prerequisites: Python 3.10+ and Node.js 18+. There are no npm dependencies for the supplied model tests. These minimums apply to this kit's helper scripts; pin the actual production tools separately.

```sh
python3 tools/validate_reference.py
node tools/run_reference_tests.js
```

Open `prototype/preview.html` in a browser to play the supplied hard room. It is a self-contained browser preview, not a native performance test. `prototype/hush-hard-room.html` is a fragment for the original inline preview; use `preview.html` for a standalone page.

The historical mouse/touch browser report is included. Its original machine-specific browser automation launcher is intentionally not included. Reproduce native input tests in the Godot project; no browser binary is bundled.

## Contracts and limits

`level.schema.json` covers the hard reference's five object families (duck, cushion, train, cup, window). It deliberately rejects undeclared fields. Add rug and door through a reviewed schema revision in Phase 4. The JS model still uses constants, so `hard_room_reference.json` is a porting/authoring contract, not a loader that already runs the browser game. The contract checks and replay runner verify the packaged reference, not a future native implementation.

The Python validator implements the specific JSON Schema keyword subset used by this schema, with strict type handling and additional semantic checks. It is not a general JSON Schema library. Production validation must also implement the broader layout, asset, replay and authoring checks in BRD Section 18.

The new production attachment rules and lifecycle improvements are explicit BRD requirements. Do not edit the preserved reference code to hide differences. Keep a `prototype_v1` baseline and a separately versioned production ruleset.

## First instruction to the AI

“Read the BRD and working agreement. Inspect my workspace. Start Phase 0 and Phase 1. Build the pure Godot model, run the reference regressions, report real results, and update STATUS. Do not build the whole campaign yet.”
