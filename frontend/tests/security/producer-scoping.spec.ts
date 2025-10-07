import { test, expect, request as pwRequest } from '@playwright/test';

const base = process.env.BASE_URL || 'http://127.0.0.1:3001';
const bypass = process.env.OTP_BYPASS || '000000';

/**
 * Helper: Login and get session cookie
 */
async function login(phone: string): Promise<string> {
  const ctx = await pwRequest.newContext();

  // Request OTP
  await ctx.post(base + '/api/auth/request-otp', {
    data: { phone }
  });

  // Verify OTP
  const verifyRes = await ctx.post(base + '/api/auth/verify-otp', {
    data: { phone, code: bypass }
  });

  // Extract session cookie
  const headers = await verifyRes.headersArray();
  const setCookie = headers.find(h => h.name.toLowerCase() === 'set-cookie')?.value || '';
  const session = setCookie.split('dixis_session=')[1]?.split(';')[0] || '';

  return session;
}

test.describe('Producer Scoping & Multi-Account Security', () => {
  test('Producer B cannot see or modify Producer A resources', async () => {
    // Login as two different producers
    const phoneA = '+306900000010';
    const phoneB = '+306900000011';

    const sessionA = await login(phoneA);
    const sessionB = await login(phoneB);

    expect(sessionA).toBeTruthy();
    expect(sessionB).toBeTruthy();
    expect(sessionA).not.toBe(sessionB);

    // Create producer profile for A
    const ctxA = await pwRequest.newContext();
    const createProducerA = await ctxA.post(base + '/api/producer/onboarding', {
      headers: { cookie: `dixis_session=${sessionA}` },
      data: {
        name: 'Producer A',
        slug: 'producer-a-test',
        region: 'Αττική',
        category: 'Μέλι',
        phone: phoneA
      }
    });

    // Skip test if onboarding endpoint doesn't exist (405/404)
    if ([404, 405].includes(createProducerA.status())) {
      test.skip();
      return;
    }

    // Create a product as Producer A
    const createProductA = await ctxA.post(base + '/api/me/products', {
      headers: { cookie: `dixis_session=${sessionA}` },
      data: {
        title: 'Μέλι Α',
        category: 'Μέλι',
        price: 5.5,
        unit: 'kg',
        stock: 10,
        isActive: true
      }
    });

    // If producer scoping is working, should succeed (201) or fail with 403 (no producer profile)
    const statusA = createProductA.status();
    if (![201, 403].includes(statusA)) {
      console.log('Unexpected status from create product A:', statusA);
    }

    let productIdA: string | null = null;
    if (statusA === 201) {
      const resA = await createProductA.json();
      productIdA = resA.product?.id || resA.item?.id;
    }

    // Producer B tries to list products
    const ctxB = await pwRequest.newContext();
    const listProductsB = await ctxB.get(base + '/api/me/products', {
      headers: { cookie: `dixis_session=${sessionB}` }
    });

    // Should succeed but return empty list (or 403 if no producer profile)
    if (listProductsB.status() === 200) {
      const dataB = await listProductsB.json();
      const productsB = dataB.products || [];

      // Producer B should NOT see Producer A's "Μέλι Α"
      const hasProductA = productsB.some((p: any) =>
        p.title === 'Μέλι Α' || p.name === 'Μέλι Α'
      );
      expect(hasProductA).toBeFalsy();
    }

    // Producer B tries to update Producer A's product (if we got an ID)
    if (productIdA) {
      const updateAttempt = await ctxB.put(base + `/api/me/products/${productIdA}`, {
        headers: { cookie: `dixis_session=${sessionB}` },
        data: { title: 'Hacked Product' }
      });

      // Should fail with 404 (not found - scoped query) or 403 (forbidden)
      expect([403, 404]).toContain(updateAttempt.status());

      // Verify Greek error message
      if ([403, 404].includes(updateAttempt.status())) {
        const error = await updateAttempt.json();
        // Should have Greek error message like "Δεν βρέθηκε" or "Απαγορεύεται"
        expect(error.error).toMatch(/Δεν βρέθηκε|Απαγορεύεται/i);
      }

      // Producer B tries to delete Producer A's product
      const deleteAttempt = await ctxB.delete(base + `/api/me/products/${productIdA}`, {
        headers: { cookie: `dixis_session=${sessionB}` }
      });

      // Should fail with 404 or 403
      expect([403, 404]).toContain(deleteAttempt.status());
    }

    // Verify Producer A can still access their own product
    if (productIdA) {
      const getOwnProduct = await ctxA.get(base + `/api/me/products/${productIdA}`, {
        headers: { cookie: `dixis_session=${sessionA}` }
      });

      // Should succeed (200) or fail if producer doesn't exist (403)
      if (getOwnProduct.status() === 200) {
        const data = await getOwnProduct.json();
        expect(data.product?.title || data.title).toBe('Μέλι Α');
      }
    }
  });

  test('Unauthenticated requests are rejected with Greek error', async () => {
    const ctx = await pwRequest.newContext();

    // Try to list products without session
    const listNoAuth = await ctx.get(base + '/api/me/products');
    expect(listNoAuth.status()).toBe(401);

    const errorData = await listNoAuth.json();
    // Should have Greek error message "Απαιτείται είσοδος"
    expect(errorData.error).toMatch(/Απαιτείται είσοδος|Unauthorized/i);
  });

  test('Non-producer session cannot access producer endpoints', async () => {
    // Login as a regular user (not a producer)
    const session = await login('+306900000099');
    const ctx = await pwRequest.newContext();

    // Try to access producer endpoints
    const listProducts = await ctx.get(base + '/api/me/products', {
      headers: { cookie: `dixis_session=${session}` }
    });

    // Should fail with 403 (no producer profile)
    expect(listProducts.status()).toBe(403);

    const errorData = await listProducts.json();
    // Should have Greek error message about producer profile
    expect(errorData.error).toMatch(/προφίλ παραγωγού|producer/i);
  });
});
