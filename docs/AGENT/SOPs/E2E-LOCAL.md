# SOP: Running E2E Tests Locally

**Created**: 2026-01-16 (LOCAL-E2E-PORT-01)

## Quick Start

```bash
# 1. Start backend (port 8001)
cd backend && php artisan serve --port=8001

# 2. Start frontend (port 3001) - separate terminal
cd frontend && PORT=3001 pnpm dev -p 3001

# 3. Run E2E smoke tests - separate terminal
cd frontend && E2E_EXTERNAL=1 BASE_URL=http://127.0.0.1:3001 npx playwright test --grep "@smoke"
```

## Required Ports

| Service | Port | Notes |
|---------|------|-------|
| Backend (Laravel) | 8001 | `php artisan serve --port=8001` |
| Frontend (Next.js) | 3001 | `PORT=3001 pnpm dev -p 3001` |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://127.0.0.1:3001` | Frontend URL for Playwright |
| `E2E_EXTERNAL` | unset | Set to `1` to skip webServer auto-start |
| `NEXT_PUBLIC_API_BASE_URL` | `http://127.0.0.1:8001/api/v1` | Backend API URL |

## Common Issues

### "Timeout exceeded" on page.goto
- **Cause**: Frontend not running or not healthy
- **Fix**: Restart frontend with `PORT=3001 pnpm dev -p 3001`

### "AUTH_BOOTSTRAP_FAILED"
- **Cause**: Backend not running or wrong port
- **Fix**: Ensure backend is on port 8001 and responding to `/api/healthz`

### Tests pass in CI but fail locally
- CI uses mock auth via `ci-global-setup.ts`
- Local uses Laravel auth via `global-setup.ts`
- Use `E2E_EXTERNAL=1` to force CI-style mock auth locally
