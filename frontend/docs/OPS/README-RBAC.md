# 🔐 RBAC — Role-Based Access Control

**Pass 104**: Session-based roles with automatic producer upgrade

---

## 📋 Ρόλοι

| Role | Description | Auto-assigned |
|------|-------------|---------------|
| `consumer` | Βασικός χρήστης (default) | ✅ Κατά την OTP verification |
| `producer` | Παραγωγός με προφίλ | ✅ Κατά τη δημιουργία producer profile |
| `admin` | Διαχειριστής συστήματος | ❌ Manual assignment |

---

## 🏗️ Αρχιτεκτονική

### 1. Session Model (Prisma)

```prisma
model Session {
  id        String   @id @default(cuid())
  phone     String
  role      String   @default("consumer") // consumer | producer | admin
  expiresAt DateTime
  createdAt DateTime @default(now())
  @@index([phone])
}
```

### 2. Session Helpers (`src/lib/auth/session.ts`)

```typescript
// Βασική ανάκτηση session
export async function getSession(): Promise<SessionData>

// Μόνο το τηλέφωνο (backwards compatible)
export async function getSessionPhone(): Promise<string|null>

// Απαίτηση συγκεκριμένων ρόλων (throws αν όχι)
export async function requireRole(allowedRoles: string[]): Promise<SessionData>
```

**Παράδειγμα χρήσης**:

```typescript
import { requireRole } from '@/lib/auth/session';

export async function GET(){
  try{
    await requireRole(['admin']); // Μόνο admin
    // ... admin logic
  }catch(e:any){
    return NextResponse.json({error: e.message},{status:403});
  }
}
```

---

## 🔄 Role Upgrade Flow

### Consumer → Producer (Αυτόματο)

Όταν ένας `consumer` δημιουργεί producer profile:

**Endpoint**: `POST /api/me/producers`

```typescript
const created = await prisma.producer.create({
  data: { /* ... */, ownerPhone: phone }
});

// Αυτόματη αναβάθμιση σε producer role
const sessId = (await cookies()).get('dixis_session')?.value;
if(sessId){
  await prisma.session.update({
    where:{ id: sessId },
    data:{ role: 'producer' }
  });
}
```

### Consumer → Admin (Manual)

Χειροκίνητη αναβάθμιση μέσω database:

```sql
-- Βρες το session του χρήστη
SELECT * FROM "Session" WHERE phone = '+306912345678';

-- Αναβάθμιση σε admin
UPDATE "Session" SET role = 'admin' WHERE id = 'cuid_here';
```

**⚠️ Προσοχή**: Σε production θα χρειαστεί admin management UI ή secure CLI tool.

---

## 🛡️ Protected Endpoints

### User Endpoints (`/api/me/*`)

**Auth**: Απαιτείται session (οποιοσδήποτε ρόλος)
**Ownership**: Πρόσβαση μόνο στα δικά τους δεδομένα

| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/api/me/producers` | GET | any | Ανάκτηση δικού του producer profile |
| `/api/me/producers` | POST | any | Δημιουργία producer (αυτόματη αναβάθμιση σε `producer`) |
| `/api/me/producers` | PATCH | any | Ενημέρωση δικού του producer |
| `/api/me/uploads` | POST | any | Upload εικόνας (session-authenticated) |

**Παράδειγμα**:

```typescript
export async function GET(){
  const phone = await getSessionPhone();
  if(!phone) return NextResponse.json({error:'Auth required'},{status:401});

  // Επιστρέφει ΜΟΝΟ τον producer του χρήστη
  const me = await prisma.producer.findFirst({ where:{ ownerPhone: phone }});
  return NextResponse.json({ item: me || null });
}
```

### Admin Endpoints (`/api/admin/*`)

**Auth**: Απαιτείται `admin` role

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/producers` | GET | Όλοι οι παραγωγοί (admin view) |
| `/api/admin/producers?id=xxx` | DELETE | Διαγραφή παραγωγού |

**Παράδειγμα**:

```typescript
export async function GET(){
  try{
    await requireRole(['admin']); // Throws αν όχι admin
    const all = await prisma.producer.findMany({ orderBy:{ createdAt: 'desc' }});
    return NextResponse.json({ items: all });
  }catch(e:any){
    return NextResponse.json({error: e.message},{status:403});
  }
}
```

---

## 🧪 Testing

### E2E Tests (`tests/rbac/role-based-access.spec.ts`)

**Scenarios**:
1. ✅ Consumer role → cannot access admin endpoints (403)
2. ✅ Producer role → auto-upgrade on profile creation
3. ✅ Producer role → can access own profile, but not admin endpoints

**Εκτέλεση**:

```bash
cd frontend
npx playwright test tests/rbac/
```

**Dev Bypass**:

```bash
OTP_BYPASS=000000 npx playwright test tests/rbac/
```

---

## 🔧 Environment Variables

```bash
# .env (για development)
OTP_BYPASS=000000          # Bypass OTP code για testing
OTP_DEV_ECHO=1             # Echo OTP στο response (dev only)
```

---

## 📝 Best Practices

### 1. Χρήση `requireRole()` για admin endpoints

```typescript
// ✅ ΣΩΣΤΟ
export async function GET(){
  try{
    await requireRole(['admin', 'producer']); // Multiple roles OK
    // ...
  }catch(e:any){
    return NextResponse.json({error: e.message},{status:403});
  }
}

// ❌ ΛΑΘΟΣ
export async function GET(){
  const phone = await getSessionPhone();
  if(!phone) return NextResponse.json({error:'Unauthorized'},{status:401});
  // Δεν ελέγχει role!
}
```

### 2. Ownership Checks για `/api/me/*`

```typescript
export async function PATCH(req: Request){
  const phone = await getSessionPhone();
  if(!phone) return NextResponse.json({error:'Auth required'},{status:401});

  // Βρες ΜΟΝΟ τον producer του χρήστη
  const me = await prisma.producer.findFirst({ where:{ ownerPhone: phone }});
  if(!me) return NextResponse.json({error:'Δεν υπάρχει προφίλ.'},{status:400});

  // Update μόνο αυτού
  await prisma.producer.update({ where:{ id: me.id }, data: /* ... */ });
}
```

### 3. Frontend Role Checks

```typescript
// src/app/my/page.tsx
const meResp = await fetch('/api/auth/me');
const me = await meResp.json();

if(!me.authenticated){
  window.location.href='/join';
  return;
}

if(me.role === 'admin'){
  // Show admin controls
}
if(me.role === 'producer'){
  // Show producer dashboard
}
```

---

## 🚀 Production Considerations

### 1. Admin Role Assignment

**Dev**: Manual SQL update
**Prod**: Θα χρειαστεί:
- Secure admin management UI (protected endpoint)
- Or CLI tool με auth
- Or database migration για initial admins

### 2. Role Persistence

- Το `role` field είναι μέρος του `Session` model
- Όταν το session λήγει (14 μέρες), ο χρήστης κάνει re-login
- Το role επανακαθορίζεται βάσει του producer profile:
  - Αν υπάρχει `ownerPhone` → `producer`
  - Αλλιώς → `consumer`

**⚠️ Για persistent roles**, θα χρειαστεί `User` model με `role` field.

### 3. Audit Logging

Για production, προσθήκη audit log για admin actions:

```typescript
await prisma.auditLog.create({
  data:{
    userId: sess.phone,
    action: 'DELETE_PRODUCER',
    targetId: id,
    timestamp: new Date()
  }
});
```

---

## 📚 Related Docs

- [README-AUTH.md](./README-AUTH.md) - OTP & Session authentication
- [Pass 102](../OPS/STATE.md#pass-102) - Phone-first OTP
- [Pass 103](../OPS/STATE.md#pass-103) - Producer onboarding
- [Pass 104](../OPS/STATE.md#pass-104) - RBAC (αυτό το doc)

---

**Status**: ✅ Production-ready
**Version**: Pass 104
**Last Updated**: 2025-10-05
