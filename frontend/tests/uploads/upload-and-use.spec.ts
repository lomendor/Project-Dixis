import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const phone = '+306912345685';
const bypass = process.env.OTP_BYPASS || '000000';

test.describe('Secure Uploads', () => {
  test('Upload image → create product → render image', async ({ request, page }) => {
    // 1. Login and get session
    await request.post(base + '/api/auth/request-otp', { data: { phone } });
    const vr = await request.post(base + '/api/auth/verify-otp', { data: { phone, code: bypass } });
    const cookies = await vr.headers();
    const sessMatch = cookies['set-cookie']?.match(/dixis_session=([^;]+)/);
    const sess = sessMatch?.[1] || '';
    if (!sess) throw new Error('No session');

    // 2. Create producer
    const make = await request.post(base + '/api/me/producers', {
      headers: { cookie: `dixis_session=${sess}` },
      data: { name: 'Upload Test', region: 'Αττική', category: 'Μέλι', email: 'upload@ex.com' }
    });
    expect(make.ok()).toBeTruthy();

    // 3. Create a test image (1x1 PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    const testImagePath = path.join(process.cwd(), '.tmp', 'test-upload.png');
    await fs.promises.mkdir(path.dirname(testImagePath), { recursive: true });
    await fs.promises.writeFile(testImagePath, testImageBuffer);

    // 4. Upload image
    const formData = new FormData();
    const blob = new Blob([testImageBuffer], { type: 'image/png' });
    formData.append('file', blob, 'test.png');

    const uploadRes = await request.post(base + '/api/me/uploads', {
      headers: { cookie: `dixis_session=${sess}` },
      multipart: {
        file: {
          name: 'test.png',
          mimeType: 'image/png',
          buffer: testImageBuffer
        }
      }
    });
    expect(uploadRes.ok()).toBeTruthy();
    const uploadData = await uploadRes.json();
    expect(uploadData.url).toBeTruthy();
    const imageUrl = uploadData.url;

    // 5. Create product with uploaded image
    const productRes = await request.post(base + '/api/me/products', {
      headers: { cookie: `dixis_session=${sess}` },
      data: {
        title: 'Μέλι με Εικόνα',
        category: 'Μέλι',
        price: 15,
        stock: 10,
        unit: 'τεμ',
        images: [{ url: imageUrl, altText: 'Μέλι' }]
      }
    });
    expect(productRes.ok()).toBeTruthy();
    const productData = await productRes.json();
    const productId = productData.item.id;

    // 6. Verify image renders on product page
    await page.goto(base + '/products/' + productId);
    const img = page.locator(`img[src*="${imageUrl.replace(/^\//, '')}"]`).first();
    await expect(img).toBeVisible({ timeout: 10000 });

    // Cleanup
    await fs.promises.unlink(testImagePath).catch(() => {});
  });

  test('Upload fails for unauthenticated user', async ({ request }) => {
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const uploadRes = await request.post(base + '/api/me/uploads', {
      multipart: {
        file: {
          name: 'test.png',
          mimeType: 'image/png',
          buffer: testImageBuffer
        }
      }
    });
    expect(uploadRes.status()).toBe(401);
  });

  test('Upload fails for file too large (>5MB)', async ({ request }) => {
    // Login
    await request.post(base + '/api/auth/request-otp', { data: { phone } });
    const vr = await request.post(base + '/api/auth/verify-otp', {
      data: { phone, code: bypass }
    });
    const cookies = await vr.headers();
    const sessMatch = cookies['set-cookie']?.match(/dixis_session=([^;]+)/);
    const sess = sessMatch?.[1] || '';

    // Create 6MB buffer
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024);

    const uploadRes = await request.post(base + '/api/me/uploads', {
      headers: { cookie: `dixis_session=${sess}` },
      multipart: {
        file: {
          name: 'large.png',
          mimeType: 'image/png',
          buffer: largeBuffer
        }
      }
    });
    expect(uploadRes.status()).toBe(413);
  });

  test('Upload fails for invalid MIME type', async ({ request }) => {
    // Login
    await request.post(base + '/api/auth/request-otp', { data: { phone } });
    const vr = await request.post(base + '/api/auth/verify-otp', {
      data: { phone, code: bypass }
    });
    const cookies = await vr.headers();
    const sessMatch = cookies['set-cookie']?.match(/dixis_session=([^;]+)/);
    const sess = sessMatch?.[1] || '';

    const testBuffer = Buffer.from('test file content');

    const uploadRes = await request.post(base + '/api/me/uploads', {
      headers: { cookie: `dixis_session=${sess}` },
      multipart: {
        file: {
          name: 'test.txt',
          mimeType: 'text/plain',
          buffer: testBuffer
        }
      }
    });
    expect(uploadRes.status()).toBe(415);
  });

  test('Upload succeeds for all allowed MIME types', async ({ request }) => {
    // Login
    await request.post(base + '/api/auth/request-otp', { data: { phone } });
    const vr = await request.post(base + '/api/auth/verify-otp', {
      data: { phone, code: bypass }
    });
    const cookies = await vr.headers();
    const sessMatch = cookies['set-cookie']?.match(/dixis_session=([^;]+)/);
    const sess = sessMatch?.[1] || '';

    // Create producer if needed
    await request.post(base + '/api/me/producers', {
      headers: { cookie: `dixis_session=${sess}` },
      data: { name: 'Upload Test 2', region: 'Αττική', category: 'Μέλι', email: 'upload2@ex.com' }
    });

    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const mimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    for (const mimeType of mimeTypes) {
      const uploadRes = await request.post(base + '/api/me/uploads', {
        headers: { cookie: `dixis_session=${sess}` },
        multipart: {
          file: {
            name: `test.${mimeType.split('/')[1]}`,
            mimeType,
            buffer: testImageBuffer
          }
        }
      });
      expect(uploadRes.ok()).toBeTruthy();
      const data = await uploadRes.json();
      expect(data.url).toBeTruthy();
    }
  });
});
