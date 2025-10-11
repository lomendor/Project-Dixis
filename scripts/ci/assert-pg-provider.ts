import fs from 'fs'

const path = 'frontend/prisma/schema.prisma'

if (!fs.existsSync(path)) {
  console.log('OK: schema.prisma not found (skipping)')
  process.exit(0)
}

const s = fs.readFileSync(path, 'utf8')
const m = s.match(/provider\s*=\s*"(.*?)"/)
const provider = m?.[1] || ''

if (provider.toLowerCase() !== 'postgresql') {
  console.error(`❌ Prod-DB Gate: Expected provider "postgresql" in ${path}, found "${provider}"`)
  process.exit(1)
}

console.log('✅ Prod-DB Gate: provider is postgresql')
