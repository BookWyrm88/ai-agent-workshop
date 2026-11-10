/* Build a self-contained Pages entry point without changing the application. */
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,'dist',name),'utf8').replace(/\r\n/g,'\n');
let html=read('index.html');
for(const name of ['styles.css','rainbow.css'])html=html.replace(`<link rel="stylesheet" href="${name}">`,`<style>\n${read(name)}\n</style>`);
for(const name of ['engine.js','identity.js','model.js','app.js'])html=html.replace(`<script src="${name}"></script>`,`<script>\n${read(name)}\n</script>`);
fs.mkdirSync(path.join(root,'docs'),{recursive:true});
// The preserved standalone download used Windows line endings. Keep identical bytes on every OS.
fs.writeFileSync(path.join(root,'docs/index.html'),html.replace(/\n/g,'\r\n'));
fs.writeFileSync(path.join(root,'docs/.nojekyll'),'');
console.log('Built docs/index.html. No application code or stored workspace data was changed.');
