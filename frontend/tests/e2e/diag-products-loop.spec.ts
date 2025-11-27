import { test } from '@playwright/test';

const BASE = 'https://dixis.gr';

// Διαγνωστικό μόνο: δεν κάνει asserts, απλώς γράφει λεπτομερή logs για 12s
test('AG116.3 diag: /products reload loop — collect logs for 12s', async ({ page }) => {
  let navs = 0;
  const consoles: string[] = [];
  const errors: string[] = [];
  const responses: { status: number; url: string }[] = [];

  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) navs++;
  });

  page.on('console', (msg) => {
    consoles.push(`[console.${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', (err) => {
    errors.push(`[pageerror] ${String(err)}`);
  });

  page.on('response', (res) => {
    const u = res.url();
    const s = res.status();
    if (u.includes('/products') || u.includes('_next') || u.endsWith('.js') || u.endsWith('.css')) {
      responses.push({ status: s, url: u });
    }
  });

  await page.goto(`${BASE}/products`, { waitUntil: 'domcontentloaded' });

  // Καταγραφή current href ανά 500ms για να δούμε εάν αλλάζει συχνά
  await page.addInitScript(() => {
    (window as any).__hrefHistory = [];
    setInterval(() => {
      (window as any).__hrefHistory.push(location.href);
    }, 500);
  });

  // Περιμένουμε 12s για να πιάσουμε το "τρέμουλο"
  await page.waitForTimeout(12_000);

  const hrefHistory = await page.evaluate(() => (window as any).__hrefHistory || []);
  // Τύπωσε σύνοψη (reads από τα CI logs)
  console.log('AG116.3 >>> SUMMARY');
  console.log(`navigations(main)=${navs}`);
  console.log(`console.count=${consoles.length}`, `pageerrors.count=${errors.length}`, `responses.count=${responses.length}`);
  console.log('href.sample=', hrefHistory.slice(-10)); // τελευταίες 10 εγγραφές
  console.log('--- top console lines ---');
  consoles.slice(0, 15).forEach(l => console.log(l));
  console.log('--- last console lines ---');
  consoles.slice(-15).forEach(l => console.log(l));
  console.log('--- last 15 responses ---');
  responses.slice(-15).forEach(r => console.log(`${r.status} ${r.url}`));
});
