const {JSDOM}=require('jsdom');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist');
const errors=[];
const dom=new JSDOM('<div id="app"></div><div id="toast"></div>',{url:'http://workshop.test',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,d=w.document;w.structuredClone=structuredClone;w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
w.addEventListener('error',e=>errors.push(e.error));
for(const f of ['engine.js','identity.js','model.js','app.js'])w.eval(fs.readFileSync(path.join(root,f),'utf8'));
const q=s=>d.querySelector(s),click=s=>q(s).click(),submit=s=>q(s).dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
const fill=(s,v)=>{q(s).value=v;q(s).dispatchEvent(new w.Event('input',{bubbles:true}));};
const saved=()=>JSON.parse(w.localStorage.getItem('ai-agent-workshop.v1'));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function loadBackup(data){const input=q('#import-file');Object.defineProperty(input,'files',{configurable:true,value:[{size:1000,text:async()=>JSON.stringify(data)}]});input.dispatchEvent(new w.Event('change'));await wait(30);}
(async()=>{
 const source=saved();const fresh=structuredClone(source.agents[0]);fresh.id='imported-herman';fresh.name='Herman';delete fresh.color;delete fresh.avatar;delete fresh.accessory;delete fresh.symbol;source.agents=[fresh];source.runs=[];source.messages=[];
 await loadBackup(source);assert.equal(saved().agents.length,2);assert.equal(saved().agents[1].color,'#de8735');await loadBackup(source);assert.equal(saved().agents.length,2,'Reimport must not duplicate identities');
 const bad=structuredClone(source);bad.agents[0].id='invalid" onclick="alert(1)';await loadBackup(bad);assert.equal(saved().agents.length,2);assert.match(q('#toast').textContent,/invalid agent/);
 const many=structuredClone(source);many.agents=Array.from({length:18},(_,i)=>({...fresh,id:'extra-'+i,name:'Agent '+i}));await loadBackup(many);assert.equal(d.querySelectorAll('.station').length,20);assert.ok(q('.room-scroll'));assert.ok(q('.station-grid').getAttribute('style').includes('3'));
 click('[data-select-agent="imported-herman"]');click('[data-view="blueprint"]');fill('[name="color"]','#ffddaa');fill('[name="accessory"]','star');fill('[name="symbol"]','★');submit('#config-form');assert.equal(saved().agents[1].color,'#ffddaa');assert.equal(saved().agents[1].accessory,'star');
 fill('[name="name"]','<b>Herman</b>');submit('#config-form');assert.equal(d.querySelector('h1').textContent,'Edit <b>Herman</b>');assert.equal(d.querySelector('h1 b'),null,'Agent names are text, not HTML');
 const luminance=hex=>{const v=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return v[0]*.2126+v[1]*.7152+v[2]*.0722;};
 for(let r=0;r<256;r+=25)for(let g=0;g<256;g+=25)for(let b=0;b<256;b+=25){const color='#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');const a=luminance(color),ink=luminance(w.WorkshopIdentity.ink(color));assert.ok((Math.max(a,ink)+.05)/(Math.min(a,ink)+.05)>=4.5,'Nameplate text contrast');}
 assert.deepEqual(errors,[]);console.log('PASS: backup merge/deduplication, invalid-import rejection, 20 workstations, custom colors/accessories/symbols, escaped names, and 1,331 custom-color text contrast combinations.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>dom.window.close());
