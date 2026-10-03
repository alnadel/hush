const {HardRoom}=require('./core.js');
const fs=require('fs');
function run(actions){
 const s=new HardRoom();s.start();let index=0;
 while(s.state==='running'&&s.t<25){
  while(index<actions.length&&s.t+1e-6>=actions[index].at){actions[index].do(s);index++;}
  s.advance(1/120);
 }
 return s.summary();
}
function drag(id,at,until,x,y){return[{at,do:s=>{s.select(id);s.target(x,y);}},{at:until,do:s=>s.release()}];}
const setup=[...drag('pillow',.15,1.35,52,295),...drag('duck',1.88,2.6,150,383)];
const hold=(id,a,b)=>[{at:a,do:s=>s.select(id)},{at:b,do:s=>s.release()}];
const tests={
 'Prepared chain': [...setup,...hold('train',5.7,6),...hold('window',8.25,12.66)],
 'No intervention':[],
 'Skip the window':[...setup,...hold('train',5.7,6)],
 'Start too early':[...setup,...hold('train',3.5,3.6),...hold('window',8.25,12.66)],
 'Recover an early train':[...setup,...hold('train',5.45,5.6),...hold('train',7.1,7.5),...hold('window',8.25,12.66)],
 'Use the final snore':[...setup,...hold('train',5.7,6),...hold('window',8.25,11.55)],
 'Cover only one landing':[...drag('pillow',.15,1.35,292,295),...drag('duck',1.88,2.6,150,383),...hold('window',8.25,12.66)],
 'Manual transfer during final snore':[...drag('pillow',.15,1.35,172,295),...drag('duck',1.88,2.6,150,383),...hold('window',8.25,11.55),...drag('pillow',11.56,12.15,292,295)]
};
const results=Object.fromEntries(Object.entries(tests).map(([name,a])=>[name,run(a.sort((a,b)=>a.at-b.at))]));
fs.writeFileSync(__dirname+'/scenarios.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(Object.fromEntries(Object.entries(results).map(([k,v])=>[k,{state:v.state,caught:v.caught,peak:Math.max(v.peakWalker,v.peakSleeper),window:v.windowNoise,reason:v.reason}])),null,2));
module.exports={run,drag,hold,setup};
