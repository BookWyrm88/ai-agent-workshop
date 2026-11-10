const {JSDOM}=require('jsdom');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const w=new JSDOM('<div id="app"></div><div id="toast"></div>',{url:'https://workshop.test',runScripts:'outside-only',pretendToBeVisual:true}).window;
w.structuredClone=structuredClone;w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
for(const file of ['engine.js','identity.js','model.js','themes.js','app.js'])w.eval(fs.readFileSync(require('node:path').join(__dirname,'../dist',file),'utf8'));
const state=()=>JSON.parse(w.localStorage.getItem('ai-agent-workshop.v1'));
const click=s=>{const el=w.document.querySelector(s);assert.ok(el,s);el.click();};
try{
 const personal=JSON.stringify(state().agents[0]);
 click('[data-action="start-tutorial"]');
 click('[data-action="tutorial-help"]');assert.match(w.document.body.textContent,/Prerequisite/);
 for(let i=0;i<11;i++){assert.equal(state().tutorial.step,i);click('[data-action="skip-step"]');}
 assert.equal(state().tutorial.step,11);assert.equal(Object.values(state().tutorial.progress).filter(x=>x==='skipped').length,11);
 assert.match(w.document.body.textContent,/0 completed · 11 skipped/);
 click('[data-action="tutorial-back"]');assert.equal(state().tutorial.step,10);
 click('[data-action="skip-tutorial"]');click('[data-action="continue-tutorial"]');assert.equal(state().tutorial.step,10);
 click('[data-view="learn"]');click('[data-action="reset-experiment"]');
 assert.equal(JSON.stringify(state().agents.find(a=>!a.practice)),personal);
 assert.equal(state().tutorial.step,0);assert.equal(state().agents.filter(a=>a.practice).length,1);
 // Creating a normal agent after reviewing the tutorial must not make it disposable.
 for(let i=0;i<11;i++)click('[data-action="skip-step"]');
 click('[data-action="new-agent"]');
 const form=()=>w.document.querySelector('#create-form');
 form().elements.name.value='Personal after tutorial';form().dispatchEvent(new w.Event('input',{bubbles:true}));
 for(let i=0;i<3;i++)form().dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 const personalNew=state().agents.find(a=>a.name==='Personal after tutorial');assert.ok(personalNew);assert.ok(!personalNew.practice);
 click('[data-view="learn"]');click('[data-action="reset-experiment"]');assert.ok(state().agents.some(a=>a.id===personalNew.id));
 console.log('PASS: every tutorial step skippable, honest progress, back/exit/resume/help, isolated reset.');
}finally{w.close();}
