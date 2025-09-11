# 🔧 MSW Mocks Alignment Analysis

## 📊 Current State Assessment  

### 🎭 Mock Implementation Comparison

| Aspect | `tests/msw/handlers.ts` | `tests/e2e/api-mocks.ts` |
|--------|------------------------|---------------------------|
| **Technology** | MSW v2 (`http`, `HttpResponse`) | Playwright Route Interception |
| **LOC** | 52 lines | 144 lines |
| **Usage** | Unit/Integration tests | E2E tests |
| **Data Quality** | Minimal/Empty | Rich Greek marketplace data |

### 🚩 **Critical Alignment Issues Identified**

#### 1. **Missing API Coverage in MSW Handlers**
```typescript
// ❌ Missing from handlers.ts but exists in api-mocks.ts:
- GET /api/v1/orders
- GET /api/v1/categories  
- POST /api/v1/checkout
- GET /api/v1/auth/profile
```

#### 2. **Response Structure Inconsistencies**
```typescript
// handlers.ts (basic)
return HttpResponse.json([{ id: 1, name: "Mock Product" }])

// api-mocks.ts (paginated)  
return route.fulfill({
  body: JSON.stringify({ 
    data: mockProducts, 
    total: mockProducts.length 
  })
})
```

#### 3. **Mock Data Quality Gap**
```typescript
// handlers.ts: Empty/minimal data
{ items: [] }

// api-mocks.ts: Rich realistic data
{
  id: 1,
  name: 'Ελαιόλαδο Κρήτης',
  price: '15.50',
  producer: { name: 'Κρητικός Παραγωγός', region: 'Heraklion' }
}
```

## 🎯 **Alignment Strategy**

### Phase 1: API Coverage Alignment (≤100 LOC)
- Add missing endpoints to `handlers.ts`
- Ensure consistent response structures

### Phase 2: Data Quality Enhancement (≤100 LOC)  
- Port rich mock data from `api-mocks.ts` to `handlers.ts`
- Maintain Greek marketplace context

## 🔬 **Implementation Priorities**

1. **HIGH**: Missing endpoints alignment
2. **MEDIUM**: Response structure consistency  
3. **LOW**: Mock data enhancement (if budget allows)

**Total Estimated LOC**: ~150-180 (within ≤200 budget)

---
*Generated during PR-B: E2E-Docs MSW Mocks Alignment*