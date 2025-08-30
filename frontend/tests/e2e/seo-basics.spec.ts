import { test, expect } from '@playwright/test';

test.describe('SEO Basics Implementation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Meta Tags and Basic SEO', () => {
    test('homepage has proper title and meta description', async ({ page }) => {
      // Check page title
      const title = await page.title();
      expect(title).toContain('Fresh Local Products from Greek Producers');
      expect(title).toContain('Project Dixis');
      
      // Check meta description
      const metaDescription = page.locator('meta[name=\"description\"]');
      await expect(metaDescription).toHaveAttribute('content', /premium organic vegetables.*Greek producers/);
      
      // Check meta keywords
      const metaKeywords = page.locator('meta[name=\"keywords\"]');
      const keywordsContent = await metaKeywords.getAttribute('content');
      expect(keywordsContent).toContain('fresh vegetables Greece');
      expect(keywordsContent).toContain('organic fruits');
    });

    test('has proper language and character encoding', async ({ page }) => {
      // Check HTML lang attribute
      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBe('el-GR');
      
      // Check viewport meta tag
      const viewport = page.locator('meta[name=\"viewport\"]');
      await expect(viewport).toHaveAttribute('content', /width=device-width/);
    });

    test('has canonical URL', async ({ page }) => {
      const canonical = page.locator('link[rel=\"canonical\"]');
      await expect(canonical).toBeAttached();
      
      const canonicalUrl = await canonical.getAttribute('href');
      expect(canonicalUrl).toBeTruthy();
    });
  });

  test.describe('OpenGraph and Social Media', () => {
    test('has OpenGraph meta tags', async ({ page }) => {
      // OG Title
      const ogTitle = page.locator('meta[property=\"og:title\"]');
      await expect(ogTitle).toBeAttached();
      const ogTitleContent = await ogTitle.getAttribute('content');
      expect(ogTitleContent).toContain('Greek Producers');
      
      // OG Description
      const ogDescription = page.locator('meta[property=\"og:description\"]');
      await expect(ogDescription).toBeAttached();
      
      // OG Image
      const ogImage = page.locator('meta[property=\"og:image\"]');
      await expect(ogImage).toBeAttached();
      
      // OG Type
      const ogType = page.locator('meta[property=\"og:type\"]');
      await expect(ogType).toHaveAttribute('content', 'website');
      
      // OG URL
      const ogUrl = page.locator('meta[property=\"og:url\"]');
      await expect(ogUrl).toBeAttached();
    });

    test('has Twitter Card meta tags', async ({ page }) => {
      // Twitter Card type
      const twitterCard = page.locator('meta[name=\"twitter:card\"]');
      await expect(twitterCard).toHaveAttribute('content', 'summary_large_image');
      
      // Twitter title
      const twitterTitle = page.locator('meta[name=\"twitter:title\"]');
      await expect(twitterTitle).toBeAttached();
      
      // Twitter description
      const twitterDescription = page.locator('meta[name=\"twitter:description\"]');
      await expect(twitterDescription).toBeAttached();
      
      // Twitter image
      const twitterImage = page.locator('meta[name=\"twitter:image\"]');
      await expect(twitterImage).toBeAttached();
    });
  });

  test.describe('Structured Data (JSON-LD)', () => {
    test('has website structured data', async ({ page }) => {
      // Check for JSON-LD script tags
      const jsonLdScripts = page.locator('script[type="application/ld+json"]');
      const scriptCount = await jsonLdScripts.count();
      expect(scriptCount).toBeGreaterThan(0);
      
      // Check website schema
      const websiteSchema = await page.locator('script[type="application/ld+json"]').first().textContent();
      expect(websiteSchema).toBeTruthy();
      
      const websiteData = JSON.parse(websiteSchema!);
      expect(websiteData['@type']).toBe('WebSite');
      expect(websiteData.name).toBe('Project Dixis');
      expect(websiteData.url).toBeTruthy();
      expect(websiteData.potentialAction).toBeTruthy();
    });

    test('has organization structured data', async ({ page }) => {
      // Get all JSON-LD scripts
      const jsonLdScripts = await page.locator('script[type="application/ld+json"]').all();
      
      // Look for organization schema
      let foundOrganization = false;
      for (const script of jsonLdScripts) {
        const content = await script.textContent();
        if (content) {
          const data = JSON.parse(content);
          if (data['@type'] === 'Organization') {
            foundOrganization = true;
            expect(data.name).toBe('Project Dixis');
            expect(data.url).toBeTruthy();
            expect(data.logo).toBeTruthy();
            expect(data.sameAs).toBeInstanceOf(Array);
            break;
          }
        }
      }
      expect(foundOrganization).toBe(true);
    });

    test('has products structured data when products load', async ({ page }) => {
      // Wait for products to load
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
      
      // Check if products JSON-LD was added
      const jsonLdScripts = await page.locator('script[type="application/ld+json"]').all();
      
      let foundProducts = false;
      for (const script of jsonLdScripts) {
        const content = await script.textContent();
        if (content) {
          const data = JSON.parse(content);
          if (data['@type'] === 'ItemList') {
            foundProducts = true;
            expect(data.name).toBe('Fresh Local Products');
            expect(data.itemListElement).toBeInstanceOf(Array);
            expect(data.numberOfItems).toBeGreaterThan(0);
            
            // Check first product item
            if (data.itemListElement.length > 0) {
              const firstProduct = data.itemListElement[0];
              expect(firstProduct['@type']).toBe('Product');
              expect(firstProduct.name).toBeTruthy();
              expect(firstProduct.offers).toBeTruthy();
            }
            break;
          }
        }
      }
      expect(foundProducts).toBe(true);
    });
  });

  test.describe('Technical SEO', () => {
    test('robots.txt is accessible', async ({ page }) => {
      const response = await page.goto('/robots.txt');
      expect(response?.status()).toBe(200);
      
      const content = await page.textContent('body');
      expect(content).toContain('User-agent: *');
      expect(content).toContain('Allow: /');
      expect(content).toContain('Disallow: /admin');
      expect(content).toContain('Sitemap:');
    });

    test('sitemap.xml is accessible', async ({ page }) => {
      const response = await page.goto('/sitemap.xml');
      expect(response?.status()).toBe(200);
      
      // Check if it's valid XML
      const content = await page.content();
      expect(content).toContain('<urlset');
      expect(content).toContain('<url>');
      expect(content).toContain('<loc>');
      expect(content).toContain('<lastmod>');
      expect(content).toContain('<changefreq>');
      expect(content).toContain('<priority>');
    });

    test('manifest.json is accessible', async ({ page }) => {
      const response = await page.goto('/manifest.json');
      expect(response?.status()).toBe(200);
      
      const content = await page.textContent('body');
      const manifest = JSON.parse(content!);
      
      expect(manifest.name).toBe('Project Dixis - Local Producer Marketplace');
      expect(manifest.short_name).toBe('Dixis');
      expect(manifest.display).toBe('standalone');
      expect(manifest.theme_color).toBe('#16a34a');
      expect(manifest.icons).toBeInstanceOf(Array);
      expect(manifest.icons.length).toBeGreaterThan(0);
    });

    test('has proper heading hierarchy', async ({ page }) => {
      // Check for h1
      const h1 = page.locator('h1');
      await expect(h1).toBeVisible();
      const h1Count = await h1.count();
      expect(h1Count).toBe(1); // Should have exactly one h1
      
      // Check h1 content
      const h1Text = await h1.textContent();
      expect(h1Text).toContain('Fresh Products from Local Producers');
    });

    test('images have alt attributes', async ({ page }) => {
      await page.waitForSelector('[data-testid="product-image"]', { timeout: 10000 });
      
      const images = page.locator('[data-testid="product-image"]');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        // Check first few images
        for (let i = 0; i < Math.min(imageCount, 3); i++) {
          const image = images.nth(i);
          const alt = await image.getAttribute('alt');
          expect(alt).toBeTruthy();
          expect(alt!.length).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Performance and Core Web Vitals', () => {
    test('page loads within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForSelector('[data-testid="page-title"]');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(5000); // 5 seconds max
    });

    test('has proper meta tags for mobile', async ({ page }) => {
      // Check viewport meta tag
      const viewport = page.locator('meta[name="viewport"]');
      await expect(viewport).toBeAttached();
      
      const viewportContent = await viewport.getAttribute('content');
      expect(viewportContent).toContain('width=device-width');
      expect(viewportContent).toContain('initial-scale=1');
    });

    test('responds properly to different viewport sizes', async ({ page }) => {
      // Test desktop
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.goto('/');
      await expect(page.getByTestId('page-title')).toBeVisible();
      
      // Test mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.getByTestId('page-title')).toBeVisible();
      
      // Test tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.getByTestId('page-title')).toBeVisible();
    });
  });

  test.describe('Content Quality', () => {
    test('has descriptive page content', async ({ page }) => {
      // Check main heading
      const heading = page.getByTestId('page-title');
      await expect(heading).toBeVisible();
      
      // Check for descriptive paragraph
      const description = page.locator('p:has-text("Discover premium organic vegetables")');
      await expect(description).toBeVisible();
      
      const descriptionText = await description.textContent();
      expect(descriptionText!.length).toBeGreaterThan(100); // Substantial content
    });

    test('search functionality has proper structure', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search products...');
      await expect(searchInput).toBeVisible();
      
      // Test search functionality
      await searchInput.fill('organic');
      // Could add more search tests here
    });

    test('navigation has proper structure', async ({ page }) => {
      const nav = page.locator('nav[role="navigation"]');
      await expect(nav).toBeVisible();
      
      // Check for proper ARIA labels
      const ariaLabel = await nav.getAttribute('aria-label');
      expect(ariaLabel).toBe('Main navigation');
    });
  });
});"}