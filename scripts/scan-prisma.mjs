import fs from 'fs'; import path from 'path';
import { fileURLToPath } from 'url';

// Detect repo root (where scripts/ exists)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const OUT = path.join(repoRoot, 'frontend', 'docs', 'AGENT', 'SYSTEM', 'db-schema.md');
const candidates = [
  path.join(repoRoot, 'frontend/prisma/schema.prisma'),
  path.join(repoRoot, 'prisma/schema.prisma'),
  path.join(repoRoot, 'backend/prisma/schema.prisma')
];

const P = candidates.find(f=>fs.existsSync(f));
fs.mkdirSync(path.dirname(OUT), { recursive:true });

if(!P){ 
  fs.writeFileSync(OUT, '# DB Schema\n\n(Prisma schema not found)\n'); 
  console.log(`db schema written: ${OUT} (missing)`); 
  process.exit(0); 
}

const s = fs.readFileSync(P,'utf8');
fs.writeFileSync(OUT, '# DB Schema (Prisma)\n\n```prisma\n'+s+'\n```\n');
console.log(`db schema written: ${OUT} (bytes=${s.length}) from ${P}`);
