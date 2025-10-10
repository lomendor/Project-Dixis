#!/usr/bin/env tsx
/**
 * CI Schema Sync - Pass CI-SYNC-01
 *
 * Keeps schema.ci.prisma (SQLite for E2E) in sync with schema.prisma (PostgreSQL)
 * Converts provider and datasource URL for CI environment.
 *
 * Usage: npm run ci:prisma:sync
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const REPO_ROOT = resolve(__dirname, '../..');
const SCHEMA_PG = resolve(REPO_ROOT, 'frontend/prisma/schema.prisma');
const SCHEMA_CI = resolve(REPO_ROOT, 'frontend/prisma/schema.ci.prisma');

function syncSchemas() {
  console.log('[sync-ci-schema] Reading PostgreSQL schema...');
  const pgSchema = readFileSync(SCHEMA_PG, 'utf-8');

  console.log('[sync-ci-schema] Converting to SQLite...');

  // Step 1: Replace datasource block
  const ciSchema = pgSchema
    .replace(
      /datasource\s+db\s*\{[^}]+\}/,
      `datasource db {
  provider = "sqlite"
  url      = "file:./ci.db"
}`
    )
    // Step 2: Remove PostgreSQL-specific annotations
    .replace(/@db\.Text/g, '')
    .replace(/@db\.Decimal\([^)]+\)/g, '')
    .replace(/@db\.VarChar\([^)]+\)/g, '')
    .replace(/@db\.Uuid/g, '')
    // Step 3: Convert uuid() default to cuid() (SQLite compatible)
    .replace(/@default\(uuid\(\)\)/g, '@default(cuid())')
    // Step 4: Add CI schema header comment
    .replace(
      /^/,
      `// ⚠️ AUTO-GENERATED - DO NOT EDIT MANUALLY
// Synced from schema.prisma by scripts/ci/sync-ci-schema.ts
// Run: npm run ci:prisma:sync

`
    );

  console.log('[sync-ci-schema] Writing SQLite schema...');
  writeFileSync(SCHEMA_CI, ciSchema, 'utf-8');

  console.log('[sync-ci-schema] ✅ schema.ci.prisma synced successfully');
}

// Execute if run directly
if (require.main === module) {
  try {
    syncSchemas();
    process.exit(0);
  } catch (error) {
    console.error('[sync-ci-schema] ❌ Sync failed:', error);
    process.exit(1);
  }
}

export { syncSchemas };
