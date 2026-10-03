# Reference data contract

Schema dialect: JSON Schema draft 2020-12. IDs are case-sensitive. World units are pixels in the 400x474 reference coordinate space, not physical screen pixels. All noise amounts are dimensionless game balance units. Rates are per room second, except hand movement uses unscaled active-time delta in relaxed mode. This reference fixture only permits normal mode.

Time intervals are half-open. A cup trigger occurs at its authored time and begins accumulating instability on that step, matching core.js. Replay commands are applied at the start of the step before the clock advances. `at_tick = ceil(at_seconds * 120 - 1e-7)` is the input boundary index. Equal-time commands execute by `sequence` so select precedes target. The included runner uses source seconds to reproduce the historical JS accumulator behavior exactly; native tests use integer ticks and allow the BRD's one-step timing tolerance.

All catch/snap thresholds use strict less-than. Source-local listener gain is raw amount times mask multiplier divided by (1 + distance/300). Cover combines by the strongest applicable single multiplier. No masking removes earlier restlessness. The historical fixture has no overlapping cover intervals.

Reference object ID `pillow` is intentionally retained to match executable code, although the user-facing role is “cushion.” Train position is the carriage position; engine hit target is +67 x and release noise source is +35 x. Window wedge position adds (0,21).

Mastery is proposed production behavior; the JS model records caught count and peaks but does not award badges. Production payload capacity (two), loaded-cushion wedge rejection, collision regions, integer clock and immediate failure stop are documented BRD differences. Add them to a new ruleset and schema with regression tests; do not claim that they are implemented by prototype_v1.

The schema does not yet model arbitrary solid blockers, attachment trees, rug or door. Phase 2 adds production common structures and Phase 4 adds new families through explicit schema revisions. The example.invalid schema ID is an identifier only and must not be fetched from a network. All $refs are local definitions.
