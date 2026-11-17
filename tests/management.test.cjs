const {JSDOM}=require('jsdom'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const windows=[],errors=[],wait=ms=>new Promise(r=>setTimeout(r,ms));
function open(saved,delay=15){
 const w=new JSDOM('<div id="app"></div><div id="toast"></div>',{url:'https://workshop.test',runScripts:'outside-only',pretendToBeVisual:true}).window;windows.push(w);
 w.structuredClone=structuredClone;w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.addEventListener('error',e=>errors.push(e.error));
 if(saved)w.localStorage.setItem('ai-agent-workshop.v1',saved);
 for(const file of ['engine.js','human.js','robot.js','robot-floor.js','identity.js','model.js','spatial.js','space-view.js','systems.js','headquarters.js','themes.js','app.js']){
  w.eval(fs.readFileSync(path.join(__dirname,'../dist',file),'utf8'));
  if(file==='engine.js'){if(!saved)w.localStorage.setItem('ai-agent-workshop.v1',require('./legacy-workspace.cjs')(w));const Original=w.WorkshopCore.AgentRuntime;w.WorkshopCore.AgentRuntime=class extends Original{constructor(){super(undefined,delay);}};}
 }
 const q=s=>{const e=w.document.querySelector(s);assert.ok(e,'Missing '+s);return e;},click=s=>q(s).click(),state=()=>JSON.parse(w.localStorage.getItem('ai-agent-workshop.v1'));
 const fill=(s,value)=>{const e=q(s);e.value=value;e.dispatchEvent(new w.Event('input',{bubbles:true}));e.dispatchEvent(new w.Event('change',{bubbles:true}));};
 const submit=s=>q(s).dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 const until=async fn=>{for(let i=0;i<100;i++){if(fn())return;await wait(30);}assert.ok(fn(),'Timed out');};
 return {w,q,click,state,fill,submit,until,save:()=>w.localStorage.getItem('ai-agent-workshop.v1')};
}
(async()=>{
 const t=open(),moss=t.state().agents[0],id=moss.id;
 t.click('[data-view="blueprint"]');t.fill('[name="role"]','Research analyst');t.fill('[name="document"]','Fixture document. For isolation testing only.');t.submit('#config-form');
 assert.equal(t.state().agents[0].id,id);assert.equal(t.state().versions[id].length,2);assert.equal(t.state().versions[id][0].role,moss.role);
 t.click('[data-view="roster"]');t.click(`[data-manage="version"][data-id="${id}"][data-version="1"]`);assert.equal(t.state().agents[0].version,3);assert.equal(t.state().agents[0].role,moss.role);
 t.click(`[data-manage="rest"][data-id="${id}"]`);t.click('[data-view="workshop"]');assert.equal(t.w.document.querySelectorAll('.station').length,0);
 t.click('[data-view="roster"]');t.click(`[data-manage="restore"][data-id="${id}"]`);t.click(`[data-manage="archive"][data-id="${id}"]`);assert.equal(t.state().agents[0].lifecycle,'archived');t.click(`[data-manage="restore"][data-id="${id}"]`);
 t.click(`[data-manage="duplicate"][data-id="${id}"]`);const copy=t.state().agents[1];assert.notEqual(copy.id,id);assert.equal(t.state().runs.filter(r=>r.agentId===copy.id).length,0);assert.equal(copy.version,1);
 // Resting holds the queue. Enqueue three, reorder, cancel one, explicitly resume.
 t.click('[data-view="workshop"]');for(const task of ['Summarize document A','Summarize document B','Summarize document C']){t.fill('#task-input',task);t.submit('#task-form');}
 assert.equal(t.state().runs.filter(r=>r.status==='queued').length,3);
 t.click('[data-view="queue"]');const pending=t.state().runs.filter(r=>r.status==='queued').sort((a,b)=>a.queueOrder-b.queueOrder);
 t.click(`[data-queue="up"][data-run="${pending[2].id}"]`);t.click(`[data-queue="cancel"][data-run="${pending[0].id}"]`);assert.equal(t.state().runs.find(r=>r.id===pending[0].id).status,'cancelled');
 t.click('[data-queue="toggle"]');await t.until(()=>t.state().runs.filter(r=>r.status==='completed').length===2);
 const starts=t.state().runs.filter(r=>r.status==='completed').sort((a,b)=>Date.parse(a.started)-Date.parse(b.started));assert.equal(starts[0].task,'Summarize document C');
 // Interrupt one active task with another queued, then reopen. Neither replays.
 t.click('[data-view="workshop"]');t.fill('#task-input','Summarize interrupted document');t.submit('#task-form');t.fill('#task-input','Summarize pending document');t.submit('#task-form');
 const saved=t.save();t.w.close();const re=open(saved);await wait(100);assert.equal(re.state().runs.filter(r=>r.status==='queued').length,1);assert.ok(re.state().runs.some(r=>r.events.some(e=>e.type==='task.interrupted')));assert.equal(re.state().queuePaused[id],true);
 console.log('PASS: stable identities, version restore, rest/archive/restore, duplicate isolation, deterministic reorder/cancel/dispatch, refresh interruption without replay.');
 // Explicit research payload is consumed, recorded for both agents, and inspectable.
 re.click('[data-flow="demo"]');const pair=re.state().agents.slice(-2);re.submit('#workflow-form');await re.until(()=>re.state().handoffs[0]?.status==='processed');
 const h=re.state().handoffs[0],sender=re.state().runs.find(r=>r.id===h.senderRunId),receiver=re.state().runs.find(r=>r.id===h.recipientRunId);
 assert.equal(h.payload.output,sender.events.find(e=>e.type==='task.completed').data.output);assert.deepEqual(receiver.events.find(e=>e.type==='evaluation.input').data.payload,h.payload);
 assert.ok(sender.events.some(e=>e.type==='message.sent'));assert.ok(receiver.events.some(e=>e.type==='message.received'));assert.ok(re.q('.message-route button'));
 re.click('.message-route button');assert.match(re.q('.handoff-inspector').textContent,/research.result/);re.click('[data-view="laboratory"]');assert.match(re.q('.shared-events').textContent,/Research result received/);
 console.log('PASS: actual Research → Evaluation payload, two histories, recorded visual-route control, inspector and shared timeline.');
 // Sessions and explicit memory are independent from identity/history.
 re.click('[data-view="sessions"]');re.fill('[data-summary] textarea','Keep the humidity uncertainty.');re.submit('[data-summary]');const oldSession=re.state().agents.find(a=>a.id===pair[0].id).sessionId;
 re.click('[data-session="fresh"]');const newSession=re.state().agents.find(a=>a.id===pair[0].id).sessionId;assert.notEqual(oldSession,newSession);re.click(`[data-session="reuse"][data-id="${oldSession}"]`);assert.equal(re.state().sessions.find(s=>s.id===newSession).context.length,1);
 re.fill('#memory-form textarea','Prefer concise output.');re.submit('#memory-form');const memory=re.state().memories[0];re.click(`[data-session="use-memory"][data-id="${memory.id}"]`);assert.equal(re.state().sessions.find(s=>s.id===newSession).context.length,2);re.click(`[data-session="delete-memory"][data-id="${memory.id}"]`);assert.equal(re.state().sessions.find(s=>s.id===newSession).context.length,1);
 const exported=re.state(),fresh=open();const importFile=fresh.q('#import-file');Object.defineProperty(importFile,'files',{value:[{size:1000,text:async()=>JSON.stringify(exported)}]});importFile.dispatchEvent(new fresh.w.Event('change'));await wait(50);
 assert.equal(fresh.state().handoffs.length,1);assert.equal(fresh.state().sessions.find(s=>s.id===newSession).context.length,1);assert.equal(fresh.state().versions[id].length,3);assert.equal(fresh.state().runs.find(r=>r.task==='Summarize pending document').status,'queued');assert.ok(fresh.state().queuePaused[id]);
 assert.deepEqual(fresh.state().handoffs[0].payload,h.payload);
 console.log('PASS: fresh session, summary reuse, intentional memory add/delete, extended backup round trip with versions, sessions, queues and payloads.');
 assert.deepEqual(errors,[]);
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>windows.forEach(w=>w.close()));
