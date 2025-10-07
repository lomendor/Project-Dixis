import fs from 'fs';
const out = 'docs/AGENT/SYSTEM/db-schema.md';
const candidates = ['prisma/schema.prisma','backend/prisma/schema.prisma','frontend/prisma/schema.prisma'];
const P = candidates.find(f=>fs.existsSync(f));
fs.mkdirSync('docs/AGENT/SYSTEM', { recursive:true });
if(!P){ fs.writeFileSync(out, '# DB Schema\n\n(Prisma schema not found)\n'); process.exit(0); }
const s = fs.readFileSync(P,'utf8');
fs.writeFileSync(out, '# DB Schema (Prisma)\n\n```prisma\n'+s+'\n```\n');
console.log('db schema written:', out);
