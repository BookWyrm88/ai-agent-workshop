const {JSDOM}=require('jsdom');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const errors=[];const windows=[];
function open(saved,delay=50){
  const dom=new JSDOM('<!doctype html><div id="app"></div><div id="toast"></div>',{url:'http://workshop.test',runScripts:'outside-only',pretendToBeVisual:true});
  windows.push(dom.window);const w=dom.window;w.structuredClone=structuredClone;w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
  w.addEventListener('error',e=>errors.push(e.error));if(saved)w.localStorage.setItem('ai-agent-workshop.v1',saved);
  w.eval(fs.readFileSync(path.join(root,'engine.js'),'utf8'));
  const Original=w.WorkshopCore.AgentRuntime;w.WorkshopCore.AgentRuntime=class extends Original{constructor(){super(undefined,delay);}};
  w.eval(fs.readFileSync(path.join(root,'identity.js'),'utf8'));w.eval(fs.readFileSync(path.join(root,'model.js'),'utf8'));w.eval(fs.readFileSync(path.join(root,'app.js'),'utf8'));
  const d=w.document;
  const q=s=>{const e=d.querySelector(s);assert.ok(e,'Missing '+s);return e;};
  const click=s=>q(s).click();
  const fill=(s,v)=>{const e=q(s);e.value=v;e.dispatchEvent(new w.Event('input',{bubbles:true}));e.dispatchEvent(new w.Event('change',{bubbles:true}));};
  const submit=s=>q(s).dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  const stored=()=>JSON.parse(w.localStorage.getItem('ai-agent-workshop.v1'));
  const select=name=>{const a=stored().agents.find(a=>a.name===name);click(`[data-select-agent="${a.id}"]`);};
  return {dom,w,d,q,click,fill,submit,stored,select,save:()=>w.localStorage.getItem('ai-agent-workshop.v1')};
}
function createAgent(t,name,color='#de8735',shape='square'){
  t.click('[data-action="new-agent"]');assert.equal(t.q('#dialog-title').textContent,'Create New Agent');
  t.fill('#new-agent-name',name);t.fill('#create-form [name="avatar"]',shape);t.click(`[data-color="${color}"]`);t.submit('#create-form');
  t.fill('#create-form [name="instructions"]','Summarize accurately. Use bullets.');t.submit('#create-form');
  assert.equal(t.stored().agents.some(a=>a.name===name),false,'Draft must not create or overwrite an agent');
  t.submit('#create-form');assert.match(t.q('h1').textContent,/Workshop/);
}
(async()=>{
  const t=open();const mossBefore=JSON.stringify(t.stored().agents[0]);
  createAgent(t,'Herman');assert.equal(t.d.querySelectorAll('.station').length,2);assert.ok(t.q('[data-agent-name="Moss"]'));assert.ok(t.q('[data-agent-name="Herman"]'));
  assert.equal(t.stored().agents[1].color,'#de8735');assert.equal(t.stored().agents[0].color,'#569773');assert.notEqual(t.stored().agents[0].avatar,t.stored().agents[1].avatar);
  t.click('[data-view="blueprint"]');assert.equal(t.q('h1').textContent,'Edit Herman');t.fill('#config-form [name="instructions"]','Use bullets. Include risks and uncertainty.');assert.match(t.q('#dirty-label').textContent,/Unsaved/);t.submit('#config-form');
  assert.equal(JSON.stringify(t.stored().agents[0]),mossBefore,'Editing Herman must preserve all Moss fields');
  t.click('[data-view="workshop"]');t.select('Moss');t.click('[data-view="blueprint"]');assert.equal(t.q('[name="instructions"]').value,JSON.parse(mossBefore).instructions);
  t.click('[data-view="workshop"]');t.select('Herman');t.click('[data-prompt="Summarize the sample document"]');t.submit('#task-form');
  assert.ok(t.q('[data-agent-name="Herman"]').classList.contains('working'));assert.ok(t.q('[data-agent-name="Moss"]').classList.contains('idle'));
  t.select('Moss');assert.equal(t.d.querySelectorAll('.station').length,2);assert.equal(t.q('button[type="submit"]').disabled,false);
  t.click('[data-prompt="Create an action checklist from the sample document"]');t.submit('#task-form');
  assert.equal(t.stored().runs.filter(r=>r.status==='working').length,2,'Two independent agents can run concurrently');
  t.click('[data-action="pause"]');await wait(15);assert.equal(t.stored().runs.find(r=>r.agentId===t.stored().selected).status,'paused');
  t.select('Herman');t.click('[data-view="blueprint"]');t.fill('#config-form [name="role"]','Quality reviewer');
  await wait(300);assert.equal(t.q('#config-form [name="role"]').value,'Quality reviewer','Background events preserve dirty fields');
  assert.equal(t.stored().runs.find(r=>r.config.name==='Herman').status,'completed');assert.equal(t.stored().runs.find(r=>r.config.name==='Moss').status,'paused');
  t.submit('#config-form');t.click('[data-view="laboratory"]');assert.match(t.q('.trace-list').textContent,/Document received/);assert.ok(t.stored().runs.filter(r=>r.config.name==='Herman').every(r=>r.config.role==='Document explorer'),'Running configuration snapshots stay immutable');
  t.click('[data-view="workshop"]');t.select('Moss');t.click('[data-action="resume"]');await wait(280);assert.equal(t.stored().runs.find(r=>r.config.name==='Moss').status,'completed');
  createAgent(t,'Iris','#a96bb4','cat');assert.equal(t.d.querySelectorAll('.station').length,3);
  const reopened=open(t.save());assert.equal(reopened.d.querySelectorAll('.station').length,3);assert.equal(reopened.stored().agents.find(a=>a.name==='Herman').role,'Quality reviewer');assert.equal(reopened.stored().agents[0].instructions,JSON.parse(mossBefore).instructions);
  console.log('PASS: requested Moss/Herman workflow, distinct identity, side-by-side workstations, independent configuration/history, concurrent execution, switching, selected controls, event-safe editing, and third agent persistence.');
  // Migrate the original v1 records without changing their IDs, instructions or histories.
  const old=t.stored();delete old.ui;delete old.drafts;old.tutorial={active:true,step:4};for(const a of old.agents)for(const k of ['color','avatar','accessory','symbol','provider','model','memory'])delete a[k];
  const migrated=open(JSON.stringify(old));assert.equal(migrated.stored().agents[0].id,old.agents[0].id);assert.equal(migrated.stored().agents[1].color,'#de8735');assert.equal(migrated.stored().agents[0].color,'#569773');assert.equal(migrated.stored().runs.length,old.runs.length);assert.equal(migrated.stored().legacyTutorial.step,4);
  console.log('PASS: v1 save migration retains identities, instructions, histories, and prior tutorial record; assigns Moss green and Herman orange.');
  const lesson=open(undefined,25);const step=n=>assert.equal(lesson.stored().tutorial.step,n,'Tutorial stage');
  lesson.click('[data-action="start-tutorial"]');step(0);lesson.select('Practice Moss');step(1);
  lesson.click('[data-action="new-agent"]');lesson.fill('#new-agent-name','Herman');lesson.fill('[name="avatar"]','square');lesson.click('[data-color="#de8735"]');lesson.submit('#create-form');step(2);
  // Refresh mid-creation restores both draft and tutorial stage.
  const resumed=open(lesson.save(),25);assert.equal(resumed.stored().tutorial.step,2);assert.match(resumed.q('#dialog-title').textContent,/Create New Agent/);assert.equal(resumed.stored().agents.length,2);
  resumed.fill('#create-form [name="instructions"]','Summarize accurately. Use bullets.');resumed.submit('#create-form');assert.equal(resumed.stored().tutorial.step,3);resumed.submit('#create-form');assert.equal(resumed.stored().tutorial.step,4);
  resumed.click('[data-action="pause-tutorial"]');resumed.click('[data-prompt="Summarize the sample document"]');resumed.submit('#task-form');await wait(160);assert.equal(resumed.stored().tutorial.step,4,'Paused tutorials do not advance');
  resumed.click('[data-action="continue-tutorial"]');resumed.click('[data-prompt="Summarize the sample document"]');resumed.submit('#task-form');assert.equal(resumed.stored().tutorial.step,5);await wait(160);
  resumed.click('.activity-panel [data-view="laboratory"]');assert.equal(resumed.stored().tutorial.step,6);
  resumed.q('#output-details').open=true;resumed.q('#output-details').dispatchEvent(new resumed.w.Event('toggle'));assert.equal(resumed.stored().tutorial.step,7);
  resumed.fill('[name="accuracy"]','5');resumed.fill('[name="coverage"]','3');resumed.fill('[name="notes"]','Missing uncertainty.');resumed.submit('#evaluation-form');assert.equal(resumed.stored().tutorial.step,8);assert.match(resumed.q('h1').textContent,/Edit Herman/);
  resumed.click('[data-action="add-risk"]');resumed.submit('#config-form');assert.equal(resumed.stored().tutorial.step,9);assert.match(resumed.q('h1').textContent,/Workshop/);
  resumed.submit('#task-form');assert.equal(resumed.stored().tutorial.step,10);await wait(170);assert.equal(resumed.q('h1').textContent,'The Laboratory');
  resumed.click('[data-action="compare"]');assert.equal(resumed.stored().tutorial.step,11);assert.match(resumed.q('#comparison').textContent,/not been confirmed/);assert.match(resumed.d.body.textContent,/11 completed · 0 skipped/);
  resumed.click('[data-view="learn"]');resumed.click('[data-action="toggle-tutorials"]');assert.equal(resumed.d.querySelector('.tutorial'),null);resumed.click('[data-action="restart-tutorial"]');assert.equal(resumed.stored().tutorial.step,0);assert.equal(resumed.stored().agents.length,3);
  console.log('PASS: all 8 lessons / 11 action stages, exact-action detection, creation draft reload, pause/resume, guided navigation, evaluation, instruction improvement, rerun/comparison, disable, and replay.');
  // Failures and cancellation still apply only to the selected agent.
  reopened.select('Herman');reopened.click('[data-view="blueprint"]');reopened.q('#practice-failure').checked=true;reopened.q('#practice-failure').dispatchEvent(new reopened.w.Event('change'));reopened.click('[data-view="workshop"]');reopened.click('[data-prompt="Summarize the sample document"]');reopened.submit('#task-form');await wait(150);assert.equal(reopened.stored().runs[0].status,'failed');reopened.click('[data-view="laboratory"]');reopened.click('[data-action="retry"]');await wait(280);assert.equal(reopened.stored().runs[0].status,'completed');
  reopened.click('[data-view="workshop"]');reopened.click('[data-prompt="Summarize the sample document"]');reopened.submit('#task-form');reopened.click('[data-action="cancel"]');await wait(20);assert.equal(reopened.stored().runs[0].status,'cancelled');
  assert.deepEqual(errors,[]);console.log('PASS: failure/retry/cancel regressions; no UI runtime exceptions.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>windows.forEach(w=>w.close()));


