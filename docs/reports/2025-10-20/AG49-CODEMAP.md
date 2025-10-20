# AG49 — CODEMAP

**Date**: 2025-10-20
**Pass**: AG49
**Scope**: Confirmation: @media print CSS

---

## 📂 FILES MODIFIED

### Confirmation Page (`frontend/src/app/checkout/confirmation/page.tsx`)

**Print CSS Block (Lines 289-311)**:
```tsx
{/* AG49: print styles */}
<style>{`
  @media print {
    /* Hide toolbars/buttons */
    [data-testid="print-toolbar"],
    button,
    [role="button"] {
      display: none !important;
    }
    /* Clean shadows/borders for clean PDF */
    .shadow, .shadow-sm, .shadow-md, .shadow-lg { box-shadow: none !important; }
    .border { border: 1px solid transparent !important; }
    body { background: #fff !important; }
    /* Avoid page-breaks in small blocks */
    [data-testid="order-summary-card"],
    [data-testid="confirm-collapsible"] {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    /* Larger margins for printing */
    @page { margin: 16mm; }
  }
`}</style>
```

**Positioning**: Before closing `</main>` tag, after "Back to shop" link

---

## 📂 FILES CREATED

### E2E Test (`frontend/tests/e2e/customer-confirmation-print-css.spec.ts`)

**Test Flow**:
```typescript
test('Confirmation — @media print hides toolbar, keeps summary visible', async ({ page }) => {
  // 1. Create order through checkout flow
  // ... checkout steps ...

  // 2. Verify normal state
  await expect(toolbar).toBeVisible();
  await expect(page.getByTestId('order-summary-card')).toBeVisible();

  // 3. Emulate print media
  await page.emulateMedia({ media: 'print' });

  // 4. Verify print state
  await expect(toolbar).toBeHidden();
  await expect(page.getByTestId('order-summary-card')).toBeVisible();

  // 5. Reset
  await page.emulateMedia({ media: 'screen' });
});
```

---

## 🎨 CSS RULES BREAKDOWN

### 1. Hide Interactive Elements
```css
[data-testid="print-toolbar"],
button,
[role="button"] {
  display: none !important;
}
```
**Targets**: Print toolbar (AG48), all buttons, elements with button role
**Effect**: Hidden when printing

### 2. Remove Visual Effects
```css
.shadow, .shadow-sm, .shadow-md, .shadow-lg {
  box-shadow: none !important;
}
```
**Targets**: Tailwind CSS shadow classes
**Effect**: Removes shadows for clean print

### 3. Transparent Borders
```css
.border {
  border: 1px solid transparent !important;
}
```
**Targets**: Tailwind CSS border class
**Effect**: Borders become invisible but maintain layout

### 4. White Background
```css
body {
  background: #fff !important;
}
```
**Targets**: Body element
**Effect**: Ensures white background for printing

### 5. Prevent Page Breaks
```css
[data-testid="order-summary-card"],
[data-testid="confirm-collapsible"] {
  break-inside: avoid;
  page-break-inside: avoid;
}
```
**Targets**: Order summary card, collapsible section
**Effect**: Sections stay together on same page

### 6. Page Margins
```css
@page {
  margin: 16mm;
}
```
**Targets**: Printed page
**Effect**: Sets margins for all printed pages

---

## 🔍 CSS SPECIFICITY

**Why `!important`**: Print media rules need to override inline styles and high-specificity Tailwind classes

**Alternative Approach** (not used):
Could increase specificity without `!important`, but would make CSS more complex and harder to maintain.

---

## 📊 INTEGRATION POINTS

**Builds on AG48**: Print button (AG48) triggers `window.print()`, which applies these styles

**No Conflicts**: Print media rules only apply when printing/previewing print

**Complementary**: AG48 provides the trigger, AG49 provides the clean output

---

**Generated-by**: Claude Code (AG49 Protocol)
**Timestamp**: 2025-10-20
