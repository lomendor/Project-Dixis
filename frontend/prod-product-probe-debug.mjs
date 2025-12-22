import { chromium } from "playwright";
const url = "https://www.dixis.gr/products/1";
const run = async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const reqs = [];
  const consoleLogs = [];
  
  p.on("console", msg => {
    consoleLogs.push({type: msg.type(), text: msg.text()});
  });
  
  p.on("requestfailed", r => reqs.push({type:"failed", url:r.url(), err:r.failure()?.errorText}));
  p.on("response", async (res) => {
    const u = res.url();
    if (u.includes("/api/v1/") || u.includes("/products/1")) {
      reqs.push({type:"api", url:u, status:res.status()});
    }
  });

  await p.goto(url, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(3000);

  const bodyText = await p.textContent("body");
  const hasTomatoes = bodyText?.includes("Organic Tomatoes");
  const hasErrorEL = bodyText?.includes("Σφάλμα φόρτωσης προϊόντος");
  const skeletonCount = await p.locator(".animate-pulse").count();
  const hasProductTitle = await p.locator('[data-testid="product-title"]').count();
  const hasProductPrice = await p.locator('[data-testid="product-price"]').count();

  await p.screenshot({ path: "/tmp/prod-products-1-debug.png", fullPage: true });
  console.log(JSON.stringify({
    url, hasTomatoes, hasErrorEL, skeletonCount, 
    hasProductTitle, hasProductPrice,
    apiCalls:reqs.filter(x=>x.type==="api"),
    failed:reqs.filter(x=>x.type==="failed").slice(0,10),
    consoleErrors: consoleLogs.filter(x => x.type === 'error').slice(0,5)
  }, null, 2));

  await b.close();
};
run().catch(e => { console.error(e); process.exit(1); });
