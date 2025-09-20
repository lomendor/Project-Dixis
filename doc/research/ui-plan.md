# UI Implementation Plan

Based on comprehensive analysis of Project-Dixis codebase, existing components, API structure, and E2E test requirements.

## Cart Components Needed

### Core Cart Components
- [ ] **CartItemCard** (60 LOC) - Individual cart item with quantity controls and remove button
- [ ] **QuantitySelector** (30 LOC) - Reusable + / - quantity input component  
- [ ] **CartSummary** (40 LOC) - Subtotal, tax, shipping, and total display
- [ ] **EmptyCartState** (25 LOC) - Empty cart illustration with CTA to browse products
- [ ] **CartLoadingState** (20 LOC) - Skeleton loading for cart items

### Enhanced Cart Features  
- [ ] **CartHeader** (35 LOC) - Cart title, item count, and clear all button
- [ ] **SaveForLater** (45 LOC) - Move items to wishlist functionality
- [ ] **RecommendedProducts** (50 LOC) - Suggested products in empty/partial cart
- [ ] **CartNotifications** (30 LOC) - Stock warnings, price changes, promotions

## Checkout Flow Components

### Shipping & Address
- [ ] **ShippingForm** (80 LOC) - Greek postal codes, city validation with real-time feedback
- [ ] **AddressAutocomplete** (60 LOC) - Greek address suggestions with postal code matching
- [ ] **ShippingOptions** (45 LOC) - Courier vs pickup selection with pricing
- [ ] **DeliveryEstimate** (35 LOC) - ETA calculation and display

### Payment & Order
- [ ] **PaymentMethodSelector** (50 LOC) - Cash on delivery, future payment methods
- [ ] **OrderReview** (65 LOC) - Final order summary before confirmation
- [ ] **CheckoutProgress** (40 LOC) - Step indicator (Cart → Shipping → Payment → Confirm)
- [ ] **OrderConfirmation** (55 LOC) - Success state with order details and tracking info

### Checkout Validation
- [ ] **FormValidation** (45 LOC) - Real-time Greek postal code + city validation
- [ ] **ShippingCalculator** (70 LOC) - Dynamic shipping cost with retry logic and fallbacks
- [ ] **CheckoutErrorBoundary** (35 LOC) - Graceful error handling for payment failures

## Producer Dashboard Components

### Dashboard Overview
- [ ] **DashboardStats** (60 LOC) - KPI cards (orders, revenue, products, average order value)
- [ ] **SalesChart** (80 LOC) - Revenue trends with Chart.js or recharts
- [ ] **RecentOrders** (70 LOC) - Latest orders table with status indicators
- [ ] **QuickActions** (45 LOC) - Add product, view orders, settings shortcuts

### Product Management
- [ ] **ProductTable** (85 LOC) - Product list with edit, delete, stock management
- [ ] **ProductForm** (95 LOC) - Add/edit product with image upload and categories
- [ ] **StockManager** (55 LOC) - Bulk stock updates and low stock alerts
- [ ] **ProductImageGallery** (50 LOC) - Multiple image upload with drag-and-drop

### Order Management  
- [ ] **OrderStatusBadge** (20 LOC) - Color-coded status indicators
- [ ] **OrderDetailsModal** (75 LOC) - Full order view with customer info and items
- [ ] **OrderActions** (40 LOC) - Accept, reject, mark as shipped buttons
- [ ] **BulkOrderActions** (45 LOC) - Select multiple orders for batch operations

### Analytics & Reports
- [ ] **PerformanceMetrics** (65 LOC) - Top products, customer retention, seasonal trends
- [ ] **ExportTools** (35 LOC) - Download reports as CSV/PDF
- [ ] **NotificationCenter** (50 LOC) - New orders, low stock, customer messages

## File Structure Recommendations

```
frontend/src/
├── components/
│   ├── ui/ (shadcn/ui components)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   └── chart.tsx
│   │
│   ├── cart/
│   │   ├── CartItemCard.tsx
│   │   ├── QuantitySelector.tsx
│   │   ├── CartSummary.tsx
│   │   ├── EmptyCartState.tsx
│   │   └── index.ts
│   │
│   ├── checkout/
│   │   ├── ShippingForm.tsx
│   │   ├── AddressAutocomplete.tsx
│   │   ├── PaymentMethodSelector.tsx
│   │   ├── OrderReview.tsx
│   │   ├── CheckoutProgress.tsx
│   │   └── index.ts
│   │
│   ├── producer/
│   │   ├── dashboard/
│   │   │   ├── DashboardStats.tsx
│   │   │   ├── SalesChart.tsx
│   │   │   ├── RecentOrders.tsx
│   │   │   └── QuickActions.tsx
│   │   ├── products/
│   │   │   ├── ProductTable.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── StockManager.tsx
│   │   │   └── ProductImageGallery.tsx
│   │   ├── orders/
│   │   │   ├── OrderStatusBadge.tsx
│   │   │   ├── OrderDetailsModal.tsx
│   │   │   └── OrderActions.tsx
│   │   └── index.ts
│   │
│   └── shared/
│       ├── LoadingStates.tsx
│       ├── ErrorBoundaries.tsx
│       ├── FormInputs.tsx
│       └── DataVisualization.tsx
│
├── hooks/
│   ├── useCart.ts (existing cart operations)
│   ├── useCheckout.ts (checkout flow management)
│   ├── useShipping.ts (Greek postal code validation)
│   ├── useProducerDashboard.ts (dashboard data)
│   └── useOrderManagement.ts (producer order handling)
│
└── lib/
    ├── validations/
    │   ├── checkout.ts (existing Greek validation)
    │   ├── product.ts (product form validation)
    │   └── shipping.ts (address validation)
    └── constants/
        ├── greek-postal-codes.ts
        ├── shipping-zones.ts
        └── ui-constants.ts
```

**Rationale**: 
- Feature-based organization for maintainability
- Separate shared UI components for reusability  
- Existing patterns (useAuth, useToast) continue to work
- Clear separation between cart, checkout, and producer features

## Risk Assessment

### Technical Risks

**High Priority**
- [ ] **Greek Localization Complexity** - Existing checkout has sophisticated Greek postal code validation that must be preserved
  - *Mitigation*: Reuse existing validation logic from `/lib/checkout/checkoutValidation.ts`
  - *LOC Impact*: +20 LOC per form component

- [ ] **Shipping API Instability** - Existing retry logic and fallbacks are complex  
  - *Mitigation*: Maintain current `shippingRetryManager` and fallback strategies
  - *LOC Impact*: +30 LOC for error handling

**Medium Priority**
- [ ] **API Integration Breaking Changes** - Components must work with existing Laravel API structure
  - *Mitigation*: Use existing `apiClient` patterns, avoid new endpoints
  - *LOC Impact*: +15 LOC per API-connected component

- [ ] **E2E Test Coverage** - New components need `data-testid` attributes for existing Playwright tests
  - *Mitigation*: Follow existing testid patterns (`cart-item`, `checkout-btn`, etc.)
  - *LOC Impact*: +5 LOC per component for test attributes

**Low Priority**  
- [ ] **Mobile Responsiveness** - Existing design is mobile-first but complex components may break
  - *Mitigation*: Use existing Tailwind patterns, test on mobile first
  - *LOC Impact*: +10 LOC for responsive classes

### LOC Estimate Ranges

**Conservative Estimate**: 1,580 LOC total
- Cart Components: 340 LOC
- Checkout Components: 485 LOC  
- Producer Dashboard: 755 LOC

**Optimistic Estimate**: 1,200 LOC total (with maximum component reuse)
- Cart Components: 260 LOC
- Checkout Components: 370 LOC
- Producer Dashboard: 570 LOC

**Risk Buffer**: +300-400 LOC for Greek localization, API integration complexities, and E2E test requirements

## shadcn/ui Integration

### Components to Adopt (Existing Setup)
- [ ] **Button** - Replace existing button patterns with consistent styling
- [ ] **Card** - Use for product cards, dashboard stats, order summaries  
- [ ] **Input** - Replace form inputs with validated Greek postal code support
- [ ] **Badge** - Order status, product categories, stock indicators
- [ ] **Dialog** - Order details, product forms, confirmation modals

### Components to Install
```bash
npx shadcn-ui@latest add button card input badge dialog select table
npx shadcn-ui@latest add form textarea checkbox radio-group
npx shadcn-ui@latest add dropdown-menu popover tooltip
```

### Custom Component Needs  
- [ ] **GreekPostalCodeInput** (40 LOC) - Specialized input with validation visualization
- [ ] **ShippingZoneMap** (60 LOC) - Visual shipping cost calculator
- [ ] **ProductImageUploader** (70 LOC) - Drag-and-drop with preview
- [ ] **QuantityInput** (30 LOC) - +/- buttons with Greek number formatting
- [ ] **CurrencyDisplay** (25 LOC) - Euro formatting with Greek conventions

### Integration Strategy
1. **Phase 1**: Install core shadcn/ui components without disrupting existing functionality
2. **Phase 2**: Gradually replace existing components while maintaining API compatibility
3. **Phase 3**: Enhance with custom Greek-specific components
4. **Phase 4**: Polish animations and micro-interactions for social media appeal

### Tailwind Compatibility
- Existing project uses Tailwind CSS 4 with custom theme
- shadcn/ui components will inherit existing color scheme (green-600 primary)
- Custom CSS variables already defined in `globals.css`
- Mobile-first responsive patterns already established

## Implementation Priority

### Week 1: Core Cart Enhancement (340 LOC)
- CartItemCard, QuantitySelector, CartSummary
- Maintain existing Greek checkout validation
- Ensure E2E test compatibility

### Week 2: Checkout Flow Polish (485 LOC)  
- Enhanced ShippingForm with better UX
- Real-time address validation
- Improved error handling and loading states

### Week 3: Producer Dashboard Foundation (400 LOC)
- DashboardStats, QuickActions, ProductTable
- Basic order management functionality
- Analytics visualization setup

### Week 4: Advanced Producer Features (355 LOC)
- Advanced ProductForm with image upload
- Order management workflow
- Performance metrics and reporting

### Week 5-6: Polish & Social Media Optimization
- Micro-animations and loading states
- Mobile responsiveness refinement
- Screenshot-worthy visual moments
- Accessibility audit and improvements

## Success Metrics

- [ ] **E2E Tests Pass**: All existing Playwright tests remain green
- [ ] **Mobile Performance**: <2s load times on 3G networks
- [ ] **Greek Localization**: 100% Greek postal code validation accuracy  
- [ ] **API Compatibility**: Zero breaking changes to existing Laravel endpoints
- [ ] **Social Media Ready**: Components look great in 9:16 screenshots
- [ ] **Accessibility**: WCAG AA compliance with screen reader support
- [ ] **Developer Experience**: Components are reusable and well-documented