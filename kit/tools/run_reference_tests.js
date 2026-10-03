'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const root = path.resolve(__dirname, '..');
const {HardRoom} = require(path.join(root,'prototype/core.js'));
const replays = JSON.parse(fs.readFileSync(path.join(root,'data/reference_replays.json'),'utf8'));
const fixture = JSON.parse(fs.readFileSync(path.join(root,'data/hard_room_reference.json'),'utf8'));

// Spot-check the serialized contract against directly inspectable model state.
const initial=new HardRoom();
assert.equal(initial.dt,1/fixture.clock.hz);
assert.equal(fixture.input.max_active_gameplay_pointers,1);
for (const o of fixture.objects) {
  const model=initial.getObj(o.id);
  assert.ok(model,`missing model object ${o.id}`);
  assert.equal(model.x,o.position.x);
  assert.equal(model.y,o.position.y);
  if(o.kind==='cup') assert.equal(model.start,o.params.trigger_seconds);
  if(o.kind==='train') assert.equal(model.speed,o.params.speed);
}
for(const e of fixture.listeners) assert.equal(initial[e.id].alert,e.initial_alert);
for(const c of fixture.cover_windows){
  initial.t=c.start_seconds;assert.equal(initial.cover,true);
  initial.t=c.end_seconds;assert.equal(initial.cover,false);
}

for(const test of replays.cases){
  const s=new HardRoom(); s.start(); let index=0;
  while(s.state==='running'&&s.t<25){
    while(index<test.commands.length&&s.t+1e-6>=test.commands[index].at_seconds){
      const c=test.commands[index++];
      if(c.action==='select') assert.equal(s.select(c.object_id),true,`${test.name}: selection rejected`);
      else if(c.action==='target') s.target(c.x,c.y);
      else if(c.action==='release') s.release();
      else throw new Error(`Unsupported replay command ${c.action}`);
    }
    s.advance(1/120);
  }
  assert.deepEqual(s.summary(),test.expected,`${test.name}: reference changed`);
  console.log(`PASS ${test.name}: ${s.state}, ${s.caught} cups`);
}

// Run the preserved original rule groups in a scratch copy because they write reports.
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'hush-reference-'));
try{
  for(const file of ['core.js','scenarios.js','check-rules.js']) fs.copyFileSync(path.join(root,'prototype',file),path.join(scratch,file));
  fs.copyFileSync(path.join(root,'prototype/evidence/scenarios.json'),path.join(scratch,'scenarios.json'));
  require(path.join(scratch,'check-rules.js'));
  const checks=JSON.parse(fs.readFileSync(path.join(scratch,'rule-checks.json'),'utf8'));
  assert.equal(checks.length,6);
  console.log(`PASS ${checks.length} original rule groups`);
}finally{fs.rmSync(scratch,{recursive:true,force:true});}
console.log('Reference tests passed. This is browser-model evidence, not a native build or human playtest.');
