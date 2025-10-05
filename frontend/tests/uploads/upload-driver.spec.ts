import { test, expect } from '@playwright/test';

const basic = process.env.BASIC_AUTH
  ? 'Basic ' + Buffer.from(process.env.BASIC_AUTH).toString('base64')
  : '';

test('uploads: rejects without auth', async ({ request }) => {
  const res = await request.post('/api/uploads', {
    multipart: {
      file: {
        name: 'x.png',
        mimeType: 'image/png',
        buffer: Buffer.from([0x89]),
      },
    },
  });
  expect(res.status()).toBe(401);
});

test('uploads: returns url in fs or s3 mode (with auth)', async ({ request }) => {
  test.skip(!basic, 'no BASIC_AUTH provided');

  // Create a minimal valid WebP file header
  const webpBuffer = Buffer.from([
    0x52, 0x49, 0x46, 0x46, // 'RIFF'
    0x1a, 0x00, 0x00, 0x00, // File size
    0x57, 0x45, 0x42, 0x50, // 'WEBP'
    0x56, 0x50, 0x38, 0x20, // 'VP8 '
    0x0e, 0x00, 0x00, 0x00, // Chunk size
    0x00, 0x00, 0x00, 0x00, // VP8 data
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

  // Accept both "/uploads/..." (fs) or "http(s)://..." (s3)
  expect(typeof j.url).toBe('string');
  expect(j.url.startsWith('/uploads/') || /^https?:\/\//.test(j.url)).toBeTruthy();

  // Should always have a key
  expect(typeof j.key).toBe('string');
  expect(j.key.length).toBeGreaterThan(0);
});

test('uploads: validates file type', async ({ request }) => {
  test.skip(!basic, 'no BASIC_AUTH provided');

  const res = await request.post('/api/uploads', {
    headers: { authorization: basic },
    multipart: {
      file: {
        name: 'test.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('test'),
      },
    },
  });

  expect(res.status()).toBe(415);
  const j = await res.json();
  expect(j.error).toContain('not allowed');
});

test('uploads: validates file size', async ({ request }) => {
  test.skip(!basic, 'no BASIC_AUTH provided');

  // Create a buffer larger than 2MB
  const largeBuffer = Buffer.alloc(3 * 1024 * 1024);

  const res = await request.post('/api/uploads', {
    headers: { authorization: basic },
    multipart: {
      file: {
        name: 'large.png',
        mimeType: 'image/png',
        buffer: largeBuffer,
      },
    },
  });

  expect(res.status()).toBe(413);
  const j = await res.json();
  expect(j.error).toContain('too large');
});
