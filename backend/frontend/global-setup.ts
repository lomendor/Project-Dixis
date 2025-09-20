import { execSync } from 'node:child_process';
import { join } from 'node:path';

export default async function globalSetup() {
  const backendCwd = join(__dirname, '..'); // ../backend από το FE
  
  try {
    // Verify PostgreSQL is being used
    const dbDriver = execSync("php artisan tinker --execute=\"echo config('database.default');\" --env=testing", {
      cwd: backendCwd,
      env: { ...process.env, APP_ENV: 'testing' }
    }).toString().trim();
    
    console.log('🔍 DB Driver:', dbDriver);
    
    // Allow pgsql or sqlite in test environment
    const allowedDrivers = new Set(['pgsql', 'sqlite']);
    if (!allowedDrivers.has(String(dbDriver))) {
      throw new Error(`❌ Unsupported DB driver for E2E: ${dbDriver}. Allowed: pgsql, sqlite`);
    }

    console.log(`✅ Database driver confirmed for testing environment: ${dbDriver}`);
    
    // Run migrations and seeding
    execSync('php artisan migrate:fresh --seed --env=testing', {
      cwd: backendCwd, stdio: 'inherit'
    });
    
    // Run E2E-specific seeds for deterministic test data
    execSync('php artisan db:seed --class=E2ESeeder --env=testing', {
      cwd: backendCwd, stdio: 'inherit'
    });
    
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error('❌ Global setup failed:', errorMessage);
    throw e;
  }
}
