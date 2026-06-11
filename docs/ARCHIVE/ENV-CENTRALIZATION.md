# Environment Centralization (PR-HY-B)

**Objective**: Centralize environment configuration with Greek locale (el-GR) defaults.

## 🎯 Changes Summary

### ✅ Created `frontend/src/env.ts`
- **API Configuration**: Centralized `API_BASE_URL` and `SITE_URL` management
- **Greek Defaults**: `DEFAULT_LOCALE = 'el-GR'` and `DEFAULT_CURRENCY = 'EUR'`
- **Currency Formatting**: `formatCurrency()` helper with Greek locale formatting
- **URL Helpers**: `apiUrl()` function to prevent double slashes
- **Environment Validation**: Runtime validation for required environment variables

### 🌍 Greek Locale Integration
```typescript
// Automatic Greek formatting
export const CURRENCY_FORMATTER = new Intl.NumberFormat('el-GR', {
  style: 'currency',
  currency: 'EUR',
});

// Usage: formatCurrency(12.34) → "12,34 €"
```

### 🔧 Environment Variables
- `NEXT_PUBLIC_API_BASE_URL`: API endpoint (default: `http://127.0.0.1:8001/api/v1`)
- `NEXT_PUBLIC_SITE_URL`: Site URL (default: `https://projectdixis.com`)
- `NODE_ENV`: Environment mode

## 📊 Benefits
1. **Consistency**: Single source of truth for environment configuration
2. **Greek-First**: Built-in Greek locale and EUR currency support
3. **Type Safety**: TypeScript validation and error handling
4. **Development Aid**: Auto-logging in development mode
5. **Clean URLs**: Prevents common API URL joining issues

## 🚀 Usage Examples

### Currency Formatting
```typescript
import { formatCurrency } from '@/env';

// Greek locale formatting
const price = formatCurrency(25.99); // → "25,99 €"
```

### API URL Construction
```typescript
import { apiUrl } from '@/env';

// Clean URL joining
const endpoint = apiUrl('public/products'); // → "http://127.0.0.1:8001/api/v1/public/products"
```

### Environment Checks
```typescript
import { IS_DEVELOPMENT, logEnvironmentConfig } from '@/env';

if (IS_DEVELOPMENT) {
  logEnvironmentConfig(); // Logs configuration in development
}
```

## ✅ Evidence
- **File**: `frontend/src/env.ts` (73 lines)
- **Documentation**: `ENV-CENTRALIZATION.md` (this file)
- **Greek Locale**: Default `el-GR` with EUR formatting
- **Type Safety**: Full TypeScript support with runtime validation

**Generated-by**: Claude Code | **Scope**: Environment centralization + Greek defaults | **LOC**: <300