# Dixis Design System - Style Guide

## Design Vision

**Mood:** "Premium but approachable" - Serious yet warm, modern and clean with depth

**Inspiration:** Wolt-style 3D clay icons, but more "earthy" for agricultural products

**Target:** Premium agricultural marketplace connecting Greek producers with consumers

---

## Color Palette

### Primary Colors - Cyprus Green
The primary color represents trust, freshness, and agricultural heritage.

| Token | Hex | Usage |
|-------|-----|-------|
| `--brand-primary` | `#0f5c2e` | CTAs, links, brand elements |
| `--brand-primary-light` | `#1a7a3e` | Hover states |
| `--brand-primary-pale` | `#e8f5ed` | Subtle backgrounds, badges |
| `--brand-primary-foreground` | `#ffffff` | Text on primary |

### Accent Colors - Warm Tones
Warm accents add premium feel and visual interest.

| Token | Hex | Usage |
|-------|-----|-------|
| `--accent-gold` | `#c9a227` | Special badges, highlights |
| `--accent-beige` | `#f5f0e6` | Card backgrounds, sections |
| `--accent-cream` | `#faf8f3` | Subtle backgrounds |

### Neutral Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--neutral-0` | `#ffffff` | Cards, containers |
| `--neutral-50` | `#f8f9fa` | Page background |
| `--neutral-100` | `#f1f3f5` | Hover backgrounds |
| `--neutral-200` | `#e9ecef` | Borders, dividers |
| `--neutral-300` | `#dee2e6` | Input borders |
| `--neutral-400` | `#ced4da` | Disabled states |
| `--neutral-500` | `#adb5bd` | Placeholder text |
| `--neutral-600` | `#6b7280` | Secondary text |
| `--neutral-700` | `#495057` | Body text |
| `--neutral-800` | `#343a40` | Headings |
| `--neutral-900` | `#1a1a1a` | Primary text |

### Semantic Colors
| Token | Default | Light | Usage |
|-------|---------|-------|-------|
| `--success` | `#10b981` | `#d1fae5` | Success states |
| `--warning` | `#f59e0b` | `#fef3c7` | Warning states |
| `--info` | `#0ea5e9` | `#e0f2fe` | Information |
| `--danger` | `#ef4444` | `#fee2e2` | Errors, destructive |

### Category Colors (Wolt-style pastels)
| Category | Token | Hex |
|----------|-------|-----|
| Vegetables | `--category-vegetables` | `#e8f5ed` |
| Fruits | `--category-fruits` | `#fef3c7` |
| Dairy | `--category-dairy` | `#e0f2fe` |
| Meat | `--category-meat` | `#fee2e2` |
| Bakery | `--category-bakery` | `#f5f0e6` |
| Honey | `--category-honey` | `#fef9c3` |
| Wine | `--category-wine` | `#fce7f3` |
| Olive | `--category-olive` | `#ecfccb` |

---

## Typography

### Font Family
```css
--font-sans: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
```

### Type Scale
| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `--text-display` | 48px (3rem) | 1.1 | 700 | Hero titles |
| `--text-heading` | 32px (2rem) | 1.2 | 700 | H1, page titles |
| `--text-subheading` | 24px (1.5rem) | 1.3 | 600 | H2, section titles |
| `--text-title` | 20px (1.25rem) | 1.4 | 600 | H3, card titles |
| `--text-body` | 16px (1rem) | 1.6 | 400 | Body text |
| `--text-small` | 14px (0.875rem) | 1.5 | 400 | Secondary text |
| `--text-caption` | 12px (0.75rem) | 1.5 | 500 | Labels, captions |

### Font Weights
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

---

## Spacing

Based on 8px grid system.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight spacing |
| `--space-2` | 8px | Small gaps |
| `--space-3` | 12px | Button padding |
| `--space-4` | 16px | Card padding |
| `--space-5` | 20px | Medium gaps |
| `--space-6` | 24px | Section padding |
| `--space-8` | 32px | Large gaps |
| `--space-10` | 40px | Extra spacing |
| `--space-12` | 48px | Section margins |
| `--space-16` | 64px | Large sections |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 8px | Buttons, inputs |
| `--radius-md` | 12px | Cards |
| `--radius-lg` | 16px | Large containers |
| `--radius-xl` | 20px | Modals |
| `--radius-full` | 9999px | Pills, avatars |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.08)` | Default cards |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.12)` | Modals, dropdowns |
| `--shadow-glow` | `0 0 20px rgba(15,92,46,0.15)` | Primary hover |
| `--shadow-card` | Complex | Product cards |
| `--shadow-card-hover` | Complex | Card hover state |

---

## Components

### Primary Button
```css
.btn-primary {
  background: var(--brand-primary);
  color: var(--brand-primary-foreground);
  padding: 12px 24px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  transition: all 200ms ease;
}

.btn-primary:hover {
  background: var(--brand-primary-light);
  box-shadow: var(--shadow-glow);
  transform: translateY(-1px);
}
```

### Secondary Button
```css
.btn-secondary {
  background: var(--neutral-0);
  color: var(--brand-primary);
  border: 2px solid var(--brand-primary);
  padding: 12px 24px;
  border-radius: var(--radius-sm);
}

.btn-secondary:hover {
  background: var(--brand-primary-pale);
}
```

### Product Card
```css
.product-card {
  background: var(--neutral-0);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: all 200ms ease;
}

.product-card:hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-4px);
}
```

### Category Card (Wolt-style)
```css
.category-card {
  background: var(--category-*); /* Per category */
  border-radius: var(--radius-lg);
  padding: 24px;
  text-align: center;
  transition: all 200ms ease;
}

.category-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: var(--shadow-md);
}
```

---

## Transitions

| Token | Value | Usage |
|-------|-------|-------|
| `--transition-fast` | 150ms ease | Hover states |
| `--transition-normal` | 200ms ease | Default animations |
| `--transition-slow` | 300ms ease | Complex animations |
| `--transition-bounce` | 300ms cubic-bezier(0.68,-0.55,0.265,1.55) | Playful effects |

---

## Accessibility

- All interactive elements have minimum 44px touch targets
- Color contrast meets WCAG AA standards
- Focus states use `outline: 2px solid var(--brand-primary)`
- Reduced motion support via `prefers-reduced-motion`
- Skip links for keyboard navigation

---

## Files Reference

| Purpose | File |
|---------|------|
| CSS Variables | `src/styles/brand.css` |
| Global Styles | `src/app/globals.css` |
| Tailwind Config | `tailwind.config.ts` |

---

## Usage Examples

### Using CSS Variables
```css
.my-component {
  background: var(--brand-primary-pale);
  color: var(--neutral-900);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
}
```

### Using Tailwind Classes
```html
<button class="bg-primary text-primary-foreground px-6 py-3 rounded-sm">
  Click me
</button>

<div class="bg-category-vegetables rounded-lg p-6">
  Category Card
</div>
```

---

## Design Principles

1. **Whitespace is premium** - Give elements room to breathe
2. **Subtle shadows** - Create depth without overwhelming
3. **Consistent spacing** - Use the 8px grid
4. **Warm + Professional** - Cyprus green with warm accents
5. **Mobile-first** - Design for touch, scale up
6. **Performance** - Optimize for LCP, minimize layout shifts
