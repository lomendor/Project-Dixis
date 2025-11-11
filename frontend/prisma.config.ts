import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  // paths are relative to this file
  schema: path.join('prisma', 'schema.prisma'),
  migrations: { path: path.join('prisma', 'migrations') },
});
