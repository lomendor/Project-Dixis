# Ports Discipline

## Canonical Dev Port: :3001

**Rule**: The frontend development server **always** runs on port **3001**.

## Port Management Scripts

### Stop Port `:3001`
```bash
npm run dev:stop
# or directly:
bash scripts/dev/stop-port.sh 3001
```

Kills any process listening on port 3001 to prevent "port already in use" errors.

### Start Dev Server
```bash
npm run dev:start
```

Starts Next.js dev server explicitly on port 3001.

### Restart Dev Server
```bash
npm run dev:restart
```

Stops any existing process on :3001, then starts fresh.

## Playwright Integration

Playwright config uses `reuseExistingServer: true` for local development, which means:
- **Won't start a second server** if one is already running on :3001
- **Faster test execution** by reusing your dev server
- **No port conflicts** when running tests locally

## Common Issues

### "Port 3001 already in use"
**Solution**: Run `npm run dev:stop` or `npm run dev:restart`

### Multiple dev servers running
**Problem**: Background processes accumulating
**Solution**: Always use `dev:stop` before starting a new session

### Playwright starting second server
**Check**: Verify `reuseExistingServer: true` in `playwright.config.ts` (line 130)

## Environment Variables

- `PORT=3001`: Explicitly set by `dev:start` script
- `PLAYWRIGHT_BASE_URL`: Defaults to `http://127.0.0.1:3001`
- `BASE_URL`: Alternative, also defaults to `:3001`

## CI/CD

- **CI**: Uses port 3001 via `start:ci` script
- **Local**: Uses port 3001 via `dev:start` script
- **Consistency**: Same port across all environments simplifies debugging
