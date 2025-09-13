# Testing Guidelines

## Checkout API Testing Patterns

### MSW Stubbing Strategy

The checkout API tests use Mock Service Worker (MSW) for reliable API mocking:

```typescript
// Standard success responses
export const checkoutHandlers = [
  http.get(`${API_BASE}/cart/items`, () => {
    return HttpResponse.json({
      cart_items: [{ id: 1, product: { name: 'Test' }, quantity: 2 }],
      total_amount: '31.00'
    })
  })
]

// Error scenario handlers  
export const checkoutErrorHandlers = [
  http.post(`${API_BASE}/orders/checkout`, () => {
    return HttpResponse.json({ error: 'Server error' }, { status: 500 })
  })
]
```

### Retry Strategy Testing

When testing retry logic with `retryWithBackoff`:

```typescript
// Test with controlled timing
vi.useFakeTimers()
const mockFn = vi.fn()
  .mockRejectedValueOnce(new Error('Fail'))  
  .mockResolvedValue('success')

await retryWithBackoff(mockFn, { retries: 2, baseMs: 100, jitter: false })
```

### Greek Postal Code Edge Cases

Test postal code validation for Greek addresses:

```typescript
// Valid Greek postal codes: 5 digits
'10671' // Athens center
'84100' // Syros (islands)

// Invalid formats
'123'   // Too short
'12345678' // Too long  
```

### Performance Testing Patterns

For concurrent operations testing:

```typescript
const operations = Array(3).fill(null).map(() => checkoutApi.getValidatedCart())
const results = await Promise.all(operations)
// Verify all succeed without race conditions
```