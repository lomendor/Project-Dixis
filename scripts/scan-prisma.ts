import fs from 'fs'; const out='docs/AGENT/SYSTEM/db-schema.md';
const P=['prisma/schema.prisma','backend/prisma/schema.prisma','frontend/prisma/schema.prisma'].find(f=>fs.existsSync(f));
fs.mkdirSync('docs/AGENT/SYSTEM',{recursive:true});
fs.writeFileSync(out, P?('# DB Schema (Prisma)\n\n```prisma\n'+fs.readFileSync(P,'utf8')+'\n```\n'):'# DB Schema\n\n(Prisma schema not found)\n');
console.log('db →', out);
