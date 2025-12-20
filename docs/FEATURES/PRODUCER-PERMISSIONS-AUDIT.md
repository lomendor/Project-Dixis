# PRODUCER PERMISSIONS AUDIT (Stage 2) — AUDIT ONLY

## Objective
Prove whether producers can ONLY manage their own products/orders and admin can override safely.

## Evidence collected (paths)
- Backend policies/guards:
- Backend routes/controllers:
- Frontend dashboard filtering:
- Tests that cover this:

## Findings (facts)
### Product ownership enforcement
- Expected:
- Actual:
- Gaps/Risks:

### Producer dashboard visibility
- Expected:
- Actual:
- Gaps/Risks:

### Admin override
- Expected:
- Actual:
- Gaps/Risks:

## Decision
PASS/FAIL.
If FAIL: smallest fix scope for next pass + DoD.

## Quick grep snippets

### Backend Policies/Authorization
backend/app/Providers/AuthServiceProvider.php:8:use App\Policies\ProductPolicy;
backend/app/Providers/AuthServiceProvider.php:20:        Product::class => ProductPolicy::class,
backend/app/Policies/ProductPolicy.php:8:class ProductPolicy
backend/app/Policies/ProductPolicy.php:48:            return $user->producer && $product->producer_id === $user->producer->id;
backend/app/Http/Controllers/Api/V1/ProductController.php:106:        $this->authorize('create', Product::class);
backend/app/Http/Controllers/Api/V1/ProductController.php:111:        // Security: Auto-set producer_id from authenticated user (server-side)
backend/app/Http/Controllers/Api/V1/ProductController.php:119:            $data['producer_id'] = $user->producer->id;
backend/app/Http/Controllers/Api/V1/ProductController.php:121:        // Admin can specify producer_id from request (already validated)
backend/app/Http/Controllers/Api/V1/ProductController.php:153:        $this->authorize('update', $product);
backend/app/Http/Controllers/Api/V1/ProductController.php:173:        $this->authorize('delete', $product);
backend/app/Http/Controllers/Api/ProducerController.php:31:        if ($product->producer_id !== $user->producer->id) {
backend/app/Http/Controllers/Api/ProducerController.php:113:        if ($product->producer_id !== $user->producer->id) {
backend/app/Http/Controllers/Api/Producer/ProducerOrderController.php:49:                $q->where('producer_id', $producerId);
backend/app/Http/Controllers/Api/Producer/ProducerOrderController.php:101:                $q->where('producer_id', $producerId);
backend/app/Http/Controllers/Api/Producer/ProducerOrderController.php:168:            $q->where('producer_id', $producerId);
backend/app/Services/ProducerAnalyticsService.php:23:        $productIds = Product::where('producer_id', $producerId)->pluck('id');
backend/app/Services/ProducerAnalyticsService.php:75:        $productIds = Product::where('producer_id', $producerId)->pluck('id');
backend/app/Services/ProducerAnalyticsService.php:133:        $topProducts = Product::where('producer_id', $producerId)
backend/app/Services/ProducerAnalyticsService.php:162:        $allProducts = Product::where('producer_id', $producerId);

### Frontend Dashboard/Producer Filtering
frontend/src/components/Navigation.tsx:116:                  href="/producer/dashboard"
frontend/src/components/Navigation.tsx:221:                  href="/producer/dashboard"
frontend/src/hooks/useProducerAuth.ts:21: * Hook for producer-specific authentication and authorization
frontend/src/hooks/useProducerAuth.ts:22: * Provides producer profile status and access control
frontend/src/hooks/useProducerAuth.ts:136:    if (path.startsWith('/producer')) {
frontend/src/hooks/useProducerAuth.ts:137:      // Must be authenticated producer
frontend/src/hooks/useProducerAuth.ts:138:      if (user?.role !== 'producer') {
frontend/src/hooks/useProducerAuth.ts:147:      if (path.startsWith('/producer/products')) {
frontend/src/components/AuthGuard.tsx:10:  requireRole?: 'consumer' | 'producer' | 'admin';
frontend/src/components/AuthGuard.tsx:40:      const destination = user.role === 'producer' ? '/producer/dashboard' : '/';
frontend/src/lib/api.ts:479:    return this.request<ProducerKpi>('producer/dashboard/kpi');
frontend/src/lib/api.ts:483:    return this.request<ProducerStats>('producer/dashboard/stats');
frontend/src/lib/api.ts:487:    const endpoint = `producer/dashboard/top-products${limit ? `?limit=${limit}` : ''}`;
frontend/src/lib/api.ts:521:    const endpoint = `producer/products${queryString ? `?${queryString}` : ''}`;
frontend/src/lib/api.ts:554:    const endpoint = `producer/orders${status ? `?status=${status}` : ''}`;
frontend/src/lib/api/producer-analytics.ts:21:// Producer-specific analytics interfaces (same structure as admin but scoped to producer)
frontend/src/lib/api/producer-analytics.ts:27:export const producerAnalyticsApi = {
frontend/src/lib/api/producer-analytics.ts:42:    const response = await fetch(`${API_BASE_URL}/producer/analytics/sales?${params}`, {
frontend/src/lib/api/producer-analytics.ts:52:        throw new Error('Producer access required. Please ensure you are associated with a producer.');
