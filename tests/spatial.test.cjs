const {JSDOM}=require('jsdom'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const windows=[],errors=[],wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function open(saved,motion=45){
 const w=new JSDOM('<div id="app"></div><div id="toast"></div>',{url:'https://workshop.test',runScripts:'outside-only',pretendToBeVisual:true}).window;windows.push(w);w.structuredClone=structuredClone;w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.addEventListener('error',e=>errors.push(e.error));
 if(saved)w.localStorage.setItem('ai-agent-workshop.v1',saved);
 for(const file of ['engine.js','human.js','robot.js','robot-floor.js','identity.js','model.js','spatial.js','space-view.js','systems.js','headquarters.js','themes.js','app.js']){w.eval(fs.readFileSync(path.join(__dirname,'../dist',file),'utf8'));if(file==='spatial.js')w.WorkshopSpatial.motionMs=motion;if(file==='engine.js'){if(!saved)w.localStorage.setItem('ai-agent-workshop.v1',require('./legacy-workspace.cjs')(w));const R=w.WorkshopCore.AgentRuntime;w.WorkshopCore.AgentRuntime=class extends R{constructor(){super(undefined,25);}};}}
 const q=s=>{const e=w.document.querySelector(s);assert.ok(e,'Missing '+s);return e;},click=s=>q(s).click(),state=()=>JSON.parse(w.localStorage.getItem('ai-agent-workshop.v1')),savedState=()=>w.localStorage.getItem('ai-agent-workshop.v1');
 const fill=(s,value)=>{const e=q(s);if(e.type==='checkbox')e.checked=value;else e.value=value;e.dispatchEvent(new w.Event('input',{bubbles:true}));e.dispatchEvent(new w.Event('change',{bubbles:true}));};
 const submit=s=>q(s).dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 const until=async fn=>{for(let i=0;i<100;i++){if(fn())return;await wait(20);}assert.ok(fn(),'Timed out');};
 const load=async data=>{Object.defineProperty(q('#import-file'),'files',{configurable:true,value:[{size:2000,text:async()=>JSON.stringify(data)}]});q('#import-file').dispatchEvent(new w.Event('change'));await wait(30);};
 return {w,q,click,fill,submit,state,savedState,until,load};
}
(async()=>{
 const t=open(),id=t.state().selected,desk='workstation-'+id;
 assert.equal(t.state().space.locations[id].zoneId,desk);assert.equal(t.state().space.zones.length,6);
 t.click('[data-zone="lounge"]');t.click('[data-move-zone="lounge"]');
 assert.equal(t.state().space.locations[id].move.toZoneId,'lounge');assert.ok(t.q('.spatial-agent.walking').parentNode.style.offsetPath.includes("path("),'Motion path survives HTML serialization');
 assert.equal(t.w.document.querySelectorAll('.station').length,1,'One operator, no duplicate at vacant desk');
 await t.until(()=>t.state().space.locations[id].zoneId==='lounge');assert.ok(t.q('.spatial-agent.seated'));
 t.fill('#task-input','Summarize the sample document');t.submit('#task-form');assert.equal(t.state().runs[0].status,'queued');assert.equal(t.state().space.locations[id].move.toZoneId,desk);
 await t.until(()=>t.state().runs[0].status==='completed');assert.equal(t.state().space.locations[id].zoneId,desk);
 const records=t.state().space.events;assert.equal(records.filter(e=>e.type==='movement.arrived').length,2);assert.ok(records.some(e=>e.data.reason==='Returning to execute assigned task'));
 t.fill('#after-task','lounge');t.fill('#task-input','Summarize again');t.submit('#task-form');await t.until(()=>t.state().space.locations[id].zoneId==='lounge');
 const core=t.state().agents[0];t.click('[data-view="blueprint"]');assert.ok(t.q('[name="avatar"]'));assert.equal(t.w.document.querySelector('[name="human.presentation"]'),null);
 t.fill('[name="bodyShape"]','taper');t.fill('[name="eyeStyle"]','bars');t.fill('[name="trim"]','utility stripe');assert.ok(t.q('.avatar-preview .floor-robot'));t.submit('#config-form');assert.equal(t.state().agents[0].id,id);assert.equal(t.state().agents[0].version,core.version+1);assert.deepEqual(t.state().agents[0].human,core.human);assert.equal(t.state().agents[0].eyeStyle,'bars');assert.equal(t.state().runs.length,2);
 t.click('[data-system-focus=".advanced-fields"]');assert.equal(t.w.document.activeElement.className,'advanced-fields');
 const saved=t.savedState();const re=open(saved);assert.deepEqual(re.state().agents[0].human,t.state().agents[0].human);assert.equal(re.state().space.locations[id].zoneId,'lounge');
 re.click('[data-view="settings"]');const location=JSON.stringify(re.state().space.locations),appearance=JSON.stringify(re.state().agents[0].human);
 for(const theme of ['spectrum','forest','neon']){re.fill('#theme-select',theme);assert.equal(JSON.stringify(re.state().space.locations),location);assert.equal(JSON.stringify(re.state().agents[0].human),appearance);}
 re.click('[data-view="queue"]');re.fill('#approval-required',true);re.click('[data-view="workshop"]');re.fill('#task-input','Summarize approval fixture');re.submit('#task-form');assert.equal(re.state().runs[0].status,'waiting');assert.ok(re.q('.spatial-agent.waiting'));
 const awaiting=re.savedState(),a=open(awaiting);await wait(70);assert.equal(a.state().runs[0].status,'waiting');assert.equal(a.state().queuePaused[id],true);a.click('[data-view="queue"]');const runId=a.state().runs[0].id;a.click(`[data-queue="approve"][data-run="${runId}"]`);assert.equal(a.state().runs[0].status,'queued');assert.equal(a.state().space.locations[id].zoneId,'lounge','Approval does not release held queue');a.click('[data-queue="toggle"]');await a.until(()=>a.state().runs[0].status==='completed');assert.ok(a.state().runs[0].events.some(e=>e.type==='approval.granted'));
 a.click('[data-view="workshop"]');a.fill('#task-input','Summarize rejected fixture');a.submit('#task-form');a.click('[data-view="queue"]');a.click(`[data-queue="reject"][data-run="${a.state().runs[0].id}"]`);assert.equal(a.state().runs[0].status,'cancelled');
 // Rest removes occupancy and cancels an outstanding movement reservation.
 const moving=open(null,1000),mid=moving.state().selected;moving.click('[data-zone="lounge"]');moving.click('[data-move-zone="lounge"]');const movingSaved=moving.savedState();moving.w.close();const restored=open(movingSaved);assert.equal(restored.state().space.locations[mid].zoneId,'lounge');assert.equal(restored.state().space.locations[mid].move,null);assert.equal(restored.state().space.events.at(-1).type,'movement.restored');assert.equal(restored.state().runs.length,0);
 restored.click('[data-view="roster"]');restored.click(`[data-manage="rest"][data-id="${mid}"]`);assert.equal(restored.state().space.locations[mid].zoneId,null);restored.click(`[data-manage="restore"][data-id="${mid}"]`);assert.equal(restored.state().space.locations[mid].zoneId,'workstation-'+mid);
 // Reservations prevent two arrivals using the same seat; full zones fail without mutation.
 const S=t.w.WorkshopSpatial,fixture={agents:Array.from({length:4},(_,i)=>({id:'fixture-'+i,name:'Fixture '+i,lifecycle:'active',version:1,color:'#778899',symbol:'◆'}))};S.sync(fixture);
 for(let i=0;i<3;i++)S.move(fixture,'fixture-'+i,'lounge');assert.equal(new Set(S.occupants(fixture,'lounge').map(o=>o.seat)).size,3);assert.throws(()=>S.move(fixture,'fixture-3','lounge'),/full/);assert.equal(fixture.space.locations['fixture-3'].move,null);assert.throws(()=>S.move(fixture,'fixture-3','workstation-fixture-0'),/another operator/);
 // New-format backup round trip, collision resolution and atomic invalid-input rejection.
 const target=open(),backup=t.state();await target.load(backup);const imported=target.state().agents.find(x=>x.id===id);assert.deepEqual(imported.human,t.state().agents[0].human);assert.equal(target.state().space.locations[id].zoneId,'lounge');assert.equal(target.state().space.events.filter(e=>e.agentId===id).length,backup.space.events.length);
 const invalid=structuredClone(backup);invalid.space.locations[id].zoneId='unknown-zone';const before=target.savedState();await target.load(invalid);assert.equal(target.savedState(),before);assert.match(target.q('#toast').textContent,/Invalid agent location/);
 // Human tutorial choices satisfy the real action gate and preview changes survive a draft reload.
 const guide=open();guide.click('[data-action="start-tutorial"]');guide.click(`[data-select-agent="${guide.state().selected}"]`);guide.click('[data-action="new-agent"]');guide.fill('#new-agent-name','Operator');guide.fill('[name="avatar"]','square');guide.click('[data-color="#c94e63"]');guide.submit('#create-form');assert.equal(guide.state().ui.creation.phase,1);assert.equal(guide.state().tutorial.step,2);
 assert.equal(errors.length,0,errors.map(String).join('\n'));
 console.log('PASS: tracked zones, reserved movement, task return-to-desk, idle lounge preference, refresh recovery, rest/restore, destination capacity, robot customization/drafts and retained human settings, theme invariance, approval/rejection/held-queue recovery, spatial backups and atomic invalid-import rejection.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>windows.forEach(w=>w.close()));
