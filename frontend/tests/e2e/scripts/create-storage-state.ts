import { test } from '@playwright/test';
const { TestAuthHelper } = require('../helpers/test-auth');
import path from 'path';

/**
 * Script to create storage state for authenticated tests
 * Run with: npm run e2e:state
 */

test('Create Consumer Storage State', async ({ page, context }) => {
  console.log('🔐 Creating consumer storage state...');

  const helper = new TestAuthHelper(page);
  await helper.testLogin('consumer');

  const authDir = path.join(__dirname, '../../.auth');
  const storageStatePath = path.join(authDir, 'consumer.json');

  await context.storageState({ path: storageStatePath });
  console.log(`✅ Consumer storage state saved to: ${storageStatePath}`);
});

test('Create Producer Storage State', async ({ page, context }) => {
  console.log('🔐 Creating producer storage state...');

  const helper = new TestAuthHelper(page);
  await helper.testLogin('producer');

  const authDir = path.join(__dirname, '../../.auth');
  const storageStatePath = path.join(authDir, 'producer.json');

  await context.storageState({ path: storageStatePath });
  console.log(`✅ Producer storage state saved to: ${storageStatePath}`);
});