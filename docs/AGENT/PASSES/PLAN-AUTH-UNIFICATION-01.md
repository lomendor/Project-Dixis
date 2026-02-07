# PLAN: AUTH-UNIFICATION-01

**Date**: 2026-02-07
**Status**: PLANNING → READY FOR IMPLEMENTATION
**Priority**: 🔴 CRITICAL (Producer auth broken)

---

## Objective

Unify authentication system to single source of truth:
- All users identified by **phone number**
- Single login flow (OTP-based)
- Role extension (Consumer → Admin/Producer)

---

## Phase 1: Fix Producer Auth (CRITICAL)

### 1.1 Schema Update

**File**: `frontend/prisma/schema.prisma`

```prisma
model Producer {
  // ... existing fields ...

  // ADD: Link to Consumer for unified identity
  consumerId  String?   @unique
  consumer    Consumer? @relation(fields: [consumerId], references: [id])

  // ADD: Phone for direct lookup (optional, synced from Consumer)
  phone       String?   @unique
}

model Consumer {
  // ... existing fields ...

  // ADD: Relation to Producer (one consumer can be one producer)
  producer    Producer?
}
```

### 1.2 Update requireProducer Guard

**File**: `frontend/src/lib/auth/requireProducer.ts`

```typescript
export async function requireProducer(): Promise<ProducerSession> {
  const phone = await getSessionPhone();
  if (!phone) throw new ProducerError('NOT_AUTHENTICATED');

  // Try multiple lookup strategies
  let producer = await prisma.producer.findFirst({
    where: {
      OR: [
        { phone },
        { consumer: { phone } }
      ],
      isActive: true,
      approvalStatus: 'approved'
    }
  });

  if (!producer) throw new ProducerError('NOT_PRODUCER');

  return { id: producer.id, phone, name: producer.name };
}
```

### 1.3 Create Producer Onboarding API

**File**: `frontend/src/app/api/producers/onboard/route.ts`

```typescript
// POST /api/producers/onboard
// Creates Producer linked to current Consumer session
export async function POST(req: Request) {
  const phone = await getSessionPhone();
  if (!phone) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  // Find or create Consumer
  const consumer = await prisma.consumer.upsert({
    where: { phone },
    update: {},
    create: { phone }
  });

  // Check if already producer
  const existingProducer = await prisma.producer.findFirst({
    where: { consumerId: consumer.id }
  });
  if (existingProducer) {
    return NextResponse.json({ error: 'Already registered as producer' }, { status: 409 });
  }

  // Create producer
  const data = await req.json();
  const producer = await prisma.producer.create({
    data: {
      consumerId: consumer.id,
      phone: consumer.phone,
      name: data.businessName,
      slug: slugify(data.businessName),
      region: data.region,
      category: data.category,
      description: data.description,
      approvalStatus: 'pending'
    }
  });

  return NextResponse.json({ success: true, producer });
}
```

### 1.4 Create Producer Join Page

**File**: `frontend/src/app/producers/join/page.tsx`

- Form fields: businessName, region, category, description
- Requires authenticated session
- Submits to `/api/producers/onboard`
- Shows success message: "Η αίτησή σας υποβλήθηκε για έγκριση"

---

## Phase 2: Unify Login Flow

### 2.1 Single Login Page with Role Awareness

**File**: `frontend/src/app/auth/login/page.tsx`

```typescript
// Parse ?from= and ?role= params
const from = searchParams.get('from') || '/';
const role = searchParams.get('role'); // 'producer' | 'admin' | null

// After successful OTP verification:
if (role === 'producer') {
  router.push('/producer/dashboard');
} else if (role === 'admin') {
  router.push('/admin');
} else {
  router.push(from);
}
```

### 2.2 Remove Legacy Registration

**Option A (Recommended)**: Convert to phone-based

- Remove email/password fields
- Auto-create Consumer on first OTP login
- Add optional "complete profile" step for name/email

**Option B**: Remove entirely

- Registration happens implicitly on first OTP login
- `/auth/register` redirects to `/auth/login`

### 2.3 Implement Intended Destination

**File**: `frontend/src/contexts/AuthContext.tsx`

```typescript
// Add state
const [intendedDestination, setIntendedDestination] = useState<string | null>(null);

// Implement methods
const setIntendedDestination = (dest: string) => {
  sessionStorage.setItem('auth_intended', dest);
};

const getIntendedDestination = () => {
  return sessionStorage.getItem('auth_intended');
};

const clearIntendedDestination = () => {
  sessionStorage.removeItem('auth_intended');
};
```

---

## Phase 3: Clean Up

### 3.1 Consolidate Login Pages

| Keep | Remove/Redirect |
|------|-----------------|
| `/auth/login` | - |
| `/auth/admin-login` | Keep for explicit admin access |
| `/producers/login` | Redirect to `/auth/login?role=producer` |

### 3.2 Update Protected Routes

All protected pages should use `<AuthGuard>`:

```tsx
// /producer/dashboard
<AuthGuard requireAuth requireRole="producer" redirectTo="/auth/login?role=producer">
  <ProducerDashboard />
</AuthGuard>
```

### 3.3 Documentation

- Update `CLAUDE.md` with auth architecture
- Add auth flow to `docs/ARCHITECTURE.md`
- Update `AGENT-STATE.md` with completed pass

---

## Implementation Order

```
Day 1:
  ☐ 1.1 Schema update + migrate
  ☐ 1.2 Update requireProducer
  ☐ Deploy + verify admin still works

Day 2:
  ☐ 1.3 Producer onboard API
  ☐ 1.4 Producer join page
  ☐ Test full producer flow

Day 3:
  ☐ 2.1 Login page role awareness
  ☐ 2.2 Remove/convert registration
  ☐ 2.3 Intended destination

Day 4:
  ☐ 3.1-3.3 Cleanup + documentation
  ☐ Full E2E testing
```

---

## Success Criteria

| Test | Expected Result |
|------|-----------------|
| Admin login | ✅ /admin accessible |
| Consumer login | ✅ Home page, cart works |
| Producer onboard | ✅ New producer created (pending) |
| Producer login | ✅ /producer/dashboard accessible (if approved) |
| Pending producer | ⚠️ Shows "awaiting approval" message |
| Unapproved producer | 🚫 Cannot access dashboard |

---

## Rollback Plan

If issues arise:
1. Schema changes are additive (no data loss)
2. `requireProducer()` changes are backward compatible
3. Can revert to previous git commit

---

## Files Changed Summary

| File | Change Type |
|------|-------------|
| `prisma/schema.prisma` | ADD fields |
| `src/lib/auth/requireProducer.ts` | UPDATE logic |
| `src/app/api/producers/onboard/route.ts` | NEW |
| `src/app/producers/join/page.tsx` | REWRITE |
| `src/app/auth/login/page.tsx` | UPDATE |
| `src/contexts/AuthContext.tsx` | ADD methods |
| `src/app/auth/register/page.tsx` | REMOVE/CONVERT |

---

**Ready for implementation. Proceed?**
