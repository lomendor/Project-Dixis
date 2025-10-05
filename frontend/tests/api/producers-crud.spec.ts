import { test, expect } from '@playwright/test';

test('[api] CRUD producers', async ({ request }) => {
  const base = process.env.BASE_URL || 'http://127.0.0.1:3000';

  // Create
  const create = await request.post(base + '/api/producers', {
    data: {
      slug: 'demo-' + Date.now(),
      name: 'Δοκιμή',
      region: 'Αττική',
      category: 'Μέλι',
      products: 1
    }
  });
  expect(create.ok()).toBeTruthy();
  const c = await create.json();
  const id = c.id;
  expect(id).toBeTruthy();

  // Update
  const patch = await request.patch(base + '/api/producers/' + id, {
    data: { products: 2 }
  });
  expect(patch.ok()).toBeTruthy();
  const updated = await patch.json();
  expect(updated.products).toBe(2);

  // Delete (soft delete)
  const del = await request.delete(base + '/api/producers/' + id);
  expect(del.ok()).toBeTruthy();
  const deleted = await deleted.json();
  expect(deleted.isActive).toBe(false);
});
