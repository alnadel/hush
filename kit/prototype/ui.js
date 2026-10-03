(function(){
 'use strict';
 const root=document.getElementById('hush-hard-room'),q=s=>root.querySelector(s);
 const stage=q('.hh-stage'),canvas=q('canvas'),ctx=canvas.getContext('2d'),sim=new globalThis.HardRoom();
 const buttons=[...root.querySelectorAll('[data-object]')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let scale=1,raf=null,last=null,pointer=null,grab=null,keys=new Set(),keyObject=null,statusCache='',soundOn=false,ac=null,lastEvent=0,lastSnore=false;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const C={wall:'#273548',floor:'#49576b',wood:'#9d7c67',woodLight:'#cfad89',line:'#8193a3',cream:'#f0e9d8',mint:'#b8d9c4',mintDark:'#42685f',coral:'#e9a591',yellow:'#e7c17d',text:'#e4e8df',muted:'#b4c2cd'};
 function box(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.4;ctx.stroke();}}
 function line(x,y,xx,yy,c,w=1){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(xx,yy);ctx.strokeStyle=c;ctx.lineWidth=w;ctx.stroke();}
 function circ(x,y,r,fill,stroke,w=1.4){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=w;ctx.stroke();}}
 function label(s,x,y,size=12,c=C.text,align='center',weight=400){ctx.font=weight+' '+Math.max(size,11.5/scale)+'px ui-sans-serif,system-ui,sans-serif';ctx.fillStyle=c;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(s,x,y);}
 function ring(x,y,r,value,c){ctx.beginPath();ctx.arc(x,y,r,-Math.PI/2,-Math.PI/2+Math.PI*2*clamp(value,0,1));ctx.strokeStyle=c;ctx.lineWidth=3;ctx.stroke();}
 function pillow(x,y,small=false){const w=small?49:66,h=small?25:43;box(x-w/2,y-h/2+4,w,h,12,'#27354655');box(x-w/2,y-h/2,w,h,11,C.coral,'#efc6b2');box(x-w/2+6,y-h/2+6,w-12,h-12,7,null,'#bd827c');if(!small){line(x-18,y-5,x-9,y,C.cream);line(x-9,y,x-18,y+5,C.cream);line(x+18,y-5,x+9,y,C.cream);line(x+9,y,x+18,y+5,C.cream);}}
 function eyes(x,y,awake){if(awake){circ(x-5,y,2,'#52464c');circ(x+5,y,2,'#52464c');}else{line(x-8,y,x-2,y,'#52464c',1.7);line(x+2,y,x+8,y,'#52464c',1.7);}}
 function mug(x,y,angle=0,cracked=false){ctx.save();ctx.translate(x,y);ctx.rotate(angle);circ(13,-1,6,null,C.cream,3);box(-10,-13,21,26,5,C.cream);box(-7,-11,15,3,2,'#b6aaa0');if(cracked){line(-4,-7,3,1,'#9e7c6b');line(3,1,-1,7,'#9e7c6b');}ctx.restore();}
 function draw(){
  const bounds=stage.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);scale=bounds.width/400;
  const w=Math.round(bounds.width*dpr),h=Math.round(bounds.height*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  ctx.setTransform(dpr*scale,0,0,dpr*scale,0,0);ctx.clearRect(0,0,400,474);
  ctx.fillStyle=C.wall;ctx.fillRect(0,0,400,474);
  box(14,157,372,303,10,C.floor);
  for(let y=177;y<459;y+=29){line(20,y,381,y,'#546175');for(let x=(Math.round(y/29)%2?47:91);x<380;x+=83)line(x,y-28,x,y,'#506074');}
  // A softly lit bedroom wall, a window and a sleeping neighbour.
  box(15,20,370,122,12,'#344356');line(16,147,384,147,'#7e8d9d',5);
  const win=sim.window,wind=sim.gust&&!sim.braced,wob=wind&&!reduced?Math.sin(sim.t*43)*2.5:0;
  box(21,41,61,77,8,'#81939e');box(27+wob,47,49,64,3,'#213650');line(52+wob,48,52+wob,109,'#9cadb6',3);line(28+wob,79,75+wob,79,'#9cadb6',3);
  circ(63,60,8,'#d8dbb5');circ(66,57,7,'#213650');
  if(wind){for(let i=0;i<3;i++){const yy=62+i*16;line(8,yy,31+wob,yy-3,C.yellow,2);}}
  if(sim.braced)box(21,41,61,77,8,null,C.mint);
  if(sim.pillow.mode==='wedge')pillow(win.x,win.y+21,true);
  label(sim.gust?(sim.braced?'Braced':'Hold shut!'):sim.t<8.4?'Wind '+Math.max(0,8.4-sim.t).toFixed(1)+'s':'Wind passed',53,133,11.5,sim.gust&&!sim.braced?C.yellow:C.muted);
  // Bed.
  box(303,38,72,83,10,'#25364b');box(298,32,72,83,9,'#8a9ca3');box(304,39,60,29,7,C.cream);
  box(301,65,66,46,8,'#798cae');line(308,82,360,82,'#b2bfd4',2);
  circ(333,60,14,'#e2b99a');box(319,45,27,7,4,'#6c584f');eyes(333,61,sim.sleeper.alert>=100);
  label(sim.cover?'Z Z Z':'z z',337,24,sim.cover?16:12,sim.cover?C.mint:C.muted);
  label('Sleeper',336,132,12,C.muted);
  // Room title stays clear of the objects.
  label('THE RATTLE ROOM',188,62,12,C.muted);
  label(sim.state==='ready'?'One hand. Two cups.':sim.hand?'One hand occupied':'One hand free',188,87,13,C.cream, 'center',500);
  label(sim.state==='ready'?'Finish with everyone asleep':sim.cover?'Small noises are covered':'Quiet moves matter',188,111,11.5,C.muted);
  // Shelves and predicted landing spots.
  for(const c of sim.cups){
   box(c.x-33,174,66,27,5,'#2b394f');box(c.x-35,169,70,23,4,C.wood);line(c.x-29,176,c.x+29,176,C.woodLight,2);
   let remain=c.done?0:Math.max(0,c.start-sim.t)+Math.max(0,1.6-c.age);
   label(c.done?c.label+(c.caught?' saved':' missed'):c.label+' · '+remain.toFixed(1)+'s',c.x,153,12,c.done?(c.caught?C.mint:C.yellow):C.cream);
   if(!c.done){ctx.setLineDash([4,5]);circ(c.x,295,27,null,'#b5b29a');ctx.setLineDash([]);label(c.label,c.x,334,12,C.muted);}
  }
  // A fixed route. All movement remains in a single readable scene.
  for(let y=425;y>229;y-=26){if(y<sim.walker.y||sim.t<8)box(63+(Math.round(y/26)%2?8:0),y,5,9,2,'#b3bcb344');}
  for(let x=91;x<336;x+=28)box(x,216+(Math.round(x/28)%2?7:0),9,5,2,'#b3bcb344');
  // Track, loading bay and soft end buffer.
  line(31,308,382,308,'#243447',5);line(31,318,382,318,'#8fa0a6',3);
  for(let x=36;x<382;x+=18)line(x,306,x,321,'#a7a290',3);
  box(378,291,10,34,5,'#afc5b7');
  if(!sim.train.started){label('LOAD',52,340,11.5,C.muted);}
  // Train carriage + engine. The cushion's target stays separate from the engine.
  const t=sim.train;
  box(t.x-30,285,60,26,6,'#a7b9a7');box(t.x-27,281,54,9,3,'#c1d0b5');
  circ(t.x-18,312,7,'#24364a','#789394');circ(t.x+18,312,7,'#24364a','#789394');
  line(t.x+29,303,t.x+45,303,C.woodLight,4);
  box(t.x+43,286,45,23,7,'#78aaa0');box(t.x+59,272,24,26,5,'#99c4b2');box(t.x+64,277,13,12,3,'#354e61');
  box(t.x+44,276,9,12,3,'#5e8980');box(t.x+41,273,15,5,2,'#bfd1ad');
  circ(t.x+51,312,7,'#26374d','#92aca2');circ(t.x+78,312,7,'#26374d','#92aca2');
  label(t.docked?'Parked':sim.hand?.id==='train'?'Release':t.started?'Hold to brake':'Hold / release',clamp(t.x+64,98,330),253,11.5,C.muted);
  // Pillow location doubles as a drop preview while dragging.
  if(sim.hand?.id==='pillow'){
   const target=sim.dropTarget();
   if(target==='train')box(t.x-34,274,68,39,8,null,C.mint);
   if(target==='wedge')box(16,37,74,86,10,null,C.mint);
  }
  if(sim.pillow.mode!=='wedge')pillow(sim.pillow.x,sim.pillow.y);
  if(sim.state==='ready')label('Cushion',sim.pillow.x,sim.pillow.y+37,12,C.muted);
  // Duck.
  const d=sim.duck;ctx.save();ctx.translate(d.x,d.y);circ(0,3,16,C.yellow);circ(9,-10,10,C.yellow);box(16,-8,11,6,2,'#c78568');circ(12,-12,2,'#46494a');ctx.restore();
  if(sim.state==='ready')label('Move me',d.x,d.y+33,11.5,C.muted);
  // Cups can be steadied only before leaving the shelf.
  for(const c of sim.cups){
   let x=c.x,y=c.y,angle=0;
   if(c.done){x=c.where==='train'?t.x+(c.id==='cupA'?-14:14):c.x;y=283;angle=c.caught?.15:1.25;}
   else if(c.age>=.95){const f=clamp((c.age-.95)/.65,0,1);y=183+104*f*f;angle=f*1.8;}
   else if(c.age>0){angle=sim.hand?.id===c.id?0:Math.sin(c.age*26)*.12+c.age*.14;ring(c.x,c.y,23,1-c.age/.95,C.yellow);}
   mug(x,y,angle,c.done&&!c.caught);
   if(sim.hand?.id===c.id)ring(c.x,c.y,25,1,C.mint);
  }
  // Walker in striped pyjamas.
  const a=sim.walker;ctx.save();ctx.translate(a.x,a.y);
  circ(0,8,16,'#24324540');const stride=sim.state==='running'&&!reduced?Math.sin(sim.t*7)*2:0;
  box(-12,8+stride,10,8,4,'#c3a78d');box(2,8-stride,10,8,4,'#c3a78d');box(-12,-9,24,25,7,C.mint);
  line(-6,-6,-6,10,'#7fa79a',2);line(3,-6,3,10,'#7fa79a',2);box(-21,-9,11,7,3,'#e4bf9e');box(10,-9,11,7,3,'#e4bf9e');
  circ(0,-19,13,'#e4bf9e');eyes(0,-17,a.alert>=100);box(-12,-31,22,8,4,'#8fb7a7');circ(13,-24,4,C.cream);ctx.restore();
  // Source feedback. The ring never delays or carries sound.
  if(!reduced)for(const p of sim.pulses){const u=(sim.t-p.t)/.7;ctx.globalAlpha=(1-u)*.55;circ(p.x,p.y,10+u*(p.loud?57:33),null,p.masked?C.mint:C.yellow);ctx.globalAlpha=1;}
  if(sim.hand){const o=sim.getObj(sim.hand.id),x=sim.hand.id==='train'?o.x+65:o.x;ctx.setLineDash([3,4]);circ(x,o.y,sim.hand.id==='window'?40:31,null,C.mint,2);ctx.setLineDash([]);}
  if(['paused','won','lost'].includes(sim.state)){
   box(55,230,290,161,16,'#18293bed');
   label(sim.state==='paused'?'Take a breath.':sim.state==='won'?'Hush. You did it.':'Someone woke up.',200,265,20,C.cream,'center',500);
   label(sim.state==='paused'?'The entire room is paused.':sim.state==='won'?sim.caught+' cups saved · hand free':'Watch the cause below. Try again.',200,300,12,C.muted);
   label(sim.state==='paused'?'Press Resume when ready.':sim.state==='won'?'Try a different solution.':'The room repeats the same way.',200,339,12,C.muted);
  }
  sync();
 }
 function sync(){
  for(const b of buttons){const id=b.dataset.object,o=sim.getObj(id);b.style.left=(o.x+(id==='train'?67:0))/4+'%';b.style.top=o.y/474*100+'%';b.style.zIndex=id==='pillow'&&(o.mode==='wedge'||sim.hand?.id==='pillow')?'2':'0';b.disabled=sim.state!=='running'||(id.startsWith('cup')&&(o.done||o.age>=.95))||(id==='train'&&o.docked);}
  for(const id of ['walker','sleeper']){const n=clamp(sim[id].alert,0,100),meter=q('[data-meter="'+id+'"]');meter.setAttribute('aria-valuenow',Math.round(n));meter.firstElementChild.style.width=n+'%';meter.firstElementChild.style.background=n>=85?'var(--bad)':n>=40?'var(--warn)':'var(--safe)';q('[data-sleep="'+id+'"]').textContent=n>=100?'Awake':n>=85?'Waking':n>=40?'Stirring':'Asleep';}
  q('[data-beat]').dataset.active=String(sim.cover);
  q('[data-beat-text]').textContent=sim.cover?'SNOOORE · noise softened':sim.nextCover!==null?'Next snore · '+Math.max(0,sim.nextCover-sim.t).toFixed(1)+' s':'No more cover sounds';
  q('[data-clock]').textContent=sim.state==='ready'?'24 s limit':Math.floor(sim.t)+' / 24 s';
  const names={train:'Braking train',window:'Bracing window',cupA:'Steadying cup A',cupB:'Steadying cup B',pillow:'Moving cushion',duck:'Moving duck'};
  q('[data-hand]').textContent=sim.hand?names[sim.hand.id]:'Hand free';q('[data-catches]').textContent=sim.caught+' / 2 cups saved';
  let msg=sim.message;
  if(sim.state==='ready')msg='Drag the cushion and duck. Hold the engine, cups or window.';
  else if(sim.state==='paused')msg='Paused. Resume releases anything you were holding.';
  else if(sim.state==='running'&&sim.t-sim.messageAt>1.4){
   if(sim.hand?.id==='pillow')msg=sim.dropTarget()==='train'?'Release to load the cushion.':sim.dropTarget()==='wedge'?'Release to wedge the window.':'Place below a cup, on the train, or in the window.';
   else if(sim.gust)msg=sim.braced?'Window secure. Watch your other preparations.':'The window is rattling. Hold it shut.';
   else if(sim.t<3.3)msg='The duck is in the walker’s path.';
   else if(sim.t<7.2)msg='The train starts when you let go of its engine.';
   else if(sim.t<8.4)msg='Wind is coming. One hand will be busy.';
   else msg='Finish with your hand free.';
  }
  if(msg!==statusCache){q('[data-status]').textContent=msg;statusCache=msg;}
  q('[data-start]').textContent=sim.state==='paused'?'Resume':sim.state==='running'?'Restart':sim.state==='ready'?'Start':'Retry';
  q('[data-pause]').disabled=sim.state!=='running';
  if(!['running','ready'].includes(sim.state)){pointer=null;grab=null;keys.clear();keyObject=null;}
 }
 function tone(freq,duration,volume=.06,type='sine'){
  if(!soundOn||!ac)return;const osc=ac.createOscillator(),gain=ac.createGain();osc.type=type;osc.frequency.value=freq;gain.gain.setValueAtTime(.001,ac.currentTime);gain.gain.exponentialRampToValueAtTime(volume,ac.currentTime+.03);gain.gain.exponentialRampToValueAtTime(.001,ac.currentTime+duration);osc.connect(gain);gain.connect(ac.destination);osc.start();osc.stop(ac.currentTime+duration+.03);
 }
 function audioFrame(){
  if(sim.cover&&!lastSnore)tone(85,.65,.055,'triangle');lastSnore=sim.cover;
  while(lastEvent<sim.events.length){const e=sim.events[lastEvent++];if(e.label.includes('caught'))tone(320,.12,.055);else if(e.label.includes('floor')||e.label.includes('Stepped'))tone(105,.3,.07,'triangle');else if(e.label.includes('Train'))tone(170,.14,e.masked?.025:.055,'triangle');}
 }
 function schedule(){if(raf===null)raf=requestAnimationFrame(frame);}
 function frame(ts){raf=null;const dt=last===null?0:Math.min((ts-last)/1000,.10);last=ts;
  if(sim.state==='running'){
   if(keyObject&&['pillow','duck'].includes(keyObject)){const o=sim.getObj(keyObject);let dx=0,dy=0;if(keys.has('ArrowLeft'))dx--;if(keys.has('ArrowRight'))dx++;if(keys.has('ArrowUp'))dy--;if(keys.has('ArrowDown'))dy++;sim.target(o.x+dx*12,o.y+dy*12);}
   sim.advance(dt);audioFrame();
  }
  draw();if(sim.state==='running')schedule();else last=null;
 }
 function point(e){const r=stage.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*400,y:(e.clientY-r.top)/r.height*474};}
 function letGo(){sim.release();pointer=null;grab=null;keys.clear();keyObject=null;draw();}
 function pause(){sim.pause();pointer=null;grab=null;keys.clear();keyObject=null;draw();}
 for(const b of buttons){
  b.addEventListener('pointerdown',e=>{if(pointer!==null||sim.hand||sim.state!=='running')return;e.preventDefault();const id=b.dataset.object,o=sim.getObj(id),pt=point(e);if(!sim.select(id))return;pointer=e.pointerId;grab={x:pt.x-o.x,y:pt.y-o.y};b.setPointerCapture(pointer);draw();});
  b.addEventListener('pointermove',e=>{if(pointer!==e.pointerId||!grab)return;e.preventDefault();const p=point(e);sim.target(p.x-grab.x,p.y-grab.y);});
  b.addEventListener('pointerup',e=>{if(e.pointerId===pointer)letGo();});
  b.addEventListener('pointercancel',e=>{if(e.pointerId===pointer)pause();});
  b.addEventListener('lostpointercapture',e=>{if(e.pointerId===pointer)pause();});
  b.addEventListener('keydown',e=>{if(sim.state!=='running')return;if(e.key==='Escape'){e.preventDefault();letGo();return;}if(e.key===' '||e.key.startsWith('Arrow')){e.preventDefault();if(sim.hand&&keyObject!==b.dataset.object)return;if(!sim.hand&&!sim.select(b.dataset.object))return;keyObject=b.dataset.object;keys.add(e.key);draw();}});
  b.addEventListener('keyup',e=>{keys.delete(e.key);if(keyObject===b.dataset.object&&keys.size===0)letGo();});
  b.addEventListener('blur',()=>{if(keyObject===b.dataset.object)letGo();});
 }
 q('[data-start]').addEventListener('click',()=>{
  if(sim.state==='running'||sim.state==='lost'||sim.state==='won'){sim.reset();pointer=null;grab=null;lastEvent=0;lastSnore=false;}
  q('[data-help-panel]').hidden=true;q('[data-help]').setAttribute('aria-expanded','false');sim.start();last=null;if(ac)ac.resume();schedule();draw();
 });
 q('[data-pause]').addEventListener('click',pause);
 q('[data-help]').addEventListener('click',()=>{const panel=q('[data-help-panel]');panel.hidden=!panel.hidden;q('[data-help]').setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden)pause();draw();});
 q('[data-hint]').addEventListener('click',()=>{q('[data-hint-text]').hidden=false;q('[data-hint]').hidden=true;});
 q('[data-sound]').addEventListener('click',()=>{soundOn=!soundOn;if(soundOn){const Audio=window.AudioContext||window.webkitAudioContext;if(Audio){ac=ac||new Audio();ac.resume();}else soundOn=false;}q('[data-sound]').textContent=soundOn?'Sound on':'Sound off';q('[data-sound]').setAttribute('aria-pressed',String(soundOn));});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('blur',()=>{if(sim.state==='running')pause();});
 new ResizeObserver(draw).observe(stage);draw();root.hush={sim,draw,pause};
})();
