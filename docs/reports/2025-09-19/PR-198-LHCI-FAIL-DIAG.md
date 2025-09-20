# PR #198 — Lighthouse Failure Diagnostics
Run: https://github.com/lomendor/Project-Dixis/actions/runs/17855213201/job/50772641429

## Analysis
- ✅ Mock API starts successfully and binds to port 3200
- ✅ Next.js server starts successfully on port 3100
- ✅ "Wait for services" step passes (major improvement)
- ❌ Lighthouse CI fails because it runs on wrong URL

## Root Cause
LHCI is starting its own server on port 42605 instead of using the existing Next.js server on port 3100. The mock API setup is working correctly, but LHCI configuration needs adjustment.

## Key Log Excerpts

### Success - Mock API Working
```
🚀 LHCI Mock API running on port 3200
   Health: http://localhost:3200/api/v1/health
```

### Success - Next.js Working
```
▲ Next.js 15.5.0
- Local:        http://localhost:3100
- Network:      http://10.1.1.118:3100
✓ Starting...
```

### Problem - LHCI Uses Wrong URL
```
Started a web server on port 42605...
Running Lighthouse 1 time(s) on http://localhost:42605/
```

### Failure Details
```
"runtimeError": {
  "code": "ERRORED_DOCUMENT_REQUEST",
  "message": "Lighthouse was unable to reliably load the page you requested. Make sure you are testing the correct URL and that the server is properly responding to all requests. (Status code: 404)"
}
```

## Suggested Fix
The issue is that LHCI is configured to start its own server instead of using the existing Next.js server. Need to update the lighthouse workflow:

1. Change LHCI command to use correct URL:
   ```yaml
   lhci autorun --collect.url=http://localhost:3100 --collect.startServerCommand="echo 'already started'"
   ```

2. Or add LHCI configuration file to specify the correct URL

## Status
- Mock API implementation: ✅ COMPLETE
- Service startup fixes: ✅ COMPLETE
- LHCI URL configuration: ❌ NEEDS FIX

The core infrastructure work is done - this is just a configuration issue.