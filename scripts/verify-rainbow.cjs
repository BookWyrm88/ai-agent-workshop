const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const tag='v0.1.0-rainbow';
const worktree=process.argv.includes('--worktree');
const read=file=>worktree?fs.readFileSync(path.join(root,file)):execFileSync('git',['show',`${tag}:${file}`],{cwd:root,maxBuffer:20*1024*1024});
const manifest=JSON.parse(read('releases/v0.1.0-rainbow/manifest.json'));
for(const [file,hash] of Object.entries(manifest.sha256)){
 const actual=crypto.createHash('sha256').update(read(file)).digest('hex');
 if(actual!==hash)throw Error(`Rainbow preservation check failed for ${file}`);
}
console.log(`PASS: ${Object.keys(manifest.sha256).length} original application files match their preserved SHA-256 hashes (${worktree?'working tree':tag}).`);
