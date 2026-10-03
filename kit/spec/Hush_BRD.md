# Hush!

## Business and Product Requirements

Version 1.0 · 2 October 2026 · Prepared for Hassan

**Build brief:** A portrait, offline mobile puzzle game in which you quietly rearrange a room while a sleepwalker heads for bed. You have one hand. Moving quickly makes noise. Holding one problem leaves another unattended. The pleasure comes from finding a clever sequence, recovering from a mistake, and watching the room settle into silence.

**Document status:** Implementation baseline proposed for development. The hard-room browser prototype supplies evidence for the central interaction rules. Native builds, production content, market demand, and player enjoyment still require validation. “Hush!” is a working title; originality and name availability have not been established.

**How to use this document:** Read Sections 1–4 for scope, 5–12 for gameplay, 13–18 for production requirements, and 19–24 for implementation, testing, delivery, and decisions. Give the coding AI the accompanying development kit and begin with Phase 0. The Markdown and Word editions contain the same requirements. The kit supplies reference code, data contracts, acceptance cases, and staged prompts; it is not a finished native app.

# 1 Product intent and business case

## 1.1 The player promise

“I kept the whole room asleep with one clever move.” Hush! should feel like a tiny, tactile chain-reaction puzzle. The player controls useful objects, not the sleepwalker. The room runs on a readable schedule; the player changes how its hazards resolve. A cushion can catch a cup, ride a toy train, or wedge a rattling window. Each use solves one problem while creating an opportunity cost elsewhere.

The intended audience is casual puzzle players seeking short sessions and people who enjoy physical comedy without combat. Design for broad accessibility, but do not claim that every age or ability will enjoy the game. The launch creative direction is gentle domestic comedy: drowsy faces, wobbling cups, a squeaky duck, a train carrying precious cargo. Failure is a surprised wake-up, not injury or punishment.

## 1.2 Why this is worth testing

The commercial hypothesis is that one-touch object manipulation, visible cause and effect, and several solutions to a short room can produce satisfying retries and shareable “look what I did” moments. Its distinguishing combination is one-hand occupancy, context-sensitive objects, sound masking, and spatial hearing. None of those elements alone establishes novelty. This project should earn further investment through observed play, not a claim that a hit is guaranteed.

## 1.3 Goals and decision gates

| Goal | Initial success criterion | Evidence required |
| --- | --- | --- |
| Understand quickly | At least 8 of 10 new testers clear Room 1 within 3 attempts without verbal coaching | Observed first-time play on phones |
| Feel in control | At least 8 of 10 can explain their last failure correctly | Short interview immediately after failure |
| Invite retry | At least 6 of 10 voluntarily retry the hard room after a first loss | Observe with an obvious option to stop |
| Reward planning | At least 3 of 10 discover or intentionally try a different solution | Input replays plus player explanation |
| Sustain variety | At least 7 of 10 rate the three-room slice 4 or 5 out of 5 for wanting another room | Post-session survey; record the question |
| Run reliably | Native device and acceptance gates in Sections 16 and 21 pass | Build IDs, device logs, test reports |

These are proposed investment gates for a small formative sample, not statistically reliable market forecasts. Record participant counts, experience, device, attempts, and reasons for stopping. If comprehension fails, fix teaching and feedback before adding content. If control works but retries feel tedious, revise the mechanic or room length before commissioning a full art set.

## 1.4 Business model and resources

Development default: a paid download with all launch rooms included, no advertising and no in-app purchase SDK. Internal and limited testing builds have no payment flow. Store price and launch countries are owner decisions before release; pricing does not block the gameplay build. A free demo or a different commercial model requires a separate scope decision.

Budget categories are developer accounts, access to a Mac for iOS builds, physical test phones, licensed art/audio if needed, and recruited playtesters. No amount or release date is promised in this BRD. AI writes and iterates code and can assist with assets, tests, and store drafts. The owner still supplies accounts, owns creative decisions, observes real users, and authorizes store submission. There is no runtime AI service, server cost, or inference dependency in the game.

# 2 Release scope and delivery boundaries

## 2.1 Three delivery milestones

| Milestone | Playable deliverable | Exit condition |
| --- | --- | --- |
| M1 Technical reference | The existing hard room reproduced in Godot, with debug overlays and replays | Reference scenarios pass; touch works on one physical Android phone; an iOS export smoke test is completed |
| M2 Vertical slice | Three polished rooms: first touch, two competing hazards, and the hard room | Comprehension and fun gates tested; native lifecycle, muted play, and performance pass |
| M3 Launch release | 24 authored rooms, 12 curated remixes, progression, settings, save, finished assets, store builds | All release acceptance cases pass and owner approves submission |

Do not build all 36 rooms before the M2 decision. Hard-room parity is an engineering fixture, not the opening experience. Keep the fixture available as a developer scene after its player-facing version is tuned.

## 2.2 Included in launch

One offline campaign with four chapters of six base rooms; twelve remixes unlock after base completion. Portrait Android and iOS phone support, a centered responsive tablet layout, touch controls, pause/retry, optional hints, normal and relaxed pace, local progress, cosmetic milestone rewards, sound and haptic settings, a short credits/help screen, and an English interface prepared for localization are included. All shipped levels are authored and tested. A development-only level inspector and replay runner are included to support AI iteration.

## 2.3 Excluded from launch

No multiplayer, accounts, cloud saves, global leaderboards, user-generated rooms, procedural room generation, daily server events, live operations, energy, consumable boosts, advertisements, subscriptions, microphone input, camera input, pressure input, device shaking, general fluid physics, or simulated acoustic reflection. Replays are development diagnostics; there is no launch replay-sharing service. Arabic and other translations are later content unless separately commissioned; internationalization infrastructure is required now.

## 2.4 Scope control

Every proposed feature must solve a measured problem or support a listed launch requirement. Maintain a decision log with the requirement ID, reason, expected benefit, test, and affected level revisions. Additions go to a backlog until the current milestone passes. Do not quietly add a backend, analytics SDK, login screen, purchases, or a new engine while implementing this specification.

# 3 What the prototype has established

## 3.1 Existing evidence

The supplied browser reference contains a deterministic JavaScript model, an interactive canvas interface, scripted room scenarios, rule assertions, and browser mouse/touch tests. Its 400 by 474 unit room contains a duck, cushion, train, two cups, a window, a walker, and a sleeper. The hard room normally finishes at about 15 seconds with a 24-second deadline.

| Recorded scenario | Result | What the result supports |
| --- | --- | --- |
| Prepared train chain | Win; both cups caught; peak restlessness 46.26 | A planned carrier solution is feasible in the model |
| Manual cushion transfer | Win; both cups caught; peak 32.42 | A materially different solution is feasible |
| Recover an early train | Win; both cups caught; peak 70.64 | A timing mistake can be corrected by braking |
| No intervention | Loss at 9.0 seconds | The room needs player action |
| Skip the window | Loss at 10.15 seconds | Solving the cups alone does not solve the room |
| Real browser touch input | Win; both cups caught; peak 37.75 | The interface can execute the carrier solution in browser touch emulation |

Values above come from `prototype/evidence/scenarios.json` and `browser-results.json`. Scripted target jumps and actual pointer paths produce different scrape noise; their peaks are not interchangeable. These results establish logical feasibility and browser interaction, not human enjoyment, native device performance, or a retention forecast.

## 3.2 Preserve and improve

Preserve one-hand exclusivity, ongoing hazard state, speed-dependent scrape noise, timed cover, source-local hearing, and multiple solutions. The prototype does not reset a cup's tipping progress when grabbed again. Cover never removes noise already heard. Pausing cannot leave a free permanent brake behind.

Production must add proper object ownership, legal placement, save/progression, authored levels, accessible feedback, native lifecycle handling, complete assets, and device tests. In particular, caught cups must belong to the cushion they landed on. The prototype sometimes draws a caught cup as belonging directly to the train; carrying that presentation shortcut into the production attachment model would be a bug.

## 3.3 Evidence vocabulary

“Reference verified” means checked against the supplied browser artifacts. “Required” means an implementation obligation. “Proposed tuning” means a starting balance value that needs human playtesting. “Release verified” may only be used after a named native build passes on named devices. Keep these terms separate in AI progress reports.

# 4 Experience and reasons to replay

## 4.1 The room loop

Inspect the still room; notice the path, hazards, and useful objects. Tap Start. Rearrange something quietly, use a cover window for a noisy action, and hold or repurpose an object while the room evolves. Read the sleepers' reactions. Adjust the plan if needed. Reach the end, see a brief explanation of the outcome, and retry or continue.

Preparation occurs after Start and costs room time. The pre-start view allows inspection and optional object labels, but does not allow repositioning props. A first-use tutorial can pause at an authored teaching point; tutorial-assisted runs do not set mastery records.

## 4.2 The central interesting decision

A held object consumes the hand until released. Holding the window prevents its rattle, but prevents moving the cushion. Wedging the window frees the hand but consumes the cushion. Putting the cushion on the train automates two catches, but makes train timing important. Manually moving the cushion removes the train problem but requires a well-timed transfer during the window's gust. The design should make these choices legible before demanding precision.

## 4.3 How difficulty should grow

Grow dependency and commitment before raw speed. Introduce one rule, combine two known rules, require an object to change jobs, then offer a recovery opportunity. Use different path shapes, listener positions, noise materials, and hazard overlap. Every chapter includes an easier relief room and a final combination room. Do not create variety solely by making identical timing windows narrower.

The base campaign rewards any safe solution. The optional Quiet Night badge invites a cleaner solution. Remixes change one named planning constraint, such as a shifted cup landing, a different snore schedule, or a cushion starting at the window. They are fixed, replayable authored variants with their own tested solutions; they do not randomly change a room mid-attempt.

## 4.4 Fairness rules

Every harmful event has a visible precursor. Every failure names its immediate cause. A normal campaign solution may not require an input window below 0.35 seconds; target at least 0.6 seconds for a first successful strategy. Optional mastery may be tighter, but not below 0.25 seconds. These values are proposed design floors to verify with touch input. No essential cue is sound-only. No prop unexpectedly changes its interaction family. No loss follows from a decorative object.

# 5 Simulation and session contract

## 5.1 Coordinate system and clocks

Use a logical room of 400 by 474 units, origin at its top-left. Positive x is right; positive y is down. Rendering scales the whole room without distorting it. Input coordinates convert through the actual room transform; UI safe areas never change simulation coordinates. Positions use floating-point units; event schedules use integer simulation ticks at 120 ticks per second in normal mode.

The production clock keeps an integer step count. Scheduled triggers are quantized at import to the first tick at or after the authored time (ceiling with floating-point epsilon). Continuous path endpoints may use fractional seconds and are evaluated at each tick; they do not create extra simulation steps. Tick zero is the initial state. At each step, apply commands scheduled for the start of that step, advance the clock, and resolve the step. Continuous motion uses the fixed delta. Render interpolation must never modify model state.

The reference JavaScript accumulates floating time and may finish at 15.008 rather than exactly 15.000. Port outcomes and event timing must match within one fixed tick; do not reproduce floating-point drift intentionally. Record this as an approved production difference.

## 5.2 Room states

| State | Allowed actions | Exit |
| --- | --- | --- |
| Ready | Inspect, help, settings, start, leave | Start enters Running with a reset model |
| Running | One gameplay pointer; pause/retry controls | Pause, failure, or completion |
| Paused | Resume, retry, settings, leave | Resume applies the normal release rule before simulation resumes |
| Won | Review result, retry, next, room select | New room or fresh attempt |
| Lost | Review cause, hint, retry, room select | Fresh attempt or leave |

Pause freezes clocks, motion, sound production, restlessness recovery, and queued visual effects. Capture the held object as a pending release; clear active pointer ownership. Resume releases that object using its ordinary behavior before any time advances. Show “Your held object will be released when you resume.” A held train therefore starts or restarts, and a cup resumes its existing progress. This prevents pause from becoming a permanent free hand. The pause menu itself never generates room noise.

## 5.3 Per-step resolution order

1. Apply queued input commands in recorded sequence order; reject invalid or duplicate commands.
2. Advance the simulation clock; move the held prop and emit its movement noise.
3. Move carriers and emit continuous carrier noise; update attached children.
4. Move the walker on its authored path; resolve one-time step/contact triggers.
5. Advance unstable objects in stable object-ID order; resolve impacts and catches.
6. Apply environmental noise rates and authored door events.
7. Recover eligible listener restlessness; update presentation event queues.
8. Evaluate completion, then deadline failure if still Running.

After any noise or fatal trigger that causes a loss, stop the remainder of that step immediately. Failure takes priority over a simultaneous win. This is a deliberate improvement over the reference's partial early-return behavior. A model event is emitted once; animation callbacks must not award outcomes, create noise, or advance hazards.

## 5.4 Completion and failure

Win when the walker has reached its destination time, all required hazards have resolved or become permanently safe, and no object is held. A caught or already-broken cup is resolved. A timed gust is resolved after its end. A train is resolved when parked or docked if the room marks it as required. Any listener at restlessness 100 or above causes immediate loss. An authored physical obstruction may cause a loss only after its clearly telegraphed trigger; there is no hidden health system.

The hard reference intentionally permits a surviving run with a broken cup; the noise model decides whether that mistake wakes someone. Catching every cup is an optional mastery condition, not a base completion requirement. If the deadline expires before completion, show the unfinished condition. Ordinary campaign rooms last roughly 15–35 seconds, with a 45-second design ceiling. No endless holding can win.

# 6 Input and tactile behavior

## 6.1 Touch contract

Pointer down selects one valid object. Drag moves a movable object; holding a fixed object activates its hold behavior. Pointer up releases it. A second gameplay touch is ignored until the first ends. UI controls consume their own touches and may request pause, but cannot operate a second object. Do not transfer ownership when another finger crosses the first.

Each selectable target has at least a 48 by 48 logical UI-unit hit area at the smallest supported layout. Production Android layout mapping must verify its physical dp equivalent and iOS layout must verify the chosen touch size in points. This is a product target, not a claim that the browser's CSS sizing establishes native accessibility. Space adjacent targets so inflated hit areas do not conceal the intended object. When overlap is unavoidable, choose the active object first, then the closest eligible anchor, then a stable authored priority and ID.

Use pointer capture or its native equivalent. Finger movement outside the room clamps the target to allowed bounds; it does not teleport the object. Pointer cancellation, lost capture, focus loss, incoming-call interruption, or app backgrounding enters Paused. A missed release must never leave a secret held state. On resume, apply the rule in Section 5.2.

## 6.2 Drag response and noise

Preserve the grab offset so a prop does not jump under the finger. Desired position is the transformed pointer minus its initial offset. On each fixed step, move toward that position by the minimum of remaining distance, maximum speed times delta, and an exponential follow distance. Reference maximum speed is 360 world units per second and response constant is 0.035 seconds. Actual displacement after constraints determines scrape noise, never raw pointer distance.

Do not make fast movement impossible. It should be a meaningful trade: rapid action may save a cup but spend restlessness. A selected prop gains a clear outline; the target socket gains an icon and short label such as “Carry” or “Wedge.” Show the final snap preview before release. Keep important reactions above or beside the fingertip.

## 6.3 Placement and collisions

Movable props have authored legal regions and simple shape footprints. Clamp to the legal region and stop against marked solid blockers using a swept movement check, preventing tunneling under large pointer jumps. Decorative furniture has no collision unless the level declares it. The reference room has no internal blockers, so its parity path must remain unchanged.

Resolve a valid socket before a free floor placement. In the reference, the window socket has priority over the train. Production level validation rejects ambiguous overlapping sockets unless their priority is explicit. An invalid release returns to the nearest legal placement along the last movement segment; if none exists, use the last valid position. Show the failed placement cue and do not attach. There is no destructive inventory loss.

## 6.4 Desktop and accessible alternatives

Support mouse for development and desktop previews. Provide keyboard focus through gameplay targets, Space to grab/release, arrows to move a grabbed prop, Escape to pause, and Enter to activate a focused menu item. Keyboard commands feed the same input command queue. Native screen-reader labels are required for menus; do not claim full nonvisual gameplay accessibility for this spatial timing game without a separately designed mode and user testing.

# 7 Noise and restlessness

## 7.1 Noise is emitted where an action occurs

Each noise event has source ID, tick, position, raw amount, and category. Continuous sources emit rate times delta; impacts emit one amount. Evaluate masking at the event time, then attenuate for each listener's distance. Rings are feedback only. They are not projectile-like sound waves and cannot be caught, dragged, or blocked by placing an object over their artwork.

```text
effective = raw_amount * mask_multiplier
listener_gain = effective / (1 + distance / 300)
restlessness = restlessness + listener_gain
```

Distance is measured from source to listener in world units. There is no wall occlusion in launch. Designers must not imply a wall or pillow blocks hearing unless a later system explicitly implements it. Each listener has its own meter; a single global bar must not hide which character is about to wake.

## 7.2 Reference values and recovery

| Parameter | Initial value | Meaning |
| --- | --- | --- |
| Initial restlessness | 18 | Both reference listeners start here |
| Wake threshold | 100 | Greater than or equal fails immediately |
| Recovery floor | 12 | Natural recovery cannot go below this |
| Quiet delay | 1.6 seconds | Time after the last meaningful heard event |
| Recovery rate | 1.3 per second | Applied after the quiet delay |
| Meaningful gain epsilon | 0.001 | Greater gain updates the last-heard clock |
| Ordinary covered noise | 0.16 multiplier | Small movement, train, catch, window |
| Covered crash | 0.65 multiplier | Crashes remain dangerous under cover |

For production, overlapping cover windows use the strongest single reduction, never multiplied reductions. Cover explicitly lists affected listener IDs. The hard reference covers both listeners. A mask may start or end at a tick boundary; intervals include their start and exclude their end. No cover removes prior restlessness. Continuous wheel or window noise can prevent recovery, even if visually subtle.

## 7.3 Player feedback

Show a small meter beside each sleeper with calm, stirring, and near-wake facial states at 0–49, 50–79, and 80–99. Thresholds are proposed presentation bands, not different physics. Crossing a band produces one short animation and optional haptic, with cooldown. Covered sounds have a distinct patterned ring and a “Covered” cue. The upcoming snore has a visible breathing countdown during its final second; the cover interval is visible even when audio is muted.

On failure, freeze the culprit briefly and show one concrete sentence: “The window rattled too long” or “Cup A hit the floor.” A loss caused by accumulated noise should also say “Already restless” when the final event alone was small. A development overlay may show numerical contributions; normal play prioritizes clear reactions over arithmetic.

# 8 Objects and interactions

## 8.1 Squeaky duck

The duck can be dragged inside its floor region. In the reference its center is constrained to x 31–369 and y 330–438. Movement noise is based on actual distance and speed: `distance * (0.11 + (speed / 420)^2) * 1.4`. A walker contact within 31 units triggers one 90-unit crash and marks the duck as stepped on. The reference pushes it to x 32 afterward. Production uses an authored safe nudge position so the duck cannot repeatedly trigger on consecutive steps. Holding the duck does not make it immune to walker contact; move it out of the route.

## 8.2 Cushion

The cushion is draggable and emits `distance * 0.018` raw noise. Its states are Floor, Held, AttachedToCarrier, and Wedged. It can catch a falling cup while resting, attached, or held at the landing position; it cannot catch while wedged. The reference catch test is strict: horizontal distance below 32 units and vertical distance from landing y 295 below 25 units. Boundary equality is a miss. Production rooms author their landing and catch dimensions explicitly.

Capacity is two caught cups for launch. A caught cup becomes a child of the cushion in a stable slot. Moving the cushion moves its cups; attaching it to a train creates Train → Cushion → Cup relationships. Cups do not spill from normal cushion motion in launch. Catching a third cup on a full cushion is a miss; no shipped launch room asks the player to unload cups because unloading is not a supported action. A loaded cushion cannot be used as a window wedge. Empty-cushion wedge behavior remains available.

## 8.3 Toy train

The train travels along an authored straight track; it is not freely draggable. Holding the engine brakes it immediately. Releasing it starts or restarts it at its configured speed. Its first release emits 58 raw ordinary noise; later restarts emit 32. Reference rolling noise is 0.8 per second, speed 40 units per second, and docking x is 307 from a start at x 52. Docking is quiet and prevents further selection. A cushion dropped within 43 units of the carriage anchor attaches and follows it. Selection is on the engine anchor, which is offset from the carriage; renderer and input must not confuse the two.

Braking is deliberately quiet in launch. Release noise supplies the timing tradeoff. A train does not move while held, and repeated grabs do not reset its started/docked state or teleport its cargo. A valid release during cover reduces the release noise but does not alter train speed.

## 8.4 Unstable cups

Each cup has a trigger time, a pre-tip duration of 0.95 seconds, and a fall duration of 0.65 seconds in the reference. Before tipping, holding the cup freezes its accumulated instability; it does not restore stability. Release resumes from the same age. A cup can be held before its trigger. Once it tips, it is no longer selectable. The player catches it with a cushion at the authored landing position, rather than grabbing it in midair.

On impact, a catch emits 5 raw ordinary noise; a floor impact emits 115 raw crash noise. Both resolve that cup permanently. Rendering shows an unmistakable wobble, tipping commitment, airborne state, and final result. Cup animation follows model age; its animation end is not the impact trigger. Selection on the exact tipping step is resolved by the command-before-step ordering in Section 5.3.

## 8.5 Window

A window rattles during authored gust intervals. Holding it or wedging it with an empty cushion silences its source completely. Releasing the hand while a gust continues resumes its noise rate immediately. The reference rate is 48 raw units per second and its gust lasts from 8.4 inclusive to 12.6 exclusive. Retrieving a wedged cushion restores its floor/held role; the gust retains its elapsed time. Show wind movement and a pre-gust cue at least one second before onset.

## 8.6 Soft rug and creaky step

This is a required launch addition, not part of the hard reference. A movable rug covers one or more authored step trigger points when its footprint contains that point at the exact walker contact tick. A bare creaky step emits 42 raw ordinary noise once; a covered step emits 4. Rug movement emits 0.025 raw noise per unit. Holding the rug still permits coverage if its footprint is correctly placed. Rugs do not cover the entire floor automatically, block sound rings, carry cups, wedge windows, or stop the walker. Default size is 76 by 42 units; level data may tune it. A rug on the path is safe to walk across.

## 8.7 Swing door

This is a required launch addition with a constrained motion model. The door has a normalized closed-to-open position from 0 to 1. Holding and dragging its handle horizontally changes the target opening; maximum change is 1.5 per second. Opening motion emits `abs(delta_open) * (8 + 16 * open_speed^2)` ordinary noise. The door's visible sweep and handle anchor are authored. There is no general rigid-body hinge simulation.

A spring door closes at 0.35 opening units per second when unheld. At closing completion it emits 55 crash noise once if it had opened at least 0.2 since the last close. An empty cushion placed in the door socket latches it at or above 0.8 and suppresses closure; the cushion is occupied and cannot catch. At the walker's authored crossing tick, opening below 0.75 fails with “The doorway was blocked.” A one-second approach cue is mandatory. The hold-to-open path and wedge path must both be taught before a timed doorway appears. Door constants are proposed tuning; test them in isolation before content production.

## 8.8 Interaction limits

At most six selectable objects are visible in a normal launch room, counting separate cups. At most one walker and one stationary sleeper are present. An object can have one parent and at most one active role. Attachment cycles, two cushions in one socket, and one cushion occupying both window and train are invalid states. A level may use fewer families; it must not imply unsupported combinations with a misleading socket highlight.

# 9 Hard room reference specification

## 9.1 Layout and schedule

The fixture ID is `hard_room_reference`, revision 1, ruleset `prototype_v1`. It is always played in normal pace for parity tests. Coordinates below identify simulation anchors, not asset bounding boxes.

| Element | Initial position or interval | Rule |
| --- | --- | --- |
| Walker | 68, 439 | Follow the three path segments below |
| Sleeper | 343, 89 | Stationary hearing source |
| Duck | 68, 370 | Clear the first walkway |
| Cushion | 292, 400 | Floor initially |
| Train carriage | 52, 295 | Engine selection anchor is 67 units right |
| Cup A | 172, 183 | Starts wobbling at 7.4; unheld impact at 9.0 |
| Cup B | 292, 183 | Starts wobbling at 10.4; unheld impact at 12.0 |
| Window | 50, 91 | Wedge position is 50, 112; gust 8.4–12.6 |
| Cover windows | 1.8–3.25; 5.5–6.8; 11.5–12.8 | Affect both listeners |
| Finish and deadline | Earliest finish 15.0; deadline 24.0 | Cups resolved, gust ended, hand free |

Walker path: remain at (68,439) until 1.4; move linearly to (68,217) by 8.0; move linearly to (333,217) by 12.7; move upward at 52 units per second to (333,99), arriving at about 14.969. Hold at the destination afterward. The fixture's 15.0 finish time provides a small visual settle interval.

The cushion's pointer target bounds are x 28–372 and y 70–445. Its window attachment distance is strictly below 51; its train attachment distance is strictly below 43. The window wins if both match. The hard fixture has no general floor blockers and no cushion payload capacity conflict because it contains only two cups.

## 9.2 Reproducible solution witnesses

Carrier solution: at 0.15 select the cushion and target (52,295), releasing at 1.35. At 1.88 select the duck and target (150,383), releasing at 2.60. Hold the train from 5.70 to 6.00 so its release occurs under cover. Hold the window from 8.25 to 12.66. The moving cushion catches Cup A and Cup B; release the hand and allow the room to finish.

Manual solution: initially move the cushion to (172,295) instead of the train. Move the duck on the same schedule. Hold the window from 8.25 to 11.55. Select the cushion at 11.56, target (292,295), and release at 12.15. The final snore makes the remaining window noise survivable while the cushion reaches Cup B. Do not start the train.

Recovery witness: use the carrier setup but release the train at 5.60 after selecting it at 5.45. Brake it again from 7.10 to 7.50, then hold the window from 8.25 to 12.66. This proves the initial timing error need not be terminal. These witnesses are regression inputs, not scripts shown automatically during normal play.

## 9.3 Port acceptance tolerances

All eight supplied scenarios must preserve win/loss, cup count, and the immediate failure cause. Critical event times must be within one 120 Hz step of the JavaScript results. For scripted normal-mode inputs, restlessness peaks may differ by at most 0.25 until an intentional ruleset revision is approved. Browser pointer tests are a separate interface benchmark; do not expect their exact noise from scripted target jumps. Add production tests for every approved difference: integer clock, immediate failure stop, payload ownership, legal placement, and native input offset.

# 10 Level progression and content plan

## 10.1 Campaign blueprint

These are authored design briefs, not finished or validated levels. The AI must create data, a winning replay, failure checks, and a phone playtest for each room. Exact schedules are to be tuned during production. Preserve the teaching purpose when a layout changes.

| Room | Working name | Teaching or planning focus |
| --- | --- | --- |
| 01 | Tiny Squeak | Move one duck away from the path; no cover required |
| 02 | Soft Landing | Position one cushion under one cup |
| 03 | Wait for the Snore | Compare a noisy move inside and outside cover |
| 04 | Borrow a Second | Hold a cup to delay its fall, then release |
| 05 | Window Duty | Hold a gusting window while another hazard approaches |
| 06 | One Hand | First choice between a manual catch and a window wedge |
| 07 | Quiet Wheels | Brake and release a train; show its carriage socket |
| 08 | Special Delivery | Put the cushion on the train for one catch |
| 09 | Second Stop | Two sequential catches on the moving cushion |
| 10 | Too Soon | Recover a slightly early train by braking |
| 11 | Change of Plan | Retrieve the cushion for a manual catch |
| 12 | Night Shift | Player-facing version of the hard reference room |
| 13 | Creaky Board | Cover one authored footstep with a rug |
| 14 | Narrow Runner | Reposition the rug between two separate step times |
| 15 | Open Gently | Introduce controlled door opening without deadline pressure |
| 16 | A Cushion in the Door | Trade a catching tool for a door wedge |
| 17 | The Light Sleeper | Reposition noise farther from a second listener |
| 18 | Quiet Passage | Combine doorway access with one catch and one step |
| 19 | First Things First | Preparatory placement before two overlapping hazards |
| 20 | Just Enough Quiet | Survive one small mistake and recover restlessness |
| 21 | Two Ways Home | Clearly support an automatic and a manual strategy |
| 22 | Leave It Late | Delay a cup so a cover window becomes useful |
| 23 | Last Free Hand | Reuse a tool after one hazard permanently ends |
| 24 | Goodnight House | Final combination with visible recovery opportunities |

Room 6 must not require one cushion to be in two places at the same moment; its intended lesson is choosing a viable schedule. Rooms 13 onward introduce new rules gradually rather than adding rug and door to every earlier room. No room may exceed the object limit merely to make a chapter finale look busy.

## 10.2 Unlocks and rewards

Room 1 is available initially. Completing a base room unlocks the next; completing Room 24 unlocks all twelve remixes. Hints and relaxed pace do not block progression. There is no life counter or retry cost. Unlock a decorative cushion fabric after each completed chapter; selection changes art only, never collisions or noise. All unlocked rooms can be replayed freely.

## 10.3 Remixes

Create three remixes for each chapter using its final two rooms as bases. Each remix changes exactly one primary constraint and may adjust dependent timings to remain fair. Display that change before Start: “The snore arrives later” or “The cushion starts at the window.” Store a distinct level ID and revision, not a hidden random seed that changes on retry. Require two distinct winning strategies for Rooms 12, 21, 24 and at least four remixes; other rooms need one robust solution witness.

# 11 Results and mastery

## 11.1 Completion and Quiet Night

A completed room receives a completion mark. A separate Quiet Night badge requires completion, every authored preservation objective met, peak restlessness below the room's mastery threshold, no hint used, and no teaching pause. The initial hard-room threshold is 60, with both cups caught and no duck step. Thresholds are level data and must be validated with at least one winning replay. Lowering a threshold after release does not revoke previously earned badges.

Normal and relaxed records are labeled separately. Both unlock the campaign. A Quiet Night earned in relaxed mode is recorded as relaxed; it is never silently presented as a normal-mode record. No rewards depend on rapid repeat tapping or time spent waiting in menus.

## 11.2 Result screen

Show outcome first, then at most three facts: cups or objects saved, highest restlessness, and whether Quiet Night was earned. Loss shows the causal object and one useful observation. Primary action is Retry after a loss and Next Room after a win. Retry clears every model field, queued input, listener meter, attachment, sound loop, and hint-use flag for the new attempt; it must never inherit an old cup timer.

Optional hints have two steps: a nudge identifying the interaction to reconsider, then a clear strategy suggestion. Pause while a hint is open. Show that the current run will not earn Quiet Night when the player opens a hint; completion remains eligible. Repeated loss may offer a hint, but must not automatically slow the game or move an object for the player.

# 12 Screens and player journeys

| Screen | Required content and behavior | Empty or exceptional state |
| --- | --- | --- |
| Home | Continue, Rooms, Settings; latest unlocked room | New install highlights Start |
| Room select | Four chapters, completion and mastery marks, remix tab | Locked room explains its prerequisite |
| Pre-room | Room name, goal, still room, Start, back, optional rule card | Invalid level shows a recoverable error in development; excluded from release |
| Playing | Room, both listener indicators, cover cue, pause; minimal text | No gameplay behind a modal |
| Pause | Resume, Retry, Settings, Rooms; pending-release explanation | Background return always lands here |
| Result | Cause or success, records, Retry and Next/Rooms | Next is hidden on final content; offer remixes |
| Settings | Sound effects, music, haptics, reduced motion, pace, text size, credits, reset progress | Reset requires confirmation; cancel preserves data |
| Help | Gesture examples, object roles, cover explanation | Readable without sound or a running room |

First launch goes to a short welcome and Room 1, not a long carousel. Start Room 1 with the path and duck visibly highlighted; the first valid drag dismisses the gesture cue. Later mechanic cards appear once, can be replayed from Help, and are brief. Settings changes apply immediately except pace, which restarts the room after an explicit confirmation because it changes record eligibility. Returning to a room from Home begins Ready; only an in-memory interrupted session can Resume.

# 13 Art animation and audio

## 13.1 Visual direction

Use a warm illustrated bedroom with clear silhouettes, soft shadows, and a cool night background. Reserve the brightest accent for actionable objects and the highest contrast for danger feedback. The emotional tone is mischievous care. The walker is sleepy and endearing; a wake-up is a brief comic surprise. Keep the path, landing zones, and hand occupancy readable at a glance. Background clutter must not resemble selectable props.

Use 2D sprites and controlled animation with stable pivots. The room is a fixed camera composition; no camera movement is necessary to solve launch rooms. Foreground layers must not occlude a required cue. Avoid realistic 3D physics that makes authored timing unstable. Asset replacements must preserve anchors, collision data, socket positions, and event timing.

## 13.2 Required asset families

The kit's `assets/asset_manifest.csv` lists placeholders and final deliverables. Include the walker in sleeping walk, stirring, waking, and safe-bed states; the sleeper in calm, stirring, near-wake, and waking states; duck, cushion variants, train, cup stages, window stages, rug, door stages, room backgrounds, UI icons, and effects. Supply source files where licensed, export dimensions, pivots, frame counts, import settings, and license/provenance entries. Generated art may be used after visual consistency and rights review; it is never accepted solely because a file exists.

For asset generation, begin with a single style sheet and neutral orthographic game sprites. Generate assets separately with transparent backgrounds, consistent light direction, and the needed state list. Do not generate text inside the image. Human-readable UI text stays in localization resources. Placeholder assets are acceptable through M1; M3 cannot ship placeholder tones, temporary licensing, or mismatched pivots.

## 13.3 Feedback budget

Use a soft lift/settle animation on selection, socket preview, restrained noise rings, an expressive sleeper reaction, and a small success flourish. Limit visible noise pulses to twelve; expire them after 0.7 seconds. Coalesce continuous sound feedback rather than creating an audio voice every simulation tick. Reduced motion removes shaking, large pulses, and celebratory travel, while keeping static status indicators and essential cup movement.

Audio layers: subtle room ambience, soft optional music, scrape loop intensity driven by movement, cup catch/crash, duck squeak, train release/rolling, window rattle, door creak/slam, snore cover, UI taps, success and wake-up. Snoring is helpful feedback, not required input. Separate music and effects controls. Pause/focus loss stops or suspends loops; resume reconstructs only currently active loops. Haptics are optional and throttled; device support failure is harmless.

# 14 Accessibility and localization

The entire campaign must be playable muted. Encode safe/unsafe and covered/uncovered using shape, animation, text, and color together. Use high-contrast text, avoid rapidly flashing effects, respect safe areas, and test enlarged text without truncating action labels. Menu focus order follows reading order. Give interactive elements meaningful labels, and keep controls separated from system gesture edges.

Relaxed pace is a setting, initially off. It slows autonomous motion and hazard time to 75% while maintaining responsive hand movement. Run the model on a fixed 120 Hz active-time clock, but advance the room clock, path, instability, continuous environmental noise, and recovery by `delta * 0.75`. Hand movement and its speed-dependent noise use the unscaled delta. Thus a longer real-world gust does not accumulate extra total noise just because relaxed mode is slower. Record replays with both active tick and room-clock position; parity scenarios run only at scale 1.

Use localization keys for every string, including object names, failure causes, hints, and accessibility labels. English is the required launch language. Text must tolerate at least 30% expansion. Keep numbers and plurals locale-aware and avoid text baked into art. A later right-to-left interface must not automatically mirror physics coordinates or replay paths; world composition changes require separate tested layouts.

# 15 Data save privacy and diagnostics

## 15.1 Local save contract

Persist schema version, completed level IDs, normal/relaxed mastery marks, best per-mode peak restlessness, unlocked cosmetics, selected cosmetic, tutorial flags, and settings. Store level revision with each record. The save is local, small, and independent of room scene files. No account is required.

Write a new save to a temporary file, flush and close, validate it, then replace the primary save using the safest atomic operation available on the platform. Retain one valid backup. Save after results, unlocks, and settings changes, not every simulation tick. On startup validate type, range, and schema; migrate supported older versions through explicit functions. On corruption recover the backup, or create defaults with a brief explanation. Never crash or silently report nonexistent progress.

An interrupted in-memory run can resume from Paused. If the operating system kills the process, relaunch to the pre-room screen with completed progress intact; exact mid-room persistence is excluded. A reset-progress action requires confirmation and affects progression, while leaving accessibility preferences intact unless the user chooses a separate reset-all action.

## 15.2 Privacy and observability

Launch default is no third-party analytics, no network telemetry, and no advertising identifier. Keep an optional local debug ring buffer with level ID/revision, build version, attempt outcome, failure source, peak restlessness, hint use, and mode. Debug exports require an explicit user action and contain no names, contacts, microphone data, or device advertising ID. Shipping builds may omit replay recording to reduce storage; crash diagnostics supplied by the stores are handled through their ordinary developer facilities.

For formative testing, the owner may collect participant feedback and explicitly shared diagnostics outside the game. If remote analytics later becomes necessary, create a separate consent, retention, privacy, and data minimization specification. Store privacy declarations must describe the actual final binary and included SDKs, rather than copying this intended no-collection posture without an audit.

# 16 Platforms and quality budgets

## 16.1 Technology decision

Use Godot 4.7.2 standard edition with typed GDScript and the Compatibility renderer. Pin the editor and matching export templates in the project setup record; the official archive listed 4.7.2 stable when checked on 2 October 2026 [S01]. GDScript is selected to keep this small 2D mobile project on a straightforward supported path; the current Godot documentation describes mobile C# export as experimental [S02–S04]. Compatibility is suited to this modest 2D workload and broad device coverage [S05]. Do not mix C# and GDScript or upgrade the engine mid-milestone without a tested decision.

Android is the first physical-device development target. Perform an early iOS export smoke test so signing and toolchain problems do not appear at the end. Godot iOS export requires macOS and Xcode [S03]. Browser play is useful for quick review, but native touch, lifecycle, audio, thermal behavior, and release signing require native validation.

## 16.2 Support targets and submission constraints

Chosen product floors: Android 10 / API 29 and iOS 16, subject to native engine validation. Support ARM64 release builds. These floors describe the oldest devices the product intends to support; they are distinct from the build SDK and store target requirements. If a floor cannot be supported, document evidence and get a product decision before changing the advertised support list.

As checked on 2 October 2026, Google Play requires new mobile apps and updates to target Android 16 / API 36 or higher [S06]. Some Godot Android setup examples still list an earlier SDK; the release configuration must satisfy the current store requirement. Use the documented Android toolchain with OpenJDK 17 and compatible SDK components [S02], then verify the actual built manifest and bundle.

Apple currently requires uploads built with Xcode 26 or later using the iOS 26 SDK or later [S07]. This does not mean the deployment floor must be iOS 26; the proposed product floor remains iOS 16 if the complete toolchain supports it. Recheck both stores immediately before submission. Record exact editor, templates, JDK, Android SDK/NDK/build tools, macOS, Xcode, and export preset versions in `BUILD_ENVIRONMENT.md`.

## 16.3 Quality targets

| Attribute | Target | Measurement |
| --- | --- | --- |
| Frame rate | Stable 60 fps on selected midrange phones; 30 fps minimum on support-floor test devices | Ten-minute repeated-room session, frame-time distribution |
| Input response | 95th percentile under 100 ms from touch to visible response | Device capture or instrumented timestamp plus frame presentation |
| Warm retry | Under 0.5 seconds to Ready | At least 20 repeats on the slowest test device |
| Cold start | Under 3 seconds to usable Home after OS launch | Release build, median and worst of 5 starts |
| Memory | Under 250 MB steady resident footprint; no growing trend | Ten-minute soak plus repeated scene changes |
| Download size | Target under 150 MB compressed per store delivery | Inspect store package estimate; no duplicate source assets |
| Offline behavior | All gameplay and progress work in airplane mode | Fresh launch, room completion, relaunch |
| Stability | No reproducible crashes, hangs, save loss, or soft locks in release suite | Device matrix and regression report |

These are requirements to measure, not achieved prototype metrics. If rendering is slow, reduce decorative particles or texture memory first. Do not change simulation frequency, input rules, or hazard timing based on frame rate. For a long frame, execute at most 0.25 seconds of accumulated simulation per render frame; if still behind, auto-pause with “Game paused after an interruption” and clear wall-time backlog. Resume from the frozen model without advancing through unseen hazards.

The minimum device matrix includes one Android device at the support floor or closest feasible representative, one current midrange Android device with a tall/notched screen, one older supported iPhone, one current iPhone, and a tablet layout test. Record actual model and OS names when available; do not fabricate ownership or completed device testing.

# 17 Software architecture

## 17.1 Model and presentation separation

The room model owns all gameplay state and must run without a rendered scene. Node-based views render snapshots and consume presentation events. UI never directly edits cup age, listener meters, or win flags. Audio and haptic adapters subscribe to events and cannot influence the model. This permits fast headless regression tests and makes AI changes easier to verify.

| Component | Responsibility | Must not own |
| --- | --- | --- |
| AppStateMachine | Home, room, pause, results and lifecycle | Noise or hazard formulas |
| InputRouter | Pointer ownership, coordinate conversion, command queue | Direct prop teleports |
| SimulationClock | Fixed stepping, pace, interruption policy | Render animation timing |
| RoomModel | Authoritative object and listener state | Scene tree or audio resources |
| HazardScheduler | Authored triggers and persistent progress | Random changes during a run |
| NoiseSystem | Masking, distance gain, threshold and recovery | Visual ring collisions |
| AttachmentSystem | Parent ownership, slots, propagation | Reparenting scene nodes as game truth |
| CollisionResolver | Legal movement and declared blockers | Decorative art geometry |
| RuleEvaluator | Completion, mastery and failure | Save writes |
| LevelRepository | Parse, validate and version level data | Silently repair invalid release data |
| SaveService | Atomic persistence, migration and recovery | Live room simulation |
| ReplayRecorder | Inputs, build/ruleset IDs and event evidence | Changing inputs to force a passing result |

Use typed value objects for commands, listener states, object states, and events. Keep IDs stable across reloads. Avoid a single large script that combines menus, physics, art, storage, and scoring. A small number of well-defined services is preferable to a general framework or plugin architecture.

## 17.2 Command and event contracts

```text
InputCommand:
  active_tick, sequence, pointer_id
  action: select | target | release | pause | resume
  object_id when selecting; world_x/world_y when targeting

NoiseEvent:
  room_tick, source_id, category, position, raw_amount
  per_listener: mask_multiplier, distance, gain

OutcomeEvent:
  room_tick, result, cause_id, explanation_key
  caught_count, peak_by_listener, objectives, mode
```

Use stable sequence numbers for commands arriving on the same step. A rejected command is logged in development with a reason and has no side effect. Maintain a maximum bounded event history; a long pause or held input cannot grow memory indefinitely. Public model interfaces should support `reset(level, mode)`, `apply(command)`, `step(delta)`, `snapshot()`, and `summary()` with documented types.

## 17.3 Suggested project layout

```text
project.godot
app/                 screens and app state
game/model/          pure rules, values and clocks
game/view/           sprites, feedback, sound adapters
game/input/          native and keyboard input routing
data/levels/         versioned room JSON
data/localization/   strings
assets/              imported production assets
services/            save, lifecycle and diagnostics
tests/unit/          isolated model rules
tests/scenarios/     deterministic solution replays
tests/integration/   scenes, input and persistence
tools/               validation and build scripts
docs/                decisions, status and build evidence
```

Use Godot's headless mode for model tests with a small in-project test runner, avoiding an extra testing plugin unless a clear need appears. Pin any dependency that is introduced. Commit source assets when reasonably sized and use an appropriate large-file strategy if necessary; never commit signing passwords, store keys, or generated build caches.

# 18 Level data and authoring contract

## 18.1 Versioned data

Each level includes schema version, level ID, revision, ruleset, display-name key, chapter/order, world bounds, timing, listener definitions, walker path, noise parameters, cover windows, object definitions, environmental triggers, completion requirements, mastery requirements, and hint keys. The development kit provides `level.schema.json` and `hard_room_reference.json` for the current reference families. Rug and door parameters must extend that contract with a schema-version change before their authoring phase; do not add unvalidated free-form fields.

The supplied fixture is an authoring and porting contract, not an already implemented Godot loader. The reference JavaScript uses its original constants. Phase 1 must assert that imported fixture values agree with that model; Phase 2 implements the native loader. The supplied validation script checks structure and key semantic invariants; the production validator must add layout, reachability, asset, and solution checks described below.

## 18.2 Validation obligations

Reject duplicate IDs, unsupported schema/ruleset versions, missing listeners or referenced objects, out-of-bounds anchors, invalid time intervals, negative durations/noise, invalid path ordering, unsupported interactions, cyclic attachments, excess capacity, required hazards after the deadline, and missing localization or asset references. Reject a mastery target that has no passing witness. Detect overlapping hit targets and either reject them or demand an explicit priority and phone review.

A valid data file does not prove a fun or solvable room. For every room, store at least one replay that completes it with a reasonable margin. For the specified multi-solution rooms, store two replays using different object-role sequences. Perturb selected action times by plus/minus 0.15 seconds and test that the intended normal solution remains robust where the room promises a broad window. A failed perturbation is design evidence, not a reason to weaken the test secretly.

## 18.3 Developer inspector

Provide development toggles for path, hit areas, legal regions, sockets, source noise, listener contribution, object state, and upcoming triggers. Allow pause, single-step, restart, and replay loading. Do not ship tuning sliders that mutate campaign data for players. Editing a room increments revision and invalidates old comparison baselines until rerun; existing earned player progress remains intact.

# 19 Requirements register

Priority P0 means required before M2, unless the row explicitly says M1. P1 means required for M3. Deferred features are outside launch. Each requirement has a matching acceptance case in Section 21; detailed behavior in earlier sections is normative, not optional commentary.

| ID | Requirement | Priority and gate |
| --- | --- | --- |
| FR01 | Reproduce all hard-reference scenario outcomes and timing tolerances | P0 M1 |
| FR02 | Enforce one gameplay pointer and normal release semantics | P0 M1 |
| FR03 | Move props with constraints, lag cap, and actual-distance noise | P0 M2 |
| FR04 | Preserve cup progress across holds and reject airborne grabs | P0 M1 |
| FR05 | Apply per-listener masking, distance, accumulation, and recovery | P0 M1 |
| FR06 | Support cushion catch, carry, wedge and consistent payload ownership | P0 M2 |
| FR07 | Support train braking, release noise, motion and docking | P0 M1 |
| FR08 | Support timed window gusts, holding, and persistent wedges | P0 M1 |
| FR09 | Resolve failure immediately and completion only when eligible | P0 M2 |
| FR10 | Pause safely on lifecycle and input cancellation | P0 M2 |
| FR11 | Retry resets every gameplay and presentation state | P0 M1 |
| FR12 | Provide onboarding, hints, causal results, and level navigation | P0 M2 |
| FR13 | Add rug-step and controlled door families with isolated tests | P1 M3 |
| FR14 | Deliver 24 rooms and 12 validated remixes with defined unlocks | P1 M3 |
| FR15 | Track completion, mode-specific mastery and cosmetic unlocks | P1 M3 |
| FR16 | Persist versioned progress/settings and recover corrupted saves | P0 M2 |
| FR17 | Support muted play, reduced motion, larger text and relaxed pace | P0 M2 |
| FR18 | Parse and validate level data; reject unsupported content | P0 M2 |
| FR19 | Supply replays and bounded development diagnostics | P0 M1 |
| FR20 | Use final consistent assets, audio, localization keys and licenses | P1 M3 |
| NFR01 | Meet native input, frame, memory, startup and size targets | P0 sample at M2; full M3 |
| NFR02 | Work offline and collect no runtime telemetry by default | P0 M2 |
| NFR03 | Produce reproducible signed release candidates with secrets excluded | P1 M3 |
| NFR04 | Handle support layouts and all required menu accessibility | P0 M2 |
| NFR05 | Leave no known reproducible crash, save-loss or soft-lock defect | P0 every milestone |

# 20 AI development workflow

## 20.1 Operating rules for the coding AI

Treat this BRD as the source of requirements, the supplied fixture as the initial balance contract, and the browser reference as an executable behavior baseline. Ask only when a missing decision materially blocks work; otherwise use the defaults here and record the assumption. Read existing repository instructions before editing. Make small coherent changes and run the relevant evidence gate after each stage.

Never call a feature complete because a button exists or a screenshot looks right. Never replace a failing test with a looser assertion without recording the intended rule change. Never report an emulator result as a physical-device result, a debug build as a store-ready build, or a scripted solution as user research. Keep a status file listing implemented requirements, test evidence, known defects, and the next concrete step so another AI can continue without inventing project state.

## 20.2 Build phases

| Phase | Implementation work | Required exit evidence |
| --- | --- | --- |
| 0 Environment | Inspect workspace; create project; pin engine/templates; configure source control; inventory Android/iOS tools | Empty project runs; environment file; exact blockers listed; no fake export claims |
| 1 Reference model | Port hard-room rules into pure typed model; add scenario runner and command replay | Eight scenarios plus rule tests pass within tolerances |
| 2 Native interaction | Add room view, touch routing, bounds, attachments, pause/lifecycle, level loader | Touch run on Android; iOS export smoke test; key edge cases pass |
| 3 Vertical slice | Finish three rooms, teaching, results, hint, audio/visual feedback, settings and basic save | Device/performance report; owner-run formative playtest; M2 decision |
| 4 Meta and families | Complete progress/mastery/cosmetics, save migration, rug, door, authoring tools | Isolated family tests and save/lifecycle regression pass |
| 5 Content | Author remaining campaign and remixes, tune schedules, record witnesses | 36 validated data files; required multi-solution and robustness evidence |
| 6 Production polish | Replace placeholders; finish audio, localization keys, credits and asset provenance | Asset audit; muted and accessibility tests; layout review |
| 7 Release QA | Run complete regression/device matrix, profiling, offline and interruption soak | No open blockers; release candidate IDs; reproducible build instructions |
| 8 Store handoff | Prepare icons, screenshots, descriptions, privacy declarations, ratings and signed packages | Owner reviews concrete release package and authorizes submission |

Phases are sequential gates, not a promise of a fixed schedule. The coding AI may fix cross-cutting defects when needed, but should not start broad content production before the fun gate. If iOS tools are unavailable, finish authorized platform-independent and Android work, produce the exact iOS setup checklist, and mark iOS verification blocked; do not claim the end-to-end release is complete.

## 20.3 Ready-to-paste starting instruction

```text
Build Hush! from this BRD and development kit.
Start with Phase 0, then implement Phase 1 only.
Use Godot 4.7.2, typed GDScript, Compatibility renderer.
Inspect the repository and instructions before changing files.
Keep gameplay in a headless-testable model.
Use prototype/core.js and its recorded scenarios as the baseline.
Do not change balance to make tests pass.
Record approved production differences explicitly.
Run tests, report exact evidence, and update docs/STATUS.md.
Do not add services, purchases, accounts, or extra mechanics.
Continue through the current phase until its gate passes or
a concrete external dependency blocks it.
```

The kit includes prompts for every subsequent phase. Give the AI the whole kit as files, not an instruction to remember an earlier chat. Require a git commit or equivalent recoverable checkpoint after each passing gate. Keep credentials outside the repository and provide them only through the platform's supported secure configuration when needed.

# 21 Acceptance tests and release evidence

The accompanying `qa/acceptance_tests.csv` is the executable-work checklist. “Automated” here means a test to implement in the native project unless it is explicitly identified as supplied browser evidence. A row is not passed merely because it appears in this BRD.

| Test | Requirement | Required result |
| --- | --- | --- |
| AT01 | FR01 | All eight reference scenarios preserve result/cups/cause and timing/peak tolerances |
| AT02 | FR02 | Second touch cannot select or move another object; UI pause still works |
| AT03 | FR03 | Fast and slow paths produce intended noise; blocked movement cannot tunnel or charge phantom distance |
| AT04 | FR04 | Cup age freezes while held, resumes exactly, never resets; airborne selection rejected |
| AT05 | FR05 | Mask boundaries, distance falloff, epsilon, quiet delay, recovery floor and threshold verified |
| AT06 | FR06 | Catch boundaries and capacity work; cups follow cushion across train detach; loaded cushion cannot wedge |
| AT07 | FR07 | Start/restart noise differ; braking freezes train; docking prevents restart; cargo follows |
| AT08 | FR08 | Gust emits only in interval; hand/wedge suppress it; retrieval restores active rattle |
| AT09 | FR09 | Same-step loss beats win; unresolved hazard/held object blocks completion; deadline explains cause |
| AT10 | FR10 | Cancel, focus loss, pause, background and resume preserve clocks and apply release exactly once |
| AT11 | FR11 | Fifty retries leave no inherited state, duplicate signal, extra loop or increasing memory trend |
| AT12 | FR12 | New players complete teaching; hints pause; result cause is accurate; all navigation works |
| AT13 | FR13 | Rug checks exact footprint at contact; door opening, spring, wedge and crossing threshold pass |
| AT14 | FR14 | All 36 levels validate and win; specified rooms have two distinct witnesses and timing-margin checks |
| AT15 | FR15 | Unlock sequence and cosmetic milestones work; normal/relaxed/hinted records never mix |
| AT16 | FR16 | Fresh, migrated, truncated, corrupted, backup-only and interrupted saves load safely |
| AT17 | FR17 | Whole slice wins muted; reduced motion retains cues; relaxed pace preserves integrated environmental noise |
| AT18 | FR18 | Malformed data and broken references fail clearly; no invalid level reaches a release package |
| AT19 | FR19 | Same build/data/input replay yields equivalent outcomes; log buffers remain bounded |
| AT20 | FR20 | No missing assets/strings/licenses/placeholders; event timing unchanged after art replacement |
| AT21 | NFR01 | Named physical devices meet budgets in release builds; deviations documented and resolved |
| AT22 | NFR02 | Airplane-mode start/play/save works; binary network/SDK audit matches privacy declarations |
| AT23 | NFR03 | Clean checkout builds reproducibly; secrets absent; signing and store package checks pass |
| AT24 | NFR04 | Small/tall/notched/tablet layouts, enlarged text, focus and menu labels pass review |
| AT25 | NFR05 | Soak/interruption/fuzz suite yields no known crash, lost progress, hang or soft lock |

Test the cover start tick, the tick before its end, and its excluded end tick. Test catch edges just inside, exactly on, and just outside each threshold. Test the train released on pause-resume while cover is active and inactive. Test a cup tipping while a stale selection command is queued. Test a corrupted save without treating every failure as a clean new install. These are high-value semantic checks, not tests that merely mirror the implementation line by line.

Keep test reports with build hash, engine version, level revision, mode, device/OS or headless environment, date, and evidence path. Define a release blocker as a crash, save loss, impossible required level, incorrect outcome, inaccessible essential control, unlicensed required asset, unresolved submission requirement, or a materially misleading privacy declaration. Cosmetic defects may be deferred only when recorded and not obstructing play.

# 22 Release and operating plan

## 22.1 Build and distribution

Maintain separate debug and release export presets. Android release uses a signed AAB and protected release keystore; verify package identifier, version code, target API, supported ABIs, and debug flags. iOS uses a signed archive with the correct bundle identifier, team, deployment target and capabilities. Store credentials and signing secrets remain outside source control. Version game code, content revision, and save schema separately.

The owner chooses final app identifiers, store accounts, price, territories, support contact, and legal display information before publication. Development uses clearly temporary reverse-domain identifiers; changing them before any public release is expected. The AI may prepare build scripts and submission materials, but actual signing/account actions must use available authorized credentials, and publication needs the owner's explicit go-ahead on the concrete release candidate.

## 22.2 Store materials

Produce a final icon, feature artwork where required, screenshots from the actual shipping build, a short description, full description, support page/contact, privacy page, credits/licenses, and completed content-rating questionnaires. Do not market unsupplied features or show prototype art as final gameplay. Verify asset dimensions and the current store form fields at submission time. Review “Hush!” name availability and branding before purchasing identity assets or submitting.

## 22.3 Post-release maintenance

Retain the signed release's source tag, build environment, level data, and save fixtures. A patch runs the full model suite and targeted device tests before release. Preserve player progress across content changes; a removed level's earned rewards remain credited. Use store crash reports and explicitly shared feedback to prioritize defects. Expansion rooms, translations, cloud save, analytics, and monetization changes require new scoped requirements, not silent additions during a bug fix.

# 23 Risks assumptions and owner decisions

| Risk or assumption | Response | Decision point |
| --- | --- | --- |
| Game is understandable but not enjoyable | Observe retries and alternate strategies; revise before mass content | M2 |
| One solution dominates every room | Change object roles, ordering and spatial hearing; require selected multi-solution witnesses | Content review |
| Finger hides critical action | Offset feedback, enlarge targets, review smallest phone layout | M2 native touch test |
| Timing feels arbitrary | Add cues and robust margins; shorten retries; retain recovery paths | Each room acceptance |
| AI drifts from core rules | Pure model, fixed fixtures, small stages and explicit change log | Every phase |
| General physics causes unstable outcomes | Controlled authored motion and explicit collision/attachment rules | Architecture review |
| Native toolchain is unavailable | Export smoke test early; list exact external dependency and continue unblocked work | Phase 0–2 |
| New rug/door mechanics add scope | Implement isolated tests first; simplify content rather than multiplying systems | Phase 4 |
| Title or assets cannot be used | Check title before release; maintain provenance and replace uncertain assets | Before final branding |
| Store requirements change | Recheck primary sources and inspect actual packages | Release candidate |

Implementation defaults are decided in this BRD: Godot/GDScript, offline local save, portrait, paid-download business model, 24 base rooms plus 12 remixes, and no external SDKs. They are proposals that let development proceed, not claims of prior owner approval. Owner-only release decisions remain the final title, store identifiers/accounts, price/countries, licensed asset approvals, supported-device commitment after testing, and submission approval. None requires delaying the reference model work.

If M2 fails its fun gate, stop content expansion and run a short design iteration. If M2 passes but budget is constrained, propose a smaller first release with a new explicit scope baseline. Do not hide missing rooms or call a three-room slice the completed 36-room product.

# 24 References and handoff inventory

## 24.1 Evidence included with the kit

E01: `prototype/core.js` — executable hard-room model. E02: `prototype/scenarios.js` and `prototype/evidence/scenarios.json` — eight scripted outcomes. E03: `prototype/check-rules.js` and `prototype/evidence/rule-checks.json` — six rule groups. E04: `prototype/evidence/browser-results.json` — recorded mouse/touch wins, pause/help checks, layout measurements, and no recorded browser errors. E05: `prototype/preview.html` — standalone interactive browser reference. Recorded evidence is historical, not a substitute for rerunning the native port.

The kit also contains this BRD, a start-here README, phase prompts, an AI working agreement, the level schema and reference fixture, solution witness data, a dependency-free validation script, acceptance and playtest templates, an asset manifest, a release checklist, and a status template. The prototype code remains a reference implementation; the kit does not contain an already built Godot project, native binary, final asset set, or completed human playtest.

## 24.2 Primary technical sources

Sources checked 2 October 2026. Technical and store requirements may change; recheck at implementation and submission. Product-specific formulas, scope, and acceptance targets in this BRD are original design decisions based on the supplied prototype, rather than requirements imposed by these sources.

| Source | Official reference | Used for |
| --- | --- | --- |
| S01 | https://godotengine.org/download/archive/ | Stable engine baseline |
| S02 | https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_android.html | Android toolchain, export and signing |
| S03 | https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_ios.html | macOS/Xcode and iOS export constraints |
| S04 | https://docs.godotengine.org/en/stable/tutorials/scripting/c_sharp/index.html | Mobile C# status informing language choice |
| S05 | https://docs.godotengine.org/en/stable/tutorials/rendering/renderers.html | Renderer selection |
| S06 | https://support.google.com/googleplay/android-developer/answer/11926878 | Current Android target API requirement |
| S07 | https://developer.apple.com/news/upcoming-requirements/ | Current Apple SDK submission requirements |

## 24.3 Definition of done

Hush! is complete for launch only when all included requirements are implemented, every shipped room is validated and playable, native release builds pass the agreed device matrix, assets and store disclosures are accurate, player progress survives the required failure cases, the owner has reviewed the actual release candidate, and submission is authorized. The three-room slice is the checkpoint for whether the game deserves that full build.
