import { promises as fs } from 'node:fs'
import path from 'node:path'

const SRC = path.join(process.cwd(), 'frontend', 'prisma', 'schema.prisma')
const DEST = path.join(process.cwd(), 'frontend', 'prisma', 'schema.ci.prisma')

async function main() {
  const src = await fs.readFile(SRC, 'utf8')

  // Μετασχηματισμός datasource db → sqlite/file:./ci.db
  const updated = src.replace(/datasource\s+db\s*{[\s\S]*?}/m, (block) => {
    let b = block
    b = b.replace(/provider\s*=\s*".*?"/, 'provider = "sqlite"')
    b = b.replace(/url\s*=\s*.*$/m, 'url      = "file:./ci.db"')
    return b
  })
  // uuid() → cuid() (sqlite-συμβατό default)
  .replace(/\@default\(\s*uuid\s*\(\s*\)\s*\)/g, '@default(cuid())')
  // Αφαίρεση PostgreSQL-specific @db attributes (Decimal, VarChar, etc.)
  .replace(/\s*@db\.\w+(\([^)]*\))?/g, '')

  const header = `/// AUTO-GENERATED FILE — DO NOT EDIT.
/// Source: frontend/prisma/schema.prisma
/// Transforms: provider(postgresql→sqlite), url(env→"file:./ci.db"), default(uuid()→cuid()), @db.*→removed
`

  await fs.writeFile(DEST, header + '\n' + updated, 'utf8')
}

main().catch((e) => {
  console.error('sync-ci-schema failed:', e)
  process.exit(1)
})
