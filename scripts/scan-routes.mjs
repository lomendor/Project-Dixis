import fs from 'fs'; import path from 'path';
import { fileURLToPath } from 'url';

// Detect repo root (where scripts/ exists)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const APP_CANDIDATES = [
  path.join(repoRoot, 'frontend/src/app'),
  path.join(repoRoot, 'frontend/app')
];
const OUT = path.join(repoRoot, 'frontend', 'docs', 'AGENT', 'SYSTEM', 'routes.md');

function findAppRoot(){
  for(const p of APP_CANDIDATES){ 
    if(fs.existsSync(p)) {
      console.log(`[scan-routes] Found app dir: ${p}`);
      return p;
    }
  }
  console.log('[scan-routes] No app dir found in:', APP_CANDIDATES);
  return null;
}

function walk(dir, acc){
  for(const name of fs.readdirSync(dir)){
    const p = path.join(dir,name);
    const st = fs.statSync(p);
    if(st.isDirectory()){
      if(['node_modules','.next','.git'].includes(name)) continue;
      walk(p, acc);
    }else{
      if(/^page\.tsx?$/.test(name)) acc.push(p);
    }
  }
}

function toRoute(appRoot, file){
  const rel = file.substring(appRoot.length);
  const noPage = rel.replace(/\/page\.tsx?$/,'').replace(/\\/g,'/');
  return noPage === '' ? '/' : noPage;
}

const appRoot = findAppRoot();
const routes = new Set();
if(appRoot){
  const files = []; 
  walk(appRoot, files);
  console.log(`[scan-routes] Found ${files.length} page files`);
  for(const f of files){ 
    const r = toRoute(appRoot, f);
    routes.add(r);
  }
}

fs.mkdirSync(path.dirname(OUT), { recursive:true });
const list = Array.from(routes).sort();
fs.writeFileSync(OUT, '# App Routes\n\n' + list.map(r=>`- \`${r}\``).join('\n') + (list.length? '\n':''));
console.log(`routes written: ${OUT} (count=${list.length})`);
