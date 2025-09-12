# Testing Guide - Project Dixis

## Unit Testing with Vitest & MSW

### API Testing Patterns
Unit tests use **MSW (Mock Service Worker)** for API mocking with realistic response patterns. See `tests/unit/checkout-api-extended.spec.ts` for comprehensive examples including retry logic, Greek postal codes, and network resilience scenarios.

## E2E Testing with Playwright

### Prerequisites
```bash
# Ensure backend is running on port 8001
cd backend && php artisan serve --host=127.0.0.1 --port=8001

# Ensure frontend is running on port 3001  
cd backend/frontend && NEXT_PUBLIC_API_BASE_URL="http://127.0.0.1:8001/api/v1" npm run dev -- -p 3001
```

### Test Suites

#### Analytics & Observability Tests
**Test File**: `tests/e2e/analytics-observability.spec.ts`  
**Coverage**: 7 comprehensive scenarios testing analytics tracking and error boundary functionality

**Run Analytics Tests Only:**
```bash
npm run test:e2e:analytics
```

**Test Scenarios:**
1. **Page View Analytics**: Automatic tracking verification
2. **Error Boundary Display**: User-friendly error page with recovery options
3. **Analytics Events Viewer**: Real-time event display and management  
4. **Add to Cart Tracking**: Product interaction analytics
5. **React Error Catching**: Component-level error boundary functionality
6. **Event Download**: JSON export functionality
7. **Console Error Logging**: Error tracking and analytics integration

**Expected Results**: 7/7 PASS ✅

**Evidence Artifacts Generated:**
- `test-results/analytics-page-views.png`
- `test-results/error-boundary-active.png`
- `test-results/error-boundary-recovery.png`
- `test-results/analytics-events-display.png`
- `test-results/add-to-cart-tracked.png`
- `test-results/react-component-error-caught.png`
- `test-results/analytics-download-triggered.png`
- `playwright-report/` (HTML report)

#### All E2E Tests
```bash
npm run test:e2e
```

#### Interactive Testing
```bash
# Run with UI mode for debugging
npm run test:e2e:ui

# Run with debug mode for step-by-step execution
npm run e2e:debug
```

### Test Configuration

#### Environment Variables
- `PLAYWRIGHT_BASE_URL`: Frontend URL (default: http://localhost:3001)
- `NEXT_PUBLIC_API_BASE_URL`: Backend API URL (default: http://127.0.0.1:8001/api/v1)

#### Browsers Tested
- Chromium (primary)
- Firefox
- WebKit (Safari)

### Troubleshooting

#### Common Issues
1. **Port Conflicts**: Ensure ports 3001 and 8001 are available
2. **Database Issues**: Run `php artisan migrate:fresh --seed` before testing
3. **Test Failures**: Check that both frontend and backend servers are running

#### Debugging Failed Tests
```bash
# View HTML report
npx playwright show-report

# Run specific test with debug
npx playwright test tests/e2e/analytics-observability.spec.ts --debug

# Run with trace
npx playwright test --trace on
```

### Analytics Testing Details

The analytics system tracks:
- **Page Views**: Automatic tracking on route changes
- **User Interactions**: Add to cart, checkout start, order complete
- **Error Events**: Error boundary triggers with full context
- **User Sessions**: Session management with localStorage persistence

**Testing Strategy:**
- Real browser interaction simulation
- Local storage verification
- UI state validation
- Error boundary trigger and recovery testing
- Event data structure validation

**Test Data Management:**
- Each test starts with clean analytics state
- Events are cleared between test scenarios
- Global `window.__ANALYTICS` exposure for verification

### Continuous Integration

Tests run automatically in CI/CD pipeline with:
- Artifact retention on failure (3 days)
- Video recording for debugging
- Screenshot capture on test failure
- HTML report generation