import * as fs from 'fs';
import * as path from 'path';
import { createConsumerStorageState } from './create-storage-state';

/**
 * Phase-3c: Global setup for Playwright tests
 * Creates storageState files if needed
 */
async function globalSetup() {
  const authPath = path.join(__dirname, '../.auth/consumer.json');

  // Check if development server is running
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3030';
  try {
    const response = await fetch(baseURL);
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
  } catch (error) {
    console.log(`⚠️ Development server not available at ${baseURL}, skipping storageState creation`);
    console.log('💡 For storageState tests, ensure the dev server is running');
    return;
  }

  // Check if storage state exists and is recent (< 6 hours)
  let shouldCreate = true;

  if (fs.existsSync(authPath)) {
    const stats = fs.statSync(authPath);
    const sixHoursAgo = Date.now() - (6 * 60 * 60 * 1000);

    if (stats.mtime.getTime() > sixHoursAgo) {
      console.log('✅ Consumer storageState is recent, skipping creation');
      shouldCreate = false;
    } else {
      console.log('⏰ Consumer storageState is old, recreating...');
    }
  } else {
    console.log('🔄 Consumer storageState not found, creating...');
  }

  if (shouldCreate) {
    await createConsumerStorageState();
  }
}

export default globalSetup;