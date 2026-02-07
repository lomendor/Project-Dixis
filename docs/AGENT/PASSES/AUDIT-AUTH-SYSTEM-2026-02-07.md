# Authentication System Audit Report - Project Dixis

**Date**: 2026-02-07
**Branch**: `docs/admin-shipping-deployed`
**Status**: AUDIT COMPLETE → ACTION REQUIRED

---

## Executive Summary

Ο authentication system έχει **3 user types** (Admin, Consumer, Producer) με **hybrid auth methods**:
- ✅ **Admin**: OTP-based, fully working
- ⚠️ **Consumer**: OTP-based (νέο), legacy email/password (broken)
- ❌ **Producer**: BROKEN - schema missing phone field

---

## 1. Current Architecture

### User Types & Database Tables

| User Type | Prisma Model | Auth Method | Status |
|-----------|--------------|-------------|--------|
| Admin | `AdminUser` | Phone OTP | ✅ Working |
| Consumer | `Consumer` | Phone OTP | ✅ Working |
| Producer | `Producer` | Phone OTP | ❌ BROKEN |

### Database Schema Reality

```prisma
// ✅ AdminUser - Complete
model AdminUser {
  id        String   @id @default(cuid())
  phone     String   @unique  // ✅ Has phone
  email     String?
  role      String   @default("admin")
  isActive  Boolean  @default(true)
}

// ✅ Consumer - Complete
model Consumer {
  id        String   @id @default(cuid())
  phone     String   @unique  // ✅ Has phone
  name      String?
  email     String?  @unique
  isActive  Boolean  @default(true)
}

// ❌ Producer - MISSING phone field!
model Producer {
  id              String    @id @default(cuid())
  slug            String    @unique
  name            String
  // ❌ NO phone field → requireProducer() FAILS
  email           String?   // Only email, not phone
  phone           String?   // DOES NOT EXIST in current schema!
}
```

---

## 2. Login Pages Inventory

| Path | Target User | Method | Status |
|------|-------------|--------|--------|
| `/auth/login` | Consumer | Phone + OTP | ✅ Working |
| `/auth/admin-login` | Admin | Phone + OTP | ✅ Working |
| `/producers/login` | Producer | Redirect → `/auth/login` | ❌ BROKEN |

### Problem with Producer Login

```typescript
// /producers/login/page.tsx - Current behavior
redirect('/auth/login?role=producer')  // Role param IGNORED!

// After OTP verification:
// - Producer logs in as "user" type
// - Redirects to / instead of /producer/dashboard
// - requireProducer() fails because Producer.phone doesn't exist
```

---

## 3. Registration Pages Inventory

| Path | Target User | Fields | Backend | Status |
|------|-------------|--------|---------|--------|
| `/auth/register` | Consumer | email, password, name | Laravel | ⚠️ Legacy |
| `/producers/join` | Producer | Redirects to waitlist | None | ⚠️ Not functional |

### Mismatch Problem

```
LOGIN:     Phone + OTP → Consumer table (phone-based)
REGISTER:  Email + Password → Laravel users table (email-based)
                              ↓
                        INCOMPATIBLE!
```

---

## 4. API Routes

### Authentication APIs

| Route | Method | Purpose | Status |
|-------|--------|---------|--------|
| `/api/auth/request-otp` | POST | Generate OTP | ✅ Working |
| `/api/auth/verify-otp` | POST | Verify OTP, create JWT | ✅ Working |
| `/api/auth/me` | GET | Check session | ✅ Working |
| `/api/auth/logout` | GET/POST | Clear session | ✅ Working |

### Protected APIs (Guards)

| Route Pattern | Guard | Status |
|---------------|-------|--------|
| `/api/admin/*` | `requireAdmin()` | ✅ Working |
| `/api/producer/*` | `requireProducer()` | ❌ BROKEN |

---

## 5. Critical Issues (Action Required)

### 🔴 ISSUE #1: Producer Auth Completely Broken

**Root Cause**: `Producer` model missing `phone` field

**Impact**:
- `/producer/dashboard` → 403 Error
- `/producer/orders` → 403 Error
- `/producer/products` → 403 Error
- `/producer/settings` → 403 Error

**Error Message**: "Δεν έχετε ολοκληρώσει το προφίλ παραγωγού"

**Fix Required**:
```prisma
model Producer {
  // ADD:
  phone     String?   @unique
  userId    String?   // Optional: link to Consumer for unified auth
}
```

---

### 🔴 ISSUE #2: No Producer Onboarding Flow

**Current State**:
- `/producers/join` → Redirects to `/producers/waitlist`
- No way to create Producer account
- No link between Consumer and Producer

**Expected Flow**:
1. User registers as Consumer (phone OTP)
2. User clicks "Become a Producer"
3. Fill producer profile → Create Producer linked to Consumer
4. Admin approves → Producer dashboard accessible

---

### 🟡 ISSUE #3: Legacy Registration Still Uses Laravel

**Current**: `/auth/register` → Laravel backend (email/password)
**Problem**: Creates user in Laravel `users` table that doesn't exist in Neon DB

**Fix Options**:
- A) Remove registration entirely (OTP auto-creates accounts)
- B) Convert to phone-based registration
- C) Link registration to Consumer table

---

### 🟡 ISSUE #4: Intended Destination Not Implemented

```typescript
// AuthContext interface defines:
setIntendedDestination?: (destination: string) => void;
getIntendedDestination?: () => string | null;

// But NOT IMPLEMENTED in value object!
```

---

## 6. Recommended Architecture

### Single Source of Truth: Phone-based Identity

```
┌─────────────────────────────────────────────────────────────┐
│                     UNIFIED AUTH MODEL                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Consumer (base identity)                                   │
│   ├── phone (unique, required)                              │
│   ├── name, email                                           │
│   ├── isActive                                              │
│   │                                                          │
│   ├── AdminUser (optional extension)                        │
│   │   └── role: admin | super_admin                         │
│   │                                                          │
│   └── Producer (optional extension)                         │
│       ├── slug, businessName, region                        │
│       ├── approvalStatus                                    │
│       └── products[]                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Unified Flow

```
1. Login/Register (any user type):
   Phone → OTP → Consumer record created → JWT session

2. Become Admin:
   Consumer exists → Add to AdminUser table → role: admin in JWT

3. Become Producer:
   Consumer exists → Create Producer with consumerId → approvalStatus: pending
   Admin approves → Producer can access dashboard
```

---

## 7. Action Items

### Phase 1: Fix Producer Auth (Critical)

1. **Add phone field to Producer schema**
   ```prisma
   model Producer {
     phone     String?  @unique
     // or link to Consumer:
     consumerId String? @unique
     consumer   Consumer? @relation(fields: [consumerId], references: [id])
   }
   ```

2. **Update requireProducer() guard**
   - Support both phone-based and consumerId-based lookup

3. **Create producer onboarding flow**
   - `/producers/join` → Actual form
   - Link to existing Consumer account

### Phase 2: Unify Auth System (Important)

1. **Remove legacy Laravel auth dependencies**
   - Delete or disable `/auth/register` email/password form
   - All auth through OTP

2. **Implement intended destination**
   - Store in sessionStorage
   - Redirect after login

3. **Consolidate login pages**
   - Single `/auth/login` with role detection
   - `/auth/admin-login` kept for explicit admin access

### Phase 3: Documentation (Maintenance)

1. **Update CLAUDE.md with auth architecture**
2. **Create auth flow diagrams**
3. **Document all protected routes**

---

## 8. Files to Modify

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add phone/consumerId to Producer |
| `src/lib/auth/requireProducer.ts` | Support new lookup method |
| `src/app/producers/join/page.tsx` | Real onboarding form |
| `src/app/auth/login/page.tsx` | Role-aware redirect |
| `src/contexts/AuthContext.tsx` | Implement intended destination |
| `src/app/auth/register/page.tsx` | Convert to phone-based or remove |

---

## Appendix: Session Token Structure

```typescript
// JWT Payload
{
  phone: "+306979195028",
  type: "admin" | "user",
  iat: 1707307200,        // Issued at
  exp: 1707393600,        // Expires (24h admin, 7d user)
  iss: "dixis-auth",
  sub: "+306979195028"    // Subject = phone
}

// Cookie
Name: session (not dixis_session as sometimes referenced)
HttpOnly: true
SameSite: lax
Secure: true (production)
MaxAge: 86400 (admin) | 604800 (user)
```

---

**Next Step**: Implement Phase 1 to fix producer authentication.
