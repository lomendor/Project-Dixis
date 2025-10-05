# Dixis — Phone-first OTP (Pass 102)

## Overview
Phone-first authentication with OTP for producer onboarding. Dev-only OTP implementation with rate limiting and session management.

## User Flow
1. **`/join`** → Enter phone number → `/api/auth/request-otp`
2. **`/join/verify`** → Enter 6-digit code → `/api/auth/verify-otp` → sets `dixis_session` cookie
3. **`/my`** → `/api/auth/me` (server) → displays phone number. Logout via `/api/auth/logout`

## Development

### Environment Variables
```bash
# Dev bypass code (always accepted in non-production)
OTP_BYPASS="000000"

# Echo code in response for easy QA (DO NOT use in production)
OTP_DEV_ECHO="1"
```

### Testing
```bash
# Run OTP flow tests
BASIC_AUTH="admin:password" OTP_BYPASS="000000" pnpm test tests/auth
```

## Security

### Rate Limiting
- **1 request per 60 seconds** per phone number
- **Maximum 5 requests per hour** per phone number

### Session Management
- Sessions stored in database (Prisma)
- **httpOnly** cookies prevent XSS
- **sameSite: lax** prevents CSRF
- **14-day expiration** for sessions
- **5-minute expiration** for OTP codes

### Admin Protection
- Admin routes still protected by BASIC_AUTH middleware
- Auth cookies are httpOnly/lax
- No client-side secrets exposed

## API Routes

### POST /api/auth/request-otp
**Request**:
```json
{ "phone": "+306912345678" }
```

**Response** (success):
```json
{
  "ok": true,
  "phone": "+306912345678",
  "devCode": "123456"  // Only if OTP_DEV_ECHO=1 in dev
}
```

**Errors**:
- `400`: Invalid phone number
- `429`: Rate limit exceeded (1/min or 5/hour)

### POST /api/auth/verify-otp
**Request**:
```json
{
  "phone": "+306912345678",
  "code": "123456"
}
```

**Response** (success):
```json
{ "ok": true, "phone": "+306912345678" }
```
Sets `dixis_session` cookie.

**Errors**:
- `400`: Invalid data, OTP not found, expired, or wrong code

### GET /api/auth/me
Returns current session info.

**Response** (authenticated):
```json
{
  "authenticated": true,
  "phone": "+306912345678"
}
```

**Response** (not authenticated):
```json
{ "authenticated": false }
```

### POST /api/auth/logout
Deletes session and clears cookie.

**Response**:
```json
{ "ok": true }
```

## Database Schema

### OtpRequest
```prisma
model OtpRequest {
  id        String   @id @default(cuid())
  phone     String
  code      String
  expiresAt DateTime
  attempts  Int      @default(0)
  createdAt DateTime @default(now())
  @@index([phone])
}
```

### Session
```prisma
model Session {
  id        String   @id @default(cuid())
  phone     String
  expiresAt DateTime
  createdAt DateTime @default(now())
  @@index([phone])
}
```

## Phone Number Normalization
The system automatically normalizes phone numbers:
- Removes spaces
- Adds `+` prefix if missing
- Converts `00` prefix to `+`
- Greek mobile numbers starting with `0` → `+30`

Examples:
- `6912345678` → `+306912345678`
- `0030 691 234 5678` → `+306912345678`
- `+30 691 234 5678` → `+306912345678`

## Production Considerations

⚠️ **This is a dev-only implementation**. For production:
1. Remove `OTP_BYPASS` and `OTP_DEV_ECHO`
2. Integrate real SMS provider (Twilio, AWS SNS, etc.)
3. Add additional security measures (device fingerprinting, etc.)
4. Implement account recovery flow
5. Add CAPTCHA for rate limit protection
6. Monitor for abuse patterns
