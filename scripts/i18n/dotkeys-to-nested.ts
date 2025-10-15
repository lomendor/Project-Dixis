#!/usr/bin/env tsx
/**
 * Idempotent converter: dot-keys → nested JSON
 * Usage: npx tsx scripts/i18n/dotkeys-to-nested.ts
 *
 * Converts i18n messages from flat dot-keys to nested structure.
 * Safe to run multiple times - skips already nested keys.
 */

import fs from 'fs/promises';
import path from 'path';

const MESSAGES_DIR = path.join(process.cwd(), 'frontend/messages');

function hasAnyDotKeys(obj: Record<string, any>): boolean {
  return Object.keys(obj).some(key => key.includes('.'));
}

function convertToNested(flat: Record<string, any>): Record<string, any> {
  const nested: Record<string, any> = {};

  for (const [key, value] of Object.entries(flat)) {
    if (!key.includes('.')) {
      // Already a top-level key or nested object
      nested[key] = value;
      continue;
    }

    // Split dot-key and build nested structure
    const parts = key.split('.');
    let current = nested;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part] || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
  }

  return nested;
}

async function processFile(filePath: string): Promise<void> {
  const content = await fs.readFile(filePath, 'utf-8');
  const messages = JSON.parse(content);

  if (!hasAnyDotKeys(messages)) {
    console.log(`✅ ${path.basename(filePath)}: Already nested, no changes needed`);
    return;
  }

  console.log(`🔄 ${path.basename(filePath)}: Converting dot-keys to nested...`);
  const nested = convertToNested(messages);

  await fs.writeFile(filePath, JSON.stringify(nested, null, 2) + '\n', 'utf-8');
  console.log(`✅ ${path.basename(filePath)}: Conversion complete`);
}

async function main() {
  try {
    const files = await fs.readdir(MESSAGES_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    if (jsonFiles.length === 0) {
      console.log('⚠️  No JSON files found in', MESSAGES_DIR);
      process.exit(0);
    }

    console.log(`📦 Processing ${jsonFiles.length} message file(s)...\n`);

    for (const file of jsonFiles) {
      await processFile(path.join(MESSAGES_DIR, file));
    }

    console.log('\n✅ All files processed successfully');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
