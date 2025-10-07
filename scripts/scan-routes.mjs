import fs from 'fs'; import path from 'path';
const ROOTS = ['frontend/src/app','frontend/app'];
const out = 'frontend/docs/AGENT/SYSTEM/routes.md';
function walk(dir){
  if(!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).flatMap(name=>{
    const p = path.join(dir,name);
    if(fs.statSync(p).isDirectory()) return walk(p);
    if(/page\.tsx?$/.test(name)) return [p.replace(/^.*\/app\//,'/').replace(/\/page\.tsx?$/,'') || '/'];
    return [];
  });
}
const routes = ROOTS.flatMap(walk).filter(Boolean).sort();
fs.mkdirSync(path.dirname(out), { recursive:true });
fs.writeFileSync(out, '# App Routes\n\n'+routes.map(r=>`- \`${r}\``).join('\n')+'\n');
console.log('routes written:', out);
