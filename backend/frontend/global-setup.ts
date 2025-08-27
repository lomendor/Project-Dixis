import { execSync } from 'node:child_process';
import { join } from 'node:path';

export default async function globalSetup() {
  const backendCwd = join(__dirname, '..'); // ../backend από το FE
  try {
    execSync('php artisan migrate:fresh --seed --env=testing', {
      cwd: backendCwd, stdio: 'inherit'
    });
  } catch (e) {
    console.error('❌ migrate:fresh --seed failed in globalSetup');
    throw e;
  }
}
