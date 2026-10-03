#!/usr/bin/env node
// Planning probe, not production code.
//
// Loads the preserved reference model (kit/prototype/core.js) unchanged on disk,
// applies two BRD-approved production differences in memory, and replays the
// eight kit scenarios on integer command ticks:
//   1. Integer clock: t = tick / 120 instead of accumulating t += 1/120 (BRD 5.1).
//   2. Immediate failure stop: no later phase of a step runs after a loss (BRD 5.3).
//
// It answers one question before the Godot port starts: do these differences stay
// inside the BRD 9.3 tolerances (one 120 Hz step for timing, 0.25 for peaks)?
// With --write it also emits the integer-clock expectations the native port can
// match tightly, as a second oracle beside the kit's historical values.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const kit = path.join(root, 'kit');
let src = fs.readFileSync(path.join(kit, 'prototype/core.js'), 'utf8');

function patch(from, to) {
  if (!src.includes(from)) throw new Error(`core.js changed; patch anchor missing: ${from}`);
  src = src.replace(from, to);
}
patch('this.t=0;this.acc=0;', 'this.k=0;this.t=0;this.acc=0;');
patch('const dt=this.dt;this.t+=dt;', 'const dt=this.dt;this.k++;this.t=this.k/120;');
for (const anchor of [
  '   this.positionWalker();',
  '   for(const c of this.cups){',
  '   if(this.gust&&!this.braced)',
  '   for(const e of [this.walker,this.sleeper])if(this.t-e.last',
]) patch(anchor, "   if(this.state!=='running')return;\n" + anchor);

const sandbox = {module: {exports: {}}, globalThis: {}};
vm.runInNewContext(src, sandbox);
const {HardRoom} = sandbox.module.exports;

const replays = JSON.parse(fs.readFileSync(path.join(kit, 'data/reference_replays.json'), 'utf8'));
const TICK = 1 / 120, PEAK_TOL = 0.25, MAX_TICKS = 24 * 120 + 2;
const out = {
  generated_by: 'tools/integer_clock_probe.js',
  note: 'Reference model with integer clock and immediate failure stop. Second oracle for the native port; kit/data/reference_replays.json remains the contract.',
  cases: [],
};
let failures = 0;
const worst = {peak: 0, finish: 0, event: 0};

for (const test of replays.cases) {
  const s = new HardRoom();
  s.start();
  let i = 0;
  while (s.state === 'running' && s.k <= MAX_TICKS) {
    while (i < test.commands.length && test.commands[i].at_tick <= s.k) {
      const c = test.commands[i++];
      if (c.action === 'select') {
        if (!s.select(c.object_id)) throw new Error(`${test.name}: selection rejected at tick ${s.k}`);
      } else if (c.action === 'target') s.target(c.x, c.y);
      else if (c.action === 'release') s.release();
      else throw new Error(`Unsupported command ${c.action}`);
    }
    s.tick();
  }
  const r = s.summary(), e = test.expected;
  const dPeak = Math.max(Math.abs(r.peakWalker - e.peakWalker), Math.abs(r.peakSleeper - e.peakSleeper));
  const dFinish = Math.abs(r.time - e.time);
  const dEvent = Math.max(0, ...r.events.map((ev, j) => Math.abs(ev.t - (e.events[j] ? e.events[j].t : Infinity))));
  const sameShape = r.state === e.state && r.caught === e.caught && r.reason === e.reason
    && r.events.length === e.events.length && r.events.every((ev, j) => ev.label === e.events[j].label);
  const ok = sameShape && dPeak <= PEAK_TOL && dFinish <= TICK + 1e-9 && dEvent <= TICK + 1e-9;
  if (!ok) failures++;
  worst.peak = Math.max(worst.peak, dPeak);
  worst.finish = Math.max(worst.finish, dFinish);
  worst.event = Math.max(worst.event, dEvent);
  console.log(`${ok ? 'PASS' : 'FAIL'} ${test.name.padEnd(36)} ${r.state} tick=${s.k} t=${r.time} (ref ${e.time}) ` +
    `caught=${r.caught} dPeak=${dPeak.toFixed(3)} dEvent=${dEvent.toFixed(4)}`);
  out.cases.push({name: test.name, final_tick: s.k, summary: r});
}
console.log(`worst peak delta ${worst.peak.toFixed(3)} (limit ${PEAK_TOL}); worst finish delta ${worst.finish.toFixed(4)}s; ` +
  `worst event delta ${worst.event.toFixed(4)}s (limit one tick ${TICK.toFixed(4)}s)`);

if (process.argv.includes('--write')) {
  const dest = path.join(root, 'tests/scenarios/expected_integer_clock.json');
  fs.mkdirSync(path.dirname(dest), {recursive: true});
  fs.writeFileSync(dest, JSON.stringify(out, null, 2) + '\n');
  console.log(`wrote ${path.relative(root, dest)}`);
}
process.exit(failures ? 1 : 0);
