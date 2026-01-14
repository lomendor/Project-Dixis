/**
 * Tests for API URL construction
 *
 * These tests verify that auth endpoints are correctly constructed
 * with absolute paths (starting with /) to prevent 404 errors.
 *
 * Bug context: Login 404 can occur if path is "api/v1/auth/login"
 * instead of "/api/v1/auth/login"
 */

import { apiUrl } from '@/lib/api';

describe('apiUrl', () => {
  describe('path normalization', () => {
    it('should construct auth/login path correctly (NOT 404)', () => {
      const url = apiUrl('auth/login');

      // Must start with / for absolute path
      expect(url.startsWith('/')).toBe(true);

      // Must contain the full path
      expect(url).toContain('auth/login');

      // Should NOT have double slashes (except in protocol)
      expect(url.match(/[^:]\/\//)).toBeNull();
    });

    it('should construct auth/register path correctly', () => {
      const url = apiUrl('auth/register');

      expect(url.startsWith('/')).toBe(true);
      expect(url).toContain('auth/register');
    });

    it('should handle paths with leading slash', () => {
      const url = apiUrl('/auth/login');

      expect(url.startsWith('/')).toBe(true);
      expect(url).toContain('auth/login');
      // Should not have double slashes
      expect(url.match(/[^:]\/\//)).toBeNull();
    });

    it('should handle empty path', () => {
      const url = apiUrl('');

      // Should still return a valid base URL
      expect(url.startsWith('/') || url.startsWith('http')).toBe(true);
    });

    it('should preserve absolute HTTP URLs', () => {
      const externalUrl = 'https://example.com/api/endpoint';
      const url = apiUrl(externalUrl);

      expect(url).toBe(externalUrl);
    });

    it('should handle public/products path correctly', () => {
      const url = apiUrl('public/products');

      expect(url.startsWith('/')).toBe(true);
      expect(url).toContain('public/products');
    });
  });

  describe('auth endpoints specifically', () => {
    const authEndpoints = [
      'auth/login',
      'auth/register',
      'auth/logout',
      'auth/profile',
    ];

    authEndpoints.forEach(endpoint => {
      it(`should construct ${endpoint} with absolute path`, () => {
        const url = apiUrl(endpoint);

        // Critical: URL must be absolute (start with / or http)
        const isAbsolute = url.startsWith('/') || url.startsWith('http');
        expect(isAbsolute).toBe(true);

        // The endpoint should be in the URL
        expect(url).toContain(endpoint);
      });
    });
  });
});
