import { test, expect } from '@playwright/test';

const basic = process.env.BASIC_AUTH
  ? 'Basic ' + Buffer.from(process.env.BASIC_AUTH).toString('base64')
  : '';

test('uploads: 401 without auth', async ({ request }) => {
  const res = await request.post('/api/uploads', {
    multipart: {
      file: {
        name: 'test.png',
        mimeType: 'image/png',
        buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
      },
    },
  });

  expect(res.status()).toBe(401);
  const wwwAuth = res.headers()['www-authenticate'];
  expect(wwwAuth).toContain('Basic');
});

test('uploads: 200 with auth', async ({ request }) => {
  test.skip(!basic, 'no BASIC_AUTH provided');

  // Create a minimal valid WebP file header
  const webpBuffer = Buffer.from([
    0x52, 0x49, 0x46, 0x46, // 'RIFF'
    0x1a, 0x00, 0x00, 0x00, // File size (26 bytes)
    0x57, 0x45, 0x42, 0x50, // 'WEBP'
    0x56, 0x50, 0x38, 0x20, // 'VP8 '
    0x0e, 0x00, 0x00, 0x00, // Chunk size
    0x00, 0x00, 0x00, 0x00, // VP8 data (minimal)
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00,
  ]);

  const res = await request.post('/api/uploads', {
    headers: { authorization: basic },
    multipart: {
      file: {
        name: 'test.webp',
        mimeType: 'image/webp',
        buffer: webpBuffer,
      },
    },
  });

  expect(res.ok()).toBeTruthy();
  const j = await res.json();
  expect(j.url).toContain('/uploads/');
  expect(j.url).toMatch(/\/uploads\/[a-f0-9-]+\.webp$/);
});
