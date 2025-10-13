import { test, expect, request as pwRequest } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001';
const bypass = process.env.OTP_BYPASS || '000000';
const adminPhone = (process.env.ADMIN_PHONES || '+306900000084').split(',')[0];

test.describe('Cookie Security Attributes', () => {
  test('dixis_session cookie has correct security attributes', async () => {
    test.skip(!bypass, 'OTP_BYPASS not configured');

    const ctx = await pwRequest.newContext();

    try {
      // Step 1: Request OTP
      await ctx.post(base + '/api/auth/request-otp', {
        data: { phone: adminPhone }
      });

      // Step 2: Verify OTP and get cookie
      const verifyResponse = await ctx.post(base + '/api/auth/verify-otp', {
        data: { phone: adminPhone, code: bypass }
      });

      expect(verifyResponse.ok()).toBeTruthy();

      // Step 3: Extract Set-Cookie header
      const headers = await verifyResponse.headersArray();
      const setCookieHeader = headers.find((h) => h.name.toLowerCase() === 'set-cookie');

      expect(setCookieHeader).toBeDefined();
      const cookieValue = setCookieHeader?.value || '';

      // Step 4: Verify cookie attributes
      // HttpOnly: Προστασία από XSS
      expect(cookieValue).toContain('HttpOnly');

      // SameSite=lax: Προστασία από CSRF
      expect(cookieValue).toMatch(/SameSite=(lax|Lax)/i);

      // Path=/: Cookie διαθέσιμο σε όλα τα paths
      expect(cookieValue).toContain('Path=/');

      // Max-Age: 7 days = 604800 seconds
      expect(cookieValue).toContain('Max-Age=604800');

      // Secure: HTTPS-only σε production (όχι σε local/test)
      const isProd = process.env.DIXIS_ENV === 'production' || process.env.NODE_ENV === 'production';
      if (isProd) {
        expect(cookieValue).toContain('Secure');
      }

      // Cookie name and value format
      expect(cookieValue).toMatch(/dixis_session=[^;]+/);

      console.log('✅ Cookie security attributes verified:', {
        httpOnly: cookieValue.includes('HttpOnly'),
        sameSite: /SameSite=(lax|Lax)/i.test(cookieValue),
        path: cookieValue.includes('Path=/'),
        maxAge: cookieValue.includes('Max-Age=604800'),
        secure: isProd ? cookieValue.includes('Secure') : 'N/A (non-prod)',
      });

    } finally {
      await ctx.dispose();
    }
  });

  test('cookie attributes prevent common attacks', async () => {
    test.skip(!bypass, 'OTP_BYPASS not configured');

    const ctx = await pwRequest.newContext();

    try {
      await ctx.post(base + '/api/auth/request-otp', { data: { phone: adminPhone } });
      const vr = await ctx.post(base + '/api/auth/verify-otp', {
        data: { phone: adminPhone, code: bypass }
      });

      const headers = await vr.headersArray();
      const setCookie = headers.find((h) => h.name.toLowerCase() === 'set-cookie')?.value || '';

      // HttpOnly prevents JavaScript access (XSS protection)
      expect(setCookie).toContain('HttpOnly');

      // SameSite=lax prevents CSRF attacks
      expect(setCookie).toMatch(/SameSite=(lax|Lax)/i);

      // MaxAge ensures session expiration (not permanent)
      expect(setCookie).toMatch(/Max-Age=\d+/);

    } finally {
      await ctx.dispose();
    }
  });
});
