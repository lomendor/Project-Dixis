# TL;DR — Pass 173F (Order API + Resend Email)

**Goal**: Create GET /api/orders/[id] endpoint + wire resend email with EL-first template
**Status**: ✅ Complete
**LOC**: ~200 (API ~50, template ~80, E2E ~70)

---

## Overview

Pass 173F implements:
- GET `/api/orders/[id]` endpoint returning order data structure
- Email template for order status updates (Greek-first)
- Enhanced resend email endpoint with proper template integration
- E2E tests for API endpoints
- Zero database schema changes

---

## Files Created

### API Routes
- `frontend/src/app/api/orders/[id]/route.ts` (~50 lines)
  - GET endpoint for order data
  - Returns: id, status, subtotal, computedShipping, computedTotal
  - 404 handling for non-existent orders

- `frontend/src/app/api/orders/[id]/resend/route.ts` (~45 lines)
  - POST endpoint for resending order status emails
  - Integrates with orderStatus email template
  - Safe fallback to logging when SMTP not configured

### Email Templates
- `frontend/src/lib/mail/templates/orderStatus.ts` (~80 lines)
  - Greek-first email template for order status updates
  - Subject line generation with status labels
  - HTML email with status descriptions

### E2E Tests
- `frontend/tests/order/order-api-resend.spec.ts` (~70 lines)
  - Test 1: GET returns correct data structure
  - Test 2: POST resend returns 200
  - Test 3: GET returns 404 for non-existent orders

### Documentation
- `docs/AGENT/SUMMARY/Pass-173F.md` - This file

---

## GET /api/orders/[id] Implementation

### Response Structure
```typescript
{
  id: string;
  status: string;
  subtotal: number;
  computedShipping: number;
  computedTotal: number;
}
```

### Implementation
```typescript
export async function GET(_req: NextRequest, { params }: Props) {
  const { id } = params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true }
  });

  if (!order) {
    return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 });
  }

  // Calculate subtotal from items
  const subtotal = order.items.reduce(
    (sum, item) => sum + Number(item.priceSnap || 0) * Number(item.qty || 0),
    0
  );

  // Computed shipping (placeholder for now)
  const computedShipping = 0;

  // Computed total
  const computedTotal = Number(order.total || 0) || subtotal + computedShipping;

  return NextResponse.json({
    id: order.id,
    status: order.status || 'PENDING',
    subtotal: Number(subtotal.toFixed(2)),
    computedShipping: Number(computedShipping.toFixed(2)),
    computedTotal: Number(computedTotal.toFixed(2))
  });
}
```

---

## Order Status Email Template

### Subject Line
```typescript
export function subject(orderId: string, status: string): string {
  const statusLabels: Record<string, string> = {
    PENDING: 'Εκκρεμής',
    PAID: 'Πληρώθηκε',
    PACKING: 'Συσκευασία',
    SHIPPED: 'Απεστάλη',
    DELIVERED: 'Παραδόθηκε',
    CANCELLED: 'Ακυρώθηκε'
  };

  const label = statusLabels[status] || status;
  return `Ενημέρωση Παραγγελίας ${orderId}: ${label}`;
}
```

### Email Content Features
- Greek-first design
- Status-specific descriptions
- Link to order confirmation page
- Professional styling
- Mobile-responsive HTML

### Status Descriptions (Greek)
```typescript
{
  PENDING: 'Η παραγγελία σας έχει ληφθεί και αναμένει επιβεβαίωση.',
  PAID: 'Η πληρωμή σας έχει επιβεβαιωθεί.',
  PACKING: 'Η παραγγελία σας βρίσκεται σε συσκευασία.',
  SHIPPED: 'Η παραγγελία σας έχει αποσταλεί και βρίσκεται καθ\' οδόν.',
  DELIVERED: 'Η παραγγελία σας έχει παραδοθεί επιτυχώς.',
  CANCELLED: 'Η παραγγελία σας έχει ακυρωθεί.'
}
```

---

## Resend Email Endpoint

### Implementation
```typescript
export async function POST(_req: NextRequest, { params }: Props) {
  const { id } = params;

  const order = await prisma.order.findUnique({
    where: { id },
    select: { id: true, status: true, buyerName: true, total: true }
  });

  if (!order) {
    return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 });
  }

  const status = String(order.status || 'PENDING');
  const to = process.env.DEV_MAIL_TO || '';

  // Try to send email
  let delivered = false;
  if (to) {
    try {
      await sendMailSafe({
        to,
        subject: statusSubject(id, status),
        html: statusHtml({ id, status })
      });
      delivered = true;
    } catch (e) {
      console.warn('[resend] sendMailSafe failed:', (e as Error).message);
    }
  }

  return NextResponse.json({ ok: true, id, delivered });
}
```

### Response Format
```json
{
  "ok": true,
  "id": "order-id",
  "delivered": true
}
```

---

## E2E Test Scenarios

### Test 1: GET Endpoint Structure
```typescript
test('GET /api/orders/[id] επιστρέφει id/status/subtotal/computed*', async ({ request }) => {
  // Create order via checkout
  const ord = await request.post(base + '/api/checkout', { /* ... */ });
  const id = (await ord.json()).orderId;

  // Get order data
  const r = await request.get(base + `/api/orders/${id}`);
  expect(r.status()).toBe(200);

  const data = await r.json();
  expect(data.id).toBe(id);
  expect(typeof data.status).toBe('string');
  expect(typeof data.subtotal).toBe('number');
  expect(typeof data.computedShipping).toBe('number');
  expect(typeof data.computedTotal).toBe('number');
  expect(data.subtotal).toBeGreaterThan(0);
});
```

### Test 2: Resend Email
```typescript
test('POST /api/orders/[id]/resend επιστρέφει 200', async ({ request }) => {
  // Create order
  const ord = await request.post(base + '/api/checkout', { /* ... */ });
  const id = (await ord.json()).orderId;

  // Resend email
  const r = await request.post(base + `/api/orders/${id}/resend`);
  expect([200, 204]).toContain(r.status());

  const data = await r.json();
  expect(data.ok).toBe(true);
  expect(data.id).toBe(id);
});
```

### Test 3: 404 Handling
```typescript
test('GET /api/orders/[id] επιστρέφει 404 για μη υπάρκον order', async ({ request }) => {
  const r = await request.get(base + `/api/orders/fake-order-id-12345`);
  expect(r.status()).toBe(404);

  const data = await r.json();
  expect(data.ok).toBe(false);
});
```

---

## Design Decisions

### 1. Computed vs Stored Values
**Decision**: Calculate subtotal from items, use stored total
**Rationale**:
- Items have snapshot prices (priceSnap) for historical accuracy
- Stored total is source of truth for completed orders
- Computed shipping placeholder for future integration

### 2. Greek-First Email Template
**Decision**: All email content in Greek
**Rationale**:
- Consistent with project i18n policy
- Target audience is Greek consumers
- Status descriptions tailored to Greek UX expectations

### 3. Safe Email Fallback
**Decision**: Log instead of throwing when SMTP unavailable
**Rationale**:
- Dev environments often lack SMTP
- API should succeed even if email fails
- Returned `delivered` flag indicates email status

### 4. Status Label Mapping
**Decision**: Map DB status codes to Greek labels
**Rationale**:
- DB stores enum codes (PENDING, PAID, etc.)
- UI/emails show user-friendly Greek labels
- Centralized mapping for consistency

### 5. Separate Resend Endpoint
**Decision**: POST /api/orders/[id]/resend vs PUT /api/orders/[id]
**Rationale**:
- Resend is an action, not a state update
- Clear separation of concerns
- Easier to add different email types later

---

## Integration Notes

### Future Enhancements
1. **Shipping Cost Calculation**
   - Currently returns 0
   - Will integrate with shipping API when available

2. **Email Recipient**
   - Currently uses DEV_MAIL_TO
   - Should read buyerEmail from order when schema updated

3. **Order Page Integration**
   - Order confirmation page can now use GET endpoint
   - Cleaner separation of concerns (no direct Prisma calls)

---

## Technical Notes

- **No DB changes**: Uses existing Order + OrderItem schema
- **Zero new dependencies**: Pure Next.js + existing mail setup
- **TypeScript strict mode**: Fully typed
- **Greek-first**: All user-facing content in Greek
- **Safe error handling**: Graceful fallbacks throughout
- **LOC**: ~200 (API ~50, template ~80, E2E ~70, docs ~50)

---

## Success Metrics

- ✅ GET /api/orders/[id] endpoint created
- ✅ Order status email template (Greek-first)
- ✅ Resend email endpoint with template integration
- ✅ E2E tests for all endpoints
- ✅ Safe fallbacks for SMTP errors
- ✅ Zero build errors
- ✅ TypeScript strict mode passing

---

**Status**: ✅ COMPLETE
**PR**: Ready for creation
**Next Phase**: Order page API integration

**🇬🇷 Dixis Orders - Complete API Layer!**
