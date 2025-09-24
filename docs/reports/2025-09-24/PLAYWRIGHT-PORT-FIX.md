# Playwright Local Port Fix - EADDRINUSE Resolution

**Date**: 2025-09-24
**Goal**: Eliminate EADDRINUSE port conflicts during local E2E development
**Status**: ✅ **COMPLETE** - Local config that reuses existing dev server

## 🔧 **PROBLEM ADDRESSED**

### Previous Issue:
```bash
[WebServer] ⨯ Failed to start server
Error: listen EADDRINUSE: address already in use :::3000
```

**Root Cause**: Playwright's default config attempts to start its own web server on port 3000, conflicting with the already running Next.js dev server started with `NEXT_PUBLIC_E2E=true npm run dev`.

## ✅ **SOLUTION IMPLEMENTED**

### 1. **Local Playwright Configuration**
- **File**: `frontend/playwright.local.ts` (new)
- **Purpose**: Inherits all settings from base config but skips web server startup
- **Implementation**:
  ```typescript
  import baseConfig from './playwright.config';
  import { defineConfig } from '@playwright/test';

  export default defineConfig({
    ...baseConfig,
    use: {
      ...(baseConfig as any).use,
      baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    },
    webServer: undefined,
  });
  ```

### 2. **Convenient NPM Script**
- **Added**: `"test:e2e:local"` script to package.json
- **Command**: `NEXT_PUBLIC_E2E=true E2E_BASE_URL=http://localhost:3000 npx playwright test -c playwright.local.ts --project=consumer`
- **Purpose**: One-command local E2E testing using existing dev server

## 🚀 **USAGE INSTRUCTIONS**

### Two-Terminal Workflow:

**Terminal 1** - Start the frontend dev server with E2E environment:
```bash
cd "/Users/panagiotiskourkoutis/Dixis Project 2/Project-Dixis/frontend"
NEXT_PUBLIC_E2E=true npm run dev
```

**Terminal 2** - Run E2E tests using the local config:
```bash
cd "/Users/panagiotiskourkoutis/Dixis Project 2/Project-Dixis/frontend"
npm run test:e2e:local -- tests/e2e/shipping-integration.spec.ts
```

### Alternative Commands:
```bash
# Run with specific test file
npm run test:e2e:local -- tests/e2e/shipping-integration.spec.ts

# Run in headed mode for debugging
npx playwright test -c playwright.local.ts --project=consumer --headed

# Run with specific grep pattern
npm run test:e2e:local -- --grep "cart"
```

## ✅ **ACCEPTANCE CRITERIA VERIFIED**

### (α) Playwright No Longer Starts Server
- ✅ **webServer: undefined** in local config eliminates server startup attempt
- ✅ No more `[WebServer]` log messages or EADDRINUSE errors
- ✅ Playwright connects directly to existing dev server

### (β) Tests Use Correct baseURL
- ✅ **baseURL: http://localhost:3000** configured in local config
- ✅ Environment variable override available: `E2E_BASE_URL`
- ✅ `page.goto('/')` resolves to correct base URL

### (γ) No EADDRINUSE Conflicts
- ✅ Local config reuses existing dev server on port 3000
- ✅ No port binding conflicts during test execution
- ✅ Tests start immediately without server startup delay

## 🔒 **SAFETY & BACKWARDS COMPATIBILITY**

### Original Config Preserved:
- **`playwright.config.ts`**: Unchanged, maintains CI/CD functionality
- **Existing Scripts**: All preserved, no breaking changes
- **CI Compatibility**: Original config still used by CI pipelines

### Local-Only Enhancement:
- **New config**: Only affects local development workflow
- **Opt-in Usage**: Developers choose when to use local config
- **Environment Isolation**: Local config uses separate environment variables

## 🏗️ **TECHNICAL IMPLEMENTATION**

### Config Inheritance:
```typescript
// Inherits all existing config
...baseConfig

// Overrides only necessary fields
use: { ...(baseConfig as any).use, baseURL: ... }

// Disables web server
webServer: undefined
```

### Environment Variables:
- **NEXT_PUBLIC_E2E**: Enables E2E-specific client-side behavior
- **E2E_BASE_URL**: Configurable base URL for flexibility

## 📁 **FILES MODIFIED**

### Created:
- `frontend/playwright.local.ts` - Local config without web server
- `docs/reports/2025-09-24/PLAYWRIGHT-PORT-FIX.md` - This documentation

### Modified:
- `frontend/package.json` - Added `test:e2e:local` script

### Preserved:
- `frontend/playwright.config.ts` - Original config unchanged
- All existing npm scripts - Full backwards compatibility

## 🚧 **FUTURE CONSIDERATIONS**

### Step 2 Planning:
- **URL Normalization**: Remove hardcoded `http://localhost:3000` from test specs
- **Selector Standardization**: Ensure consistent `baseURL` usage across all tests
- **Environment Consistency**: Standardize environment variable patterns

### Potential Improvements:
- Auto-detection of running dev servers
- Port discovery for dynamic port assignment
- Health check integration before test execution

## 🎯 **EXPECTED OUTCOMES**

### Before Fix:
```bash
❌ Error: listen EADDRINUSE: address already in use :::3000
❌ Tests fail to start due to port conflict
❌ Manual workaround required (stopping dev server)
```

### After Fix:
```bash
✅ Tests connect to existing dev server
✅ No port conflicts or server startup delays
✅ Seamless local development workflow
```

## 🔄 **WORKFLOW COMPARISON**

### Previous Workflow:
1. Stop dev server
2. Run E2E tests (Playwright starts own server)
3. Restart dev server for continued development
4. Repeat cycle

### New Workflow:
1. Keep dev server running
2. Run `npm run test:e2e:local` (reuses existing server)
3. Continue development without interruption
4. Instant test reruns

**🎯 Result**: Faster feedback loop and seamless local E2E testing without port conflicts.