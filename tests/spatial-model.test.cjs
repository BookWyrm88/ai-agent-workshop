const {JSDOM}=require('jsdom'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const w=new JSDOM('',{url:'https://workshop.test',runScripts:'outside-only'}).window;w.structuredClone=structuredClone;
try{
 for(const name of ['spatial.js','human.js'])w.eval(fs.readFileSync(path.join(__dirname,'../dist',name),'utf8'));
 const S=w.WorkshopSpatial,state={agents:Array.from({length:4},(_,i)=>({id:'agent-'+i,name:'Operator '+i,lifecycle:'active',color:'#778899',symbol:'◆',version:1}))};S.sync(state);const first=JSON.stringify(state.space.zones);S.sync(state);assert.equal(JSON.stringify(state.space.zones),first,'Idempotent zone migration');
 for(let i=0;i<3;i++)S.move(state,'agent-'+i,'lounge');assert.equal(new Set(S.occupants(state,'lounge').map(x=>x.seat)).size,3);assert.throws(()=>S.move(state,'agent-3','lounge'),/full/);assert.throws(()=>S.move(state,'agent-3','workstation-agent-0'),/another operator/);
 const moving=state.space.locations['agent-0'].move,mid=S.position(state,'agent-0',moving.startedAt+moving.duration/2);assert.ok(Number.isFinite(mid.x)&&Number.isFinite(mid.y));assert.notDeepEqual(mid,moving.from);
 S.restore(state);assert.equal(state.space.locations['agent-0'].move,null);assert.equal(state.space.locations['agent-0'].zoneId,'lounge');assert.ok(state.space.events.some(e=>e.type==='movement.restored'));
 state.agents[0].lifecycle='resting';S.sync(state);assert.equal(state.space.locations['agent-0'].zoneId,null);state.agents[0].lifecycle='active';S.sync(state);assert.equal(state.space.locations['agent-0'].zoneId,'workstation-agent-0');
 const clean=S.cleanImport(state.space,state.agents);assert.deepEqual(JSON.parse(JSON.stringify(clean.events[0].data)),JSON.parse(JSON.stringify(state.space.events[0].data)));const target={agents:structuredClone(state.agents)};S.merge(target,clean,new Set(state.agents.map(a=>a.id)));assert.equal(target.space.locations['agent-1'].zoneId,'lounge');
 const bad=structuredClone(state.space);bad.locations['agent-0'].zoneId='workstation-agent-1';assert.throws(()=>S.cleanImport(bad,state.agents),/Invalid agent location/);
 const human=w.WorkshopHuman.normalize({avatar:'cat',human:{presentation:'unknown',hairColor:'red" onload="x',skinTone:'#886655',jacket:'long-coat'}});assert.equal(human.skinTone,'#886655');assert.equal(human.jacket,'long-coat');assert.ok(!JSON.stringify(human).includes('onload'));
 assert.ok(w.WorkshopHuman.svg({human,color:'#778899',symbol:'◆'}).includes('human-operator'));
 console.log('PASS: pure spatial migration, reservations, interpolation, restoration, lifecycle occupancy, backup records and human appearance validation.');
}finally{w.close();}
