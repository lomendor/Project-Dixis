# AG37-CODEMAP — Admin CSV Smart Filename

**Date**: 2025-10-18
**Pass**: AG37
**Scope**: API + UI changes for dynamic CSV export filenames

---

## 🎯 IMPLEMENTATION OVERVIEW

Add smart CSV filenames based on active filters to admin export functionality.

**Before AG37**: All exports saved as `orders.csv`
**After AG37**: Exports named like `orders_2025-10-18_ord-a3f2.csv` or `orders_from-2025-10-01_to-2025-10-15_courier.csv`

---

## 📂 FILES MODIFIED

### 1. API Route (`frontend/src/app/api/admin/orders/export/route.ts`)

**Lines Changed**: +40 (helper + filename logic)

**Changes**:

#### A. Helper Function (Lines 18-24)
```typescript
// AG37: Helper for safe filename parts
function safePart(x: string): string {
  return String(x || '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .slice(0, 60);
}
```

**Purpose**: Sanitize filter values for safe filename inclusion (alphanumeric + dash/underscore/dot only)

#### B. Filename Generation Logic (Lines 177-204)
```typescript
// AG37: Build smart filename based on filters
const parts: string[] = ['orders'];
const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

// Date range or ordNo suffix
if (ordNo && parsed) {
  const suffix = parsed.suffix.toLowerCase();
  parts.push(today, `ord-${suffix}`);
} else if (from || to) {
  const fromPart = from ? safePart(from.slice(0, 10)) : '';
  const toPart = to ? safePart(to.slice(0, 10)) : '';
  if (fromPart && toPart && fromPart === toPart) {
    parts.push(fromPart);
  } else {
    if (fromPart) parts.push(`from-${fromPart}`);
    if (toPart) parts.push(`to-${toPart}`);
  }
} else {
  parts.push(today);
}

// Other filters
if (method) parts.push(safePart(method));
if (status) parts.push(safePart(status));
if (q) parts.push(`q-${safePart(q)}`);
if (pc) parts.push(`pc-${safePart(pc)}`);

const filename = parts.join('_') + '.csv';
```

**Filename Examples**:
- No filters: `orders_2025-10-18.csv`
- ordNo filter: `orders_2025-10-18_ord-a3f2.csv`
- Date range (same day): `orders_2025-10-15.csv`
- Date range (different): `orders_from-2025-10-01_to-2025-10-15.csv`
- With method+status: `orders_2025-10-18_courier_paid.csv`
- With search: `orders_2025-10-18_q-john.csv`

#### C. Content-Disposition Header (Line 210)
```typescript
// Before: 'Content-Disposition': 'attachment; filename="orders.csv"'
'Content-Disposition': `attachment; filename="${filename}"`
```

---

### 2. UI Component (`frontend/src/app/admin/orders/page.tsx`)

**Lines Changed**: +50 (state + effect + download attribute)

**Changes**:

#### A. State Variable (Lines 63-64)
```typescript
// AG37: Download filename state
const [downloadName, setDownloadName] = React.useState('orders.csv');
```

#### B. Filename Calculation Effect (Lines 246-290)
```typescript
// AG37: Calculate download filename based on filters (mirrors server logic)
React.useEffect(() => {
  try {
    const safePart = (x: string) =>
      String(x || '')
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, '-')
        .slice(0, 60);

    const parts: string[] = ['orders'];
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // Date range or ordNo suffix
    if (ordNo && ordNo.includes('-')) {
      const suffix = ordNo.split('-').pop()?.toLowerCase() || '';
      if (suffix) {
        parts.push(today, `ord-${suffix}`);
      } else {
        parts.push(today);
      }
    } else if (fromISO || toISO) {
      const fromPart = fromISO ? safePart(fromISO.slice(0, 10)) : '';
      const toPart = toISO ? safePart(toISO.slice(0, 10)) : '';
      if (fromPart && toPart && fromPart === toPart) {
        parts.push(fromPart);
      } else {
        if (fromPart) parts.push(`from-${fromPart}`);
        if (toPart) parts.push(`to-${toPart}`);
      }
    } else {
      parts.push(today);
    }

    // Other filters
    if (method) parts.push(safePart(method));
    if (status) parts.push(safePart(status));
    if (q) parts.push(`q-${safePart(q)}`);
    if (pc) parts.push(`pc-${safePart(pc)}`);

    const filename = parts.join('_') + '.csv';
    setDownloadName(filename);
  } catch {
    setDownloadName('orders.csv');
  }
}, [ordNo, fromISO, toISO, method, status, q, pc]);
```

**Purpose**: Client-side filename calculation that mirrors server logic (for HTML5 download attribute hint)

**Dependencies**: Recalculates when any filter changes (ordNo, fromISO, toISO, method, status, q, pc)

#### C. Download Attribute (Line 496)
```typescript
// Before: download="orders.csv"
download={downloadName}
```

**Purpose**: HTML5 download attribute provides browser hint for filename (actual filename comes from server's Content-Disposition header)

---

### 3. E2E Test (`frontend/tests/e2e/admin-export-smart-filename.spec.ts`)

**Lines**: +58 (NEW file)

**Test Flow**:
1. Create order via checkout flow
2. Extract Order No from confirmation page (e.g., "DX-20251018-A3F2")
3. Navigate to admin orders
4. Filter by Order No
5. Click export CSV
6. Capture download event
7. Verify `download.suggestedFilename()` contains:
   - "orders_"
   - Today's date (YYYY-MM-DD)
   - "ord-####" suffix from Order No
   - ".csv" extension

**Assertions**:
```typescript
expect(filename).toMatch(/^orders_/);
expect(filename).toContain(today);
expect(filename).toContain(`ord-${suffix}`);
expect(filename).toMatch(/\.csv$/);
```

---

## 🔍 KEY PATTERNS

### 1. Dual Filename Logic (Client + Server)

**Why Both?**:
- **Server** (Content-Disposition): Authoritative filename from API response
- **Client** (download attribute): HTML5 hint for browsers (fallback)

**Benefits**:
- Works even if browser doesn't support download attribute
- Consistent UX across browsers
- Client-side hint provides instant feedback

### 2. Safe Filename Sanitization

```typescript
function safePart(x: string): string {
  return String(x || '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .slice(0, 60);
}
```

**Security**:
- Removes special characters (prevents directory traversal)
- Max 60 chars per part (prevents overly long filenames)
- Lowercase (consistent naming)

### 3. Smart Date Logic

```typescript
// Same day range: orders_2025-10-15.csv
if (fromPart && toPart && fromPart === toPart) {
  parts.push(fromPart);
}
// Different days: orders_from-2025-10-01_to-2025-10-15.csv
else {
  if (fromPart) parts.push(`from-${fromPart}`);
  if (toPart) parts.push(`to-${toPart}`);
}
```

**UX Benefit**: Cleaner filename when filtering single day

### 4. Priority Order

**Filename Parts Order**:
1. "orders" (prefix)
2. Date or ordNo suffix
3. Method filter
4. Status filter
5. Search query (q)
6. Postal code (pc)

**Example**: `orders_2025-10-18_courier_paid_q-john.csv`

---

## 📊 INTEGRATION POINTS

### AG33 Integration
- Filename reflects persisted filters from localStorage/URL
- Export always uses current active filters (same as list view)

### AG36 Integration
- Keyboard shortcut 't' sets Today filter → filename becomes `orders_2025-10-18.csv`
- Filters applied via shortcuts reflected in export filename

---

## 🎯 UX IMPROVEMENTS

**Before AG37**:
- All exports: `orders.csv`
- Hard to distinguish multiple exports
- Must manually rename files

**After AG37**:
- Descriptive filenames: `orders_2025-10-18_ord-a3f2.csv`
- Easy to identify export context
- No manual renaming needed
- File organization automatic

**Use Case Example**:
Admin downloads exports for different date ranges:
- `orders_from-2025-10-01_to-2025-10-07.csv`
- `orders_from-2025-10-08_to-2025-10-15.csv`
- `orders_from-2025-10-16_to-2025-10-22.csv`

Clear, self-documenting filenames! 🎉

---

**Generated-by**: Claude Code (AG37 Protocol)
**Timestamp**: 2025-10-18
