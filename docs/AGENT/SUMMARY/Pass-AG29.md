# Pass-AG29 — Customer link in receipt & confirmation + Copy

**Status**: ✅ COMPLETE
**Branch**: `feat/AG29-customer-lookup-link`
**Protocol**: STOP-on-failure | STRICT NO-VISION

---

## 🎯 OBJECTIVE

Add customer lookup links to receipt emails, confirmation page, and admin detail:
- Email: Add `/orders/lookup?ordNo=...` link alongside admin link
- Confirmation: Display customer link with copy button and "Copied!" feedback
- Admin Detail: Add "Customer view" helper link
- E2E: Test email contains customer link, confirmation copy button works

---

## ✅ IMPLEMENTATION

### 1. Email Receipt Changes (`frontend/src/app/api/orders/route.ts`)

**Customer Link Variable**:
```typescript
const link = `${origin}/admin/orders/${created.id}`;
const cust = `${origin}/orders/lookup?ordNo=${ordNo}`;
const body = `Order ${ordNo}\nΣύνολο: €${(data.total ?? 0).toFixed(
  2
)}\nΤ.Κ.: ${data.postalCode}\n\nAdmin: ${link}\nCustomer: ${cust}`;
```

**Email Structure**:
- Admin link: `/admin/orders/{id}` (existing, unchanged)
- Customer link: `/orders/lookup?ordNo=DX-{YYYYMMDD}-{suffix}` (new)
- Both links displayed in email body

**Applied to**:
- Prisma path (lines 77-81)
- Memory fallback (lines 106-110)

### 2. Confirmation Page Changes (`frontend/src/app/checkout/confirmation/page.tsx`)

**Added State**:
```typescript
const [copied, setCopied] = React.useState<boolean>(false);
```

**Customer Link Section**:
```tsx
{orderNo && (
  <div className="mt-4 p-3 border rounded bg-gray-50">
    <div className="text-sm font-medium text-neutral-800 mb-2">
      Customer Link
    </div>
    <div className="text-xs text-neutral-600 break-all mb-2">
      <a
        href={`/orders/lookup?ordNo=${orderNo}`}
        className="underline"
        data-testid="customer-link"
      >
        {typeof window !== 'undefined'
          ? `${window.location.origin}/orders/lookup?ordNo=${orderNo}`
          : `/orders/lookup?ordNo=${orderNo}`}
      </a>
    </div>
    <button
      onClick={async () => {
        try {
          const link =
            typeof window !== 'undefined'
              ? `${window.location.origin}/orders/lookup?ordNo=${orderNo}`
              : `/orders/lookup?ordNo=${orderNo}`;
          await navigator.clipboard.writeText(link);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {}
      }}
      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
      data-testid="copy-customer-link"
    >
      Copy link
    </button>
    {copied && (
      <span
        className="ml-2 text-xs text-green-600"
        data-testid="copied-flag"
      >
        Copied!
      </span>
    )}
  </div>
)}
```

**Key Features**:
- Full URL display with origin (SSR-safe with `typeof window` check)
- Copy button using `navigator.clipboard.writeText()`
- Temporary "Copied!" message (2 second timeout)
- All elements have testid attributes for E2E testing

### 3. Admin Detail Changes (`frontend/src/app/admin/orders/[id]/page.tsx`)

**Customer View Link**:
```tsx
<div className="mb-2">
  <a
    href={`/orders/lookup?ordNo=${orderNumber(data.id, data.createdAt)}`}
    className="text-blue-600 underline text-xs"
    data-testid="customer-view-link"
  >
    Customer view →
  </a>
</div>
```

**Placement**: After Order No and Order ID, before the order details table

### 4. E2E Test Updates

**Email Test** (`frontend/tests/e2e/order-receipt-email.spec.ts`):
```typescript
// body contains admin link
expect(String(found?.text || '')).toContain('/admin/orders/');
// body contains customer link
expect(String(found?.text || '')).toContain('/orders/lookup?ordNo=');
```

**Confirmation Test** (`frontend/tests/e2e/confirmation-customer-link.spec.ts` - NEW):
```typescript
test('Confirmation page — customer link + copy button', async ({ page, context }) => {
  // Grant clipboard permissions
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  // Create order via checkout flow
  // ...

  // Verify customer link is visible
  const customerLink = page.getByTestId('customer-link');
  await expect(customerLink).toBeVisible();

  // Get order number
  const orderNo = (await page.getByTestId('order-no').textContent())?.trim() || '';
  expect(orderNo).toMatch(/^DX-\d{8}-[A-Z0-9]{4}$/);

  // Verify link contains order number
  const linkText = (await customerLink.textContent())?.trim() || '';
  expect(linkText).toContain(`/orders/lookup?ordNo=${orderNo}`);

  // Click copy button
  const copyButton = page.getByTestId('copy-customer-link');
  await copyButton.click();

  // Verify "Copied!" message appears
  const copiedFlag = page.getByTestId('copied-flag');
  await expect(copiedFlag).toBeVisible();

  // Verify clipboard contains the link
  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText).toContain(`/orders/lookup?ordNo=${orderNo}`);

  // Wait for "Copied!" to disappear
  await expect(copiedFlag).not.toBeVisible({ timeout: 3000 });
});
```

---

## 🔍 KEY PATTERNS

### SSR-Safe Window Access
```typescript
{typeof window !== 'undefined'
  ? `${window.location.origin}/orders/lookup?ordNo=${orderNo}`
  : `/orders/lookup?ordNo=${orderNo}`}
```
- Prevents hydration errors
- Fallback to relative path on server

### Clipboard API with Error Handling
```typescript
try {
  await navigator.clipboard.writeText(link);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
} catch {}
```
- Modern clipboard API (no `document.execCommand`)
- Graceful failure (empty catch)
- Temporary feedback message

### Playwright Clipboard Testing
```typescript
await context.grantPermissions(['clipboard-read', 'clipboard-write']);
const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
```
- Grant permissions at context level
- Read clipboard via evaluate (runs in browser context)

### Replace All Pattern
When the same email body text appears in both Prisma and memory fallback paths:
```typescript
<invoke name="Edit">
  <parameter name="replace_all">true</parameter>
</invoke>
```
- Avoids duplicating edits
- Ensures consistency across code paths

---

## 📊 FILES MODIFIED

1. `frontend/src/app/api/orders/route.ts` - Add customer link to email
2. `frontend/src/app/checkout/confirmation/page.tsx` - Customer link + copy button
3. `frontend/src/app/admin/orders/[id]/page.tsx` - Customer view helper link
4. `frontend/tests/e2e/order-receipt-email.spec.ts` - Assert customer link in email
5. `frontend/tests/e2e/confirmation-customer-link.spec.ts` - Test copy button (NEW)
6. `docs/AGENT/SUMMARY/Pass-AG29.md` - This documentation (NEW)

---

## ✅ VERIFICATION

**Email Receipt**:
```bash
# Create order and check dev mailbox
curl /api/orders -X POST -d '{"postalCode":"10431","method":"COURIER","total":42}'
curl /api/dev/mailbox | jq '.[] | select(.subject | contains("DX-"))'
# Should contain both Admin: and Customer: links
```

**Confirmation Page**:
```bash
cd frontend
npx playwright test confirmation-customer-link.spec.ts
# Tests customer link visibility and copy button functionality
```

**Admin Detail**:
- Navigate to `/admin/orders/{id}`
- Verify "Customer view →" link is present
- Click link to verify it navigates to `/orders/lookup?ordNo=...`

---

**Generated-by**: Claude Code (AG29 Protocol)
**Timestamp**: 2025-10-18
