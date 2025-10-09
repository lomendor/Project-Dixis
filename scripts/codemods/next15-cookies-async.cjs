/**
 * Codemod: Adapt to Next.js 15.5 async cookies()
 * - const s = cookies();        => const s = await cookies();
 * - cookies().get|set|delete    => (await cookies()).get|set|delete
 * - Make common handlers/components async if file uses await cookies()
 */
const fs = require('fs'); const path = require('path');

const exts = new Set(['.ts','.tsx']);
const root = 'frontend/src';

function listFiles(dir){
  if(!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).flatMap(n=>{
    const p = path.join(dir,n);
    const st = fs.statSync(p);
    if(st.isDirectory()) return listFiles(p);
    if(exts.has(path.extname(p))) return [p];
    return [];
  });
}

function patchFile(p){
  let s = fs.readFileSync(p,'utf8');
  const orig = s;

  // Only touch files that reference cookies from next/headers
  if(!/from\s+['"]next\/headers['"]/.test(s) && !/\bcookies\(\)/.test(s)) return false;

  // Replace direct chained calls first
  s = s.replace(/cookies\(\)\.(get|set|delete)\s*\(/g, '(await cookies()).$1(');

  // Replace const X = cookies();
  s = s.replace(/(\bconst\s+\w+\s*=\s*)cookies\(\)\s*;/g, '$1await cookies();');

  // If we now have "await cookies()", we need enclosing async function.
  if(/\bawait\s+cookies\(\)/.test(s)){
    // Common exported handlers
    s = s.replace(/\bexport\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(/g, 'export async function $1(');
    // export default function
    s = s.replace(/\bexport\s+default\s+function\s+\b/g, 'export default async function ');
    // export const HANDLER = (...) => { ... }
    s = s.replace(/\bexport\s+const\s+(GET|POST|PUT|DELETE|PATCH)\s*=\s*\(/g, 'export const $1 = async (');
    // export const name = async already? leave it.
  }

  if (s !== orig){
    fs.writeFileSync(p,s);
    return true;
  }
  return false;
}

const files = listFiles(root);
let changed = 0;
for(const f of files){
  if(patchFile(f)) { changed++; console.log('patched:', f); }
}
console.log('changed files:', changed);
