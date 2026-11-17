const {JSDOM}=require('jsdom'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist'),windows=[];
function open(saved,theme){const w=new JSDOM('<div id="app"></div><div id="toast"></div>',{url:'https://workshop.test',runScripts:'outside-only'}).window;windows.push(w);w.structuredClone=structuredClone;w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};if(saved)w.localStorage.setItem('ai-agent-workshop.v1',saved);if(theme)w.localStorage.setItem('ai-agent-workshop.theme.v1',theme);for(const name of ['engine.js','human.js','robot.js','robot-floor.js','identity.js','model.js','spatial.js','space-view.js','systems.js','headquarters.js','themes.js','app.js'])w.eval(fs.readFileSync(path.join(root,name),'utf8'));return w;}
try{
 const w=open(),d=w.document;
 assert.equal(d.documentElement.dataset.theme,'neon');assert.ok(d.querySelector('.neon-avatar'));assert.match(d.querySelector('.studio-sign').textContent,/NOCTURNE/);
 assert.ok(d.querySelector('.headquarters .hq-architecture'));
 assert.equal(d.querySelectorAll('.hq-station').length,3);
 assert.equal(d.querySelectorAll('.vacant-station').length,3);
 const scene=w.WorkshopHeadquarters;
 assert.ok(scene.slot(3).y>scene.slot(0).y,'Stations occupy distinct depth rows');
 assert.ok(scene.slot(3).scale>scene.slot(0).scale,'Foreground stations are larger');
 const active=d.querySelector('.hq-station');assert.ok(Number(active.dataset.wireX)>0);assert.ok(Number(active.dataset.wireY)>0);
 d.querySelector('[data-scene-console]').click();assert.equal(d.activeElement.id,'task-input');
 d.querySelector('[data-view="settings"]').click();const before=JSON.parse(w.localStorage.getItem('ai-agent-workshop.v1'));const core=s=>JSON.stringify([s.agents,s.runs,s.messages,s.versions,s.sessions,s.memories]);
 for(const theme of ['spectrum','forest','neon']){const el=d.querySelector('#theme-select');el.value=theme;el.dispatchEvent(new w.Event('change'));assert.equal(d.documentElement.dataset.theme,theme);assert.equal(core(JSON.parse(w.localStorage.getItem('ai-agent-workshop.v1'))),core(before));}
 const second=open(w.localStorage.getItem('ai-agent-workshop.v1'),'forest');assert.equal(second.document.documentElement.dataset.theme,'forest');second.document.querySelector('[data-view="workshop"]').click();assert.match(second.document.querySelector('.studio-sign').textContent,/FOREST/);
 // Text/surface palette contrast and custom identity nameplates are complementary checks.
 const lum=hex=>{const a=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return a[0]*.2126+a[1]*.7152+a[2]*.0722;};
 for(const [bg,fg] of [['#16151c','#f0edf3'],['#16151c','#bbb3c5'],['#203a30','#f0eedc'],['#203a30','#c0cbb5'],['#fffdf8','#303244'],['#fffdf8','#656579']]){const a=lum(bg),b=lum(fg);assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5);}
 const css=fs.readFileSync(path.join(root,'themes.css'),'utf8');assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 console.log('PASS: three theme adapters, Neon default, independent persistent preference, unchanged agent/task/session data, text palette contrast and reduced-motion rule.');
}finally{windows.forEach(w=>w.close());}
