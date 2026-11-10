const {JSDOM}=require('jsdom');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const html=fs.readFileSync(path.resolve(__dirname,'../docs/index.html'),'utf8');
const errors=[];
// A project-site path catches root-relative asset mistakes without making network requests.
const dom=new JSDOM(html,{url:'https://example.github.io/ai-agent-workshop/',runScripts:'dangerously',beforeParse(w){w.structuredClone=structuredClone;w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.addEventListener('error',e=>errors.push(e.error));}});
try{
 const d=dom.window.document;
 assert.equal(d.querySelector('h1').textContent,'The Workshop');
 assert.equal(d.querySelectorAll('script[src],link[rel="stylesheet"][href]').length,0);
 assert.ok(d.querySelector('[data-action="export"]'));
 assert.ok(d.querySelector('[data-action="import"]'));
 assert.ok(d.querySelector('[data-agent-name="Moss"]'));
 assert.ok(d.querySelector('.headquarters .hq-station'));
 assert.ok(html.includes('data:image/png;base64,'),'Scene artwork must travel with the standalone file');
 assert.ok(!html.includes('url("assets/'),'No missing external art in the standalone build');
 assert.deepEqual(errors,[]);
 console.log('PASS: GitHub Pages project-path entry initializes, all app assets are inline, and export/import controls remain present.');
}finally{dom.window.close();}
