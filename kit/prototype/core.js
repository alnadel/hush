(function(global){
 'use strict';
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 class HardRoom{
  constructor(){this.dt=1/120;this.reset();}
  reset(){
   this.t=0;this.acc=0;this.state='ready';this.hand=null;this.resumeHand=null;
   this.train={x:52,y:295,running:false,started:false,docked:false,speed:40};
   this.pillow={x:292,y:400,mode:'floor'};
   this.duck={x:68,y:370,hit:false};
   this.cups=[{id:'cupA',label:'A',x:172,y:183,start:7.4,age:0,done:false,caught:false,where:null},
              {id:'cupB',label:'B',x:292,y:183,start:10.4,age:0,done:false,caught:false,where:null}];
   this.walker={x:68,y:439,alert:18,peak:18,last:-10};
   this.sleeper={x:343,y:89,alert:18,peak:18,last:-10};
   this.window={x:50,y:91};this.events=[];this.pulses=[];this.noise=0;this.hidden=0;this.caught=0;
   this.windowNoise=0;this.reason='';this.message='One hand. Two cups. Keep them asleep.';this.messageAt=0;
   this.lastPulse=-10;this.moves=0;this.preview=null;
  }
  get cover(){return [[1.8,3.25],[5.5,6.8],[11.5,12.8]].some(([a,b])=>this.t>=a&&this.t<b);}
  get nextCover(){return [1.8,5.5,11.5].find(a=>a>this.t)??null;}
  get gust(){return this.t>=8.4&&this.t<12.6;}
  get braced(){return this.hand?.id==='window'||this.pillow.mode==='wedge';}
  get finishedHazards(){return this.cups.every(c=>c.done)&&this.t>=12.6;}
  getObj(id){if(id==='pillow')return this.pillow;if(id==='duck')return this.duck;if(id==='train')return this.train;if(id==='window')return this.window;return this.cups.find(c=>c.id===id);}
  start(){
   if(this.state==='paused'){this.state='running';if(this.resumeHand){this.hand=this.resumeHand;this.resumeHand=null;this.release();}return;}
   if(this.state==='ready')this.state='running';
  }
  pause(){if(this.state==='running'){this.state='paused';this.resumeHand=this.hand;this.hand=null;}}
  select(id){
   if(this.state!=='running'||this.hand)return false;
   const o=this.getObj(id);if(!o)return false;
   if(id.startsWith('cup')&&(o.done||o.age>=.95))return false;
   if(id==='train'&&this.train.docked)return false;
   this.hand={id,tx:o.x,ty:o.y};this.moves++;
   if(id==='train')this.train.running=false;
   if(id==='pillow'){this.pillow.mode='floor';this.preview=null;}
   return true;
  }
  target(x,y){if(this.hand){this.hand.tx=clamp(x,28,372);this.hand.ty=clamp(y,70,445);}}
  dropTarget(){
   const p=this.pillow;
   if(dist(p,this.window)<51)return 'wedge';
   if(dist(p,this.train)<43)return 'train';
   return 'floor';
  }
  release(){
   if(!this.hand)return;const id=this.hand.id;this.hand=null;
   if(id==='train'&&!this.train.docked){
    const first=!this.train.started;this.train.started=true;this.train.running=true;
    this.sound(first?58:32,this.train.x+35,this.train.y,first?'Train released':'Train restarted','start',true);
   }
   if(id==='pillow'){
    this.pillow.mode=this.dropTarget();
    if(this.pillow.mode==='wedge'){this.pillow.x=this.window.x;this.pillow.y=this.window.y+21;this.say('Window wedged. The cushion is occupied.');}
    else if(this.pillow.mode==='train'){this.pillow.x=this.train.x;this.pillow.y=this.train.y;this.say('Cushion loaded. The train carries it.');}
    else this.say('Cushion placed.');
   }
  }
  say(s){this.message=s;this.messageAt=this.t;}
  sound(q,x,y,label,kind='small',important=false){
   if(q<=0||this.state!=='running')return;
   const raw=q,masked=this.cover;
   if(masked)q*=kind==='crash'?.65:.16;
   this.noise+=q;this.hidden+=raw-q;
   for(const e of [this.walker,this.sleeper]){
    const gain=q/(1+Math.hypot(e.x-x,e.y-y)/300);
    e.alert+=gain;e.peak=Math.max(e.peak,e.alert);if(gain>.001)e.last=this.t;
   }
   if(important){this.events.push({t:+this.t.toFixed(3),label,masked,q:+q.toFixed(2)});this.say(label+(masked?' · under the snore':''));}
   if(important||this.t-this.lastPulse>.27){this.pulses.push({t:this.t,x,y,loud:raw>50,masked});this.lastPulse=this.t;if(this.pulses.length>12)this.pulses.shift();}
   if(this.walker.alert>=100||this.sleeper.alert>=100){
    this.reason=(this.walker.alert>=100?'The walker woke. ':'The sleeper woke. ')+label;
    this.state='lost';this.hand=null;this.resumeHand=null;this.say(this.reason);
   }
  }
  moveHand(dt){
   if(!this.hand||!['pillow','duck'].includes(this.hand.id))return;
   const id=this.hand.id,o=this.getObj(id),dx=this.hand.tx-o.x,dy=this.hand.ty-o.y,d=Math.hypot(dx,dy);
   if(d<.01)return;
   const step=Math.min(d,360*dt,d*(1-Math.exp(-dt/.035)));
   const ox=o.x,oy=o.y;o.x+=dx/d*step;o.y+=dy/d*step;
   if(id==='duck'){
    o.x=clamp(o.x,31,369);o.y=clamp(o.y,330,438);
    const moved=Math.hypot(o.x-ox,o.y-oy),speed=moved/dt;
    this.sound(moved*(.11+(speed/420)**2)*1.4,o.x,o.y,'Duck scraped','scrape');
   }else{this.sound(step*.018,o.x,o.y,'Cushion brushed the floor');this.preview=this.dropTarget();}
  }
  positionWalker(){
   if(this.t<8){this.walker.x=68;this.walker.y=439-Math.max(0,this.t-1.4)*222/6.6;}
   else if(this.t<12.7){this.walker.x=68+(this.t-8)*265/4.7;this.walker.y=217;}
   else{this.walker.x=333;this.walker.y=Math.max(99,217-(this.t-12.7)*52);}
  }
  tick(){
   if(this.state!=='running')return;const dt=this.dt;this.t+=dt;
   this.moveHand(dt);if(this.state!=='running')return;
   if(this.train.running&&!this.train.docked){
    this.train.x=Math.min(307,this.train.x+this.train.speed*dt);
    this.sound(dt*.8,this.train.x,this.train.y,'Train wheels');
    if(this.train.x>=307){this.train.docked=true;this.train.running=false;this.say('Train docked.');}
   }
   if(this.pillow.mode==='train'){this.pillow.x=this.train.x;this.pillow.y=this.train.y;}
   this.positionWalker();
   if(!this.duck.hit&&this.t>=.7&&Math.hypot(this.duck.x-this.walker.x,this.duck.y-this.walker.y)<31){
    this.duck.hit=true;this.sound(90,this.duck.x,this.duck.y,'Stepped on the duck','crash',true);this.duck.x=32;
   }
   for(const c of this.cups){
    if(c.done||this.t<c.start)continue;
    const held=this.hand?.id===c.id&&c.age<.95;
    if(!held)c.age+=dt;
    if(c.age>=1.6){
     c.done=true;
     const p=this.pillow;c.caught=p.mode!=='wedge'&&Math.abs(p.x-c.x)<32&&Math.abs(p.y-295)<25;
     c.where=c.caught&&p.mode==='train'?'train':'floor';
     c.offset=c.x-this.train.x;
     if(c.caught){this.caught++;this.sound(5,c.x,295,'Cup '+c.label+' caught','small',true);}
     else this.sound(115,c.x,295,'Cup '+c.label+' hit the floor','crash',true);
    }
   }
   if(this.gust&&!this.braced){this.windowNoise+=dt*48;this.sound(dt*48,this.window.x,this.window.y,'Window rattled');}
   for(const e of [this.walker,this.sleeper])if(this.t-e.last>1.6)e.alert=Math.max(12,e.alert-1.3*dt);
   this.pulses=this.pulses.filter(p=>this.t-p.t<.7);
   if(this.state==='running'&&this.t>=15&&this.finishedHazards&&!this.hand){this.state='won';this.say(this.caught===2?'Both cups saved. Everyone is asleep.':'Everyone is asleep. A very close call.');}
   if(this.state==='running'&&this.t>24){this.state='lost';this.reason='Still holding a hazard. Finish with your hand free.';this.say(this.reason);this.hand=null;}
  }
  advance(s){if(this.state!=='running')return;this.acc+=s;while(this.acc+1e-10>=this.dt&&this.state==='running'){this.acc-=this.dt;this.tick();}}
  summary(){return {state:this.state,time:+this.t.toFixed(3),caught:this.caught,noise:+this.noise.toFixed(2),hidden:+this.hidden.toFixed(2),windowNoise:+this.windowNoise.toFixed(2),peakWalker:+this.walker.peak.toFixed(2),peakSleeper:+this.sleeper.peak.toFixed(2),reason:this.reason,events:this.events};}
 }
 if(typeof module!=='undefined'&&module.exports)module.exports={HardRoom};else global.HardRoom=HardRoom;
})(typeof globalThis!=='undefined'?globalThis:this);
