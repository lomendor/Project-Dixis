import fs from 'fs'; import path from 'path';
const dir = 'frontend/docs/OPS/PASSES';
const out = 'frontend/docs/OPS/STATE.md';
fs.mkdirSync(dir, { recursive:true });
const files = fs.readdirSync(dir).filter(f=>/\.md$/i.test(f)).sort();
let body = '# Aggregated STATE\n\n> Generated from PASS files under frontend/docs/OPS/PASSES/\n\n';
for(const f of files){
  body += `\n---\n\n## ${f}\n\n` + fs.readFileSync(path.join(dir,f),'utf8') + '\n';
}
fs.writeFileSync(out, body);
console.log('STATE rebuilt from', files.length, 'files');
