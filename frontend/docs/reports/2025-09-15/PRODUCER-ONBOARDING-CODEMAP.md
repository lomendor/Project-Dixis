# [Task] Producer Onboarding Implementation
**Ημερομηνία:** 2025-09-15
**Σκοπός:** Implement complete producer onboarding flow with admin moderation
**Απόφαση/Αποτέλεσμα:** ✅ Full onboarding workflow with form submission, admin approval, and access control

## CODEMAP (τι διαβάστηκε/άγγιξε)

### Frontend Pages Created:

**`/producer/onboarding/page.tsx`** - **NEW** (185 lines)
- Complete onboarding form with Greek localization
- Status-aware UI showing pending/approved/rejected states
- Form validation and submission with error handling
- Protected with AuthGuard requireAuth + role="producer"
- Key features:
  ```typescript
  // Form fields: displayName (required), taxId (optional), phone (optional), accept-terms
  const [formData, setFormData] = useState<OnboardingFormData>({
    displayName: '', taxId: '', phone: '', acceptTerms: false
  });

  // Status banner rendering based on producer state
  const renderStatusBanner = () => {
    const statusConfig = {
      pending: { icon: '⏳', title: 'Αναμένεται Έγκριση' },
      active: { icon: '✅', title: 'Εγκεκριμένος Παραγωγός' },
      inactive: { icon: '❌', title: 'Αίτηση Απορρίφθηκε' }
    };
  };
  ```

**`/admin/producers/page.tsx`** - **NEW** (165 lines)
- Admin interface for producer application management
- Table with columns: ID, email, displayName, taxId, status, submittedAt
- Approve/Reject actions with real-time status updates
- Protected with AuthGuard requireRole="admin"
- Features:
  ```typescript
  // Status change handler for approve/reject
  const handleStatusChange = async (producerId: number, newStatus: 'active' | 'inactive') => {
    const endpoint = newStatus === 'active' ? 'approve' : 'reject';
    const response = await fetch(`/api/admin/producers/${producerId}/${endpoint}`, {
      method: 'POST',
    });
  };
  ```

**`/producer/products/page.tsx`** - **NEW** (220 lines)
- Producer products management with approval-based access control
- Conditional rendering based on producer status:
  - No profile → redirect to onboarding
  - Pending → "awaiting approval" notice
  - Rejected → "resubmit application" notice
  - Approved → full products management interface
- Protected with comprehensive access control logic

### API Routes Implemented:

**`/api/producer/status/route.ts`** - **NEW**
- GET endpoint returning current producer profile status
- Mock authentication and profile lookup
- Returns: `{ status, profile, submittedAt }`

**`/api/producer/onboarding/route.ts`** - **NEW**
- POST endpoint for form submission
- Creates/updates ProducerProfile with status=pending
- Server-side validation for required fields
- Returns success confirmation with profile data

**`/api/admin/producers/route.ts`** - **NEW**
- GET endpoint for admin producer applications list
- Admin role verification
- Returns all producer applications with user details

**`/api/admin/producers/[id]/approve/route.ts`** - **NEW**
- POST endpoint for producer approval
- Updates status to 'active'
- Admin-only access with role verification

**`/api/admin/producers/[id]/reject/route.ts`** - **NEW**
- POST endpoint for producer rejection
- Updates status to 'inactive'
- Admin-only access with role verification

**`/api/producer/products/route.ts`** - **NEW**
- GET endpoint for approved producer products
- Approval status verification before access
- Returns products only for active producers

### Access Control & Helpers:

**`/lib/auth-helpers.ts`** - **NEW** (165 lines)
- Comprehensive access control utilities
- Key functions:
  ```typescript
  export function hasRole(user: User | null, requiredRole: UserRole): boolean
  export function isProducerApproved(user: User | null, producerProfile: ProducerProfile | null): boolean
  export function canAccessProducerProducts(user: User | null, producerProfile: ProducerProfile | null): boolean
  export function getRedirectPath(user: User | null, producerProfile: ProducerProfile | null, intendedPath?: string): string
  ```
- Form validation helpers with Greek error messages
- Status label and color mappings for UI components

**`/hooks/useProducerAuth.ts`** - **NEW** (120 lines)
- React hook for producer-specific authentication state
- Integrates with producer status API
- Provides approval checking and route guard utilities
- Auto-refreshes producer profile status

### Testing Implementation:

**`/tests/e2e/onboarding.spec.ts`** - **NEW** (200+ lines)
- 4 comprehensive E2E test scenarios:
  1. New producer form submission → pending state
  2. Admin approval workflow
  3. Approved producer products access
  4. Non-approved producer protection/redirection
- Mock authentication for different user roles
- Greek text validation and data-testid verification
- Graceful handling of API dependencies

### Authorization Flow Implementation:

**Route Protection Pattern:**
```typescript
// Basic auth requirement
<AuthGuard requireAuth={true}>

// Role-specific protection
<AuthGuard requireAuth={true} requireRole="admin">

// Producer-specific with approval checking
const { isApproved, canAccessProducts } = useProducerAuth();
if (!canAccessProducts) {
  return <NotApprovedNotice />;
}
```

**API Access Control:**
```typescript
// Admin endpoints
if (!user || user.role !== 'admin') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// Producer product access
if (!producerProfile || producerProfile.status !== 'active') {
  return NextResponse.json({ error: 'Producer not approved' }, { status: 403 });
}
```

### Data Flow Architecture:

**Producer Onboarding Workflow:**
1. **Form Submission** → `POST /api/producer/onboarding` → creates ProducerProfile(status=pending)
2. **Admin Review** → `GET /api/admin/producers` → lists all applications
3. **Approval Action** → `POST /api/admin/producers/[id]/approve` → status=active
4. **Product Access** → `GET /api/producer/products` → verified access for approved producers

**State Management:**
- Frontend uses `useProducerAuth()` hook for real-time status checking
- API responses include profile status and timestamps
- UI conditionally renders based on approval state
- Error handling with Greek localized messages

### Integration Patterns:

**ERD Model Alignment:**
- Uses existing ERD ProducerProfile model with status enum
- Leverages User ↔ ProducerProfile relationships
- Maintains backward compatibility with existing auth system

**UI Component Patterns:**
- Consistent data-testid attributes for E2E testing
- Greek localization throughout all interfaces
- Status banners with visual indicators (icons + colors)
- Responsive design with mobile-first approach

**Error Handling:**
- Server-side validation with meaningful error messages
- Client-side form validation with immediate feedback
- Network error handling with retry mechanisms
- Graceful degradation for API dependencies

### Security Implementation:

**Authentication Flow:**
- Mock token-based auth for development/testing
- Role hierarchy: consumer(1) < producer(2) < admin(3)
- Session management with intended destination tracking

**Authorization Guards:**
- Page-level protection with AuthGuard components
- API route protection with role verification
- Producer approval status checking before sensitive operations
- CSRF protection ready for production deployment

## File Statistics:
- **New Pages:** 3 (onboarding, admin producers, protected products)
- **New API Routes:** 6 (status, onboarding, admin list, approve, reject, products)
- **New Utilities:** 2 (auth-helpers, useProducerAuth hook)
- **E2E Tests:** 4 comprehensive scenarios
- **Total Implementation:** ~1,200 lines of code
- **Greek Localization:** 100% coverage for user-facing text