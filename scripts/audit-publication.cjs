/* Scan only tracked/staged publishable bytes. Never print candidate secret values. */
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const git=args=>execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:20*1024*1024});
const staged=process.argv.includes('--staged');
const files=git(['ls-files','-z']).split('\0').filter(Boolean);
if(!files.length)throw Error('No tracked files to audit. Stage the intended release files first.');
const rules=[
 ['private-key',/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
 ['github-token',/\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{30,})\b/],
 ['provider-key',/\b(?:sk-(?:proj-|ant-)?[A-Za-z0-9_-]{24,}|AIza[A-Za-z0-9_-]{30,}|AKIA[0-9A-Z]{16})\b/],
 ['credential-url',/https?:\/\/[^\s\/@:]+:[^\s\/@]+@/],
 ['local-home-path',/(?:[A-Z]:[\\/](?:Users|Documents and Settings)[\\/]|\/(?:Users|home)\/[^\s/]+)/i],
 ['local-hosting-id',/\bappgprj_[A-Za-z0-9]+\b/],
 ['personal-email',/\b[A-Z0-9._%+-]+@(?:gmail|yahoo|outlook|hotmail|icloud|protonmail)\.[A-Z]{2,}\b/i],
 ['literal-credential',/\b(?:api[_-]?key|access[_-]?token|password|client[_-]?secret)\b\s*[=:]\s*["'][A-Za-z0-9_+\/=.-]{16,}["']/i]
];
const problems=[];
for(const file of files){
 if(/(^|\/)(?:\.openai|\.aws|\.ssh|\.codex|\.git|node_modules|backups|private|attachments|screenshots)(\/|$)|(^|\/)\.env(?:\.|$)|\.(?:pem|key|p12|pfx|bundle|zip)$/i.test(file))problems.push({file,rule:'forbidden-file'});
 const text=staged?git(['show',':'+file]):fs.readFileSync(path.join(root,file),'utf8');
 for(const [name,regex] of rules){const match=regex.exec(text);if(match)problems.push({file,line:text.slice(0,match.index).split('\n').length,rule:name});}
 if(file.endsWith('.json')){try{const data=JSON.parse(text);if(Array.isArray(data.agents)&&Array.isArray(data.runs)&&Array.isArray(data.messages))problems.push({file,rule:'browser-workspace-export'});}catch{}}
}
if(problems.length){console.error(JSON.stringify({status:'REVIEW REQUIRED',findings:problems},null,2));process.exitCode=1;}
else console.log(`PASS: ${files.length} ${staged?'staged':'tracked'} files scanned; no configured secret/private-data patterns found. Manual review is still required.`);
