/**
 * Test: i18n messages use nested structure (no dot-keys)
 *
 * Purpose: Prevent regressions where developers accidentally introduce
 * dot-keys like "home.title" instead of nested structure { home: { title: "..." } }
 *
 * Fails if: Any top-level key contains a dot character
 */

import { test, expect } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

test.describe('i18n messages structure', () => {
  test('el.json should use nested structure (no dot-keys)', async () => {
    const messagesPath = path.join(process.cwd(), 'messages/el.json');
    const content = await fs.readFile(messagesPath, 'utf-8');
    const messages = JSON.parse(content);

    const dotKeys = Object.keys(messages).filter(key => key.includes('.'));

    expect(dotKeys, 'Found dot-keys in el.json - use nested structure instead').toHaveLength(0);
  });

  test('en.json should use nested structure (no dot-keys)', async () => {
    const messagesPath = path.join(process.cwd(), 'messages/en.json');
    const content = await fs.readFile(messagesPath, 'utf-8');
    const messages = JSON.parse(content);

    const dotKeys = Object.keys(messages).filter(key => key.includes('.'));

    expect(dotKeys, 'Found dot-keys in en.json - use nested structure instead').toHaveLength(0);
  });

  test('el.json should have expected nested structure', async () => {
    const messagesPath = path.join(process.cwd(), 'messages/el.json');
    const content = await fs.readFile(messagesPath, 'utf-8');
    const messages = JSON.parse(content);

    // Verify top-level sections exist and are objects
    expect(messages.home).toBeDefined();
    expect(typeof messages.home).toBe('object');

    expect(messages.nav).toBeDefined();
    expect(typeof messages.nav).toBe('object');

    // Verify nested structure (not flat)
    expect(messages.home.title).toBeDefined();
    expect(typeof messages.home.title).toBe('string');
  });
});
