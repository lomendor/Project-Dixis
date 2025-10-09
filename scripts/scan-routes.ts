import fs from 'fs'; import path from 'path';
const roots=['frontend/src/app','frontend/app']; const out='docs/AGENT/SYSTEM/routes.md';
function walk(d){ if(!fs.existsSync(d)) return []; return fs.readdirSync(d).flatMap(n=>{
  const p=path.join(d,n); if(fs.statSync(p).isDirectory()) return walk(p);
  return /page\.tsx?$/.test(n)? p.replace(/^.*\/app\//,'/').replace(/\/page\.tsx?$/,'') || '/': [];
});}
const r=[...new Set(roots.flatMap(walk))].sort(); fs.mkdirSync('docs/AGENT/SYSTEM',{recursive:true});
fs.writeFileSync(out, '# App Routes\n\n'+r.map(x=>`- \`${x}\``).join('\n')+'\n');
console.log('routes →', out);
