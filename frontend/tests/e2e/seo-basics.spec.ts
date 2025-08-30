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
      // Check for JSON-LD script tags\n      const jsonLdScripts = page.locator('script[type=\"application/ld+json\"]');\n      const scriptCount = await jsonLdScripts.count();\n      expect(scriptCount).toBeGreaterThan(0);\n      \n      // Check website schema\n      const websiteSchema = await page.locator('script[type=\"application/ld+json\"]').first().textContent();\n      expect(websiteSchema).toBeTruthy();\n      \n      const websiteData = JSON.parse(websiteSchema!);\n      expect(websiteData['@type']).toBe('WebSite');\n      expect(websiteData.name).toBe('Project Dixis');\n      expect(websiteData.url).toBeTruthy();\n      expect(websiteData.potentialAction).toBeTruthy();\n    });\n\n    test('has organization structured data', async ({ page }) => {\n      // Get all JSON-LD scripts\n      const jsonLdScripts = await page.locator('script[type=\"application/ld+json\"]').all();\n      \n      // Look for organization schema\n      let foundOrganization = false;\n      for (const script of jsonLdScripts) {\n        const content = await script.textContent();\n        if (content) {\n          const data = JSON.parse(content);\n          if (data['@type'] === 'Organization') {\n            foundOrganization = true;\n            expect(data.name).toBe('Project Dixis');\n            expect(data.url).toBeTruthy();\n            expect(data.logo).toBeTruthy();\n            expect(data.sameAs).toBeInstanceOf(Array);\n            break;\n          }\n        }\n      }\n      expect(foundOrganization).toBe(true);\n    });\n\n    test('has products structured data when products load', async ({ page }) => {\n      // Wait for products to load\n      await page.waitForSelector('[data-testid=\"product-card\"]', { timeout: 10000 });\n      \n      // Check if products JSON-LD was added\n      const jsonLdScripts = await page.locator('script[type=\"application/ld+json\"]').all();\n      \n      let foundProducts = false;\n      for (const script of jsonLdScripts) {\n        const content = await script.textContent();\n        if (content) {\n          const data = JSON.parse(content);\n          if (data['@type'] === 'ItemList') {\n            foundProducts = true;\n            expect(data.name).toBe('Fresh Local Products');\n            expect(data.itemListElement).toBeInstanceOf(Array);\n            expect(data.numberOfItems).toBeGreaterThan(0);\n            \n            // Check first product item\n            if (data.itemListElement.length > 0) {\n              const firstProduct = data.itemListElement[0];\n              expect(firstProduct['@type']).toBe('Product');\n              expect(firstProduct.name).toBeTruthy();\n              expect(firstProduct.offers).toBeTruthy();\n            }\n            break;\n          }\n        }\n      }\n      expect(foundProducts).toBe(true);\n    });\n  });\n\n  test.describe('Technical SEO', () => {\n    test('robots.txt is accessible', async ({ page }) => {\n      const response = await page.goto('/robots.txt');\n      expect(response?.status()).toBe(200);\n      \n      const content = await page.textContent('body');\n      expect(content).toContain('User-agent: *');\n      expect(content).toContain('Allow: /');\n      expect(content).toContain('Disallow: /admin');\n      expect(content).toContain('Sitemap:');\n    });\n\n    test('sitemap.xml is accessible', async ({ page }) => {\n      const response = await page.goto('/sitemap.xml');\n      expect(response?.status()).toBe(200);\n      \n      // Check if it's valid XML\n      const content = await page.content();\n      expect(content).toContain('<urlset');\n      expect(content).toContain('<url>');\n      expect(content).toContain('<loc>');\n      expect(content).toContain('<lastmod>');\n      expect(content).toContain('<changefreq>');\n      expect(content).toContain('<priority>');\n    });\n\n    test('manifest.json is accessible', async ({ page }) => {\n      const response = await page.goto('/manifest.json');\n      expect(response?.status()).toBe(200);\n      \n      const content = await page.textContent('body');\n      const manifest = JSON.parse(content!);\n      \n      expect(manifest.name).toBe('Project Dixis - Local Producer Marketplace');\n      expect(manifest.short_name).toBe('Dixis');\n      expect(manifest.display).toBe('standalone');\n      expect(manifest.theme_color).toBe('#16a34a');\n      expect(manifest.icons).toBeInstanceOf(Array);\n      expect(manifest.icons.length).toBeGreaterThan(0);\n    });\n\n    test('has proper heading hierarchy', async ({ page }) => {\n      // Check for h1\n      const h1 = page.locator('h1');\n      await expect(h1).toBeVisible();\n      const h1Count = await h1.count();\n      expect(h1Count).toBe(1); // Should have exactly one h1\n      \n      // Check h1 content\n      const h1Text = await h1.textContent();\n      expect(h1Text).toContain('Fresh Products from Local Producers');\n    });\n\n    test('images have alt attributes', async ({ page }) => {\n      await page.waitForSelector('[data-testid=\"product-image\"]', { timeout: 10000 });\n      \n      const images = page.locator('[data-testid=\"product-image\"]');\n      const imageCount = await images.count();\n      \n      if (imageCount > 0) {\n        // Check first few images\n        for (let i = 0; i < Math.min(imageCount, 3); i++) {\n          const image = images.nth(i);\n          const alt = await image.getAttribute('alt');\n          expect(alt).toBeTruthy();\n          expect(alt!.length).toBeGreaterThan(0);\n        }\n      }\n    });\n  });\n\n  test.describe('Performance and Core Web Vitals', () => {\n    test('page loads within reasonable time', async ({ page }) => {\n      const startTime = Date.now();\n      await page.goto('/');\n      await page.waitForSelector('[data-testid=\"page-title\"]');\n      const loadTime = Date.now() - startTime;\n      \n      expect(loadTime).toBeLessThan(5000); // 5 seconds max\n    });\n\n    test('has proper meta tags for mobile', async ({ page }) => {\n      // Check viewport meta tag\n      const viewport = page.locator('meta[name=\"viewport\"]');\n      await expect(viewport).toBeAttached();\n      \n      const viewportContent = await viewport.getAttribute('content');\n      expect(viewportContent).toContain('width=device-width');\n      expect(viewportContent).toContain('initial-scale=1');\n    });\n\n    test('responds properly to different viewport sizes', async ({ page }) => {\n      // Test desktop\n      await page.setViewportSize({ width: 1200, height: 800 });\n      await page.goto('/');\n      await expect(page.getByTestId('page-title')).toBeVisible();\n      \n      // Test mobile\n      await page.setViewportSize({ width: 375, height: 667 });\n      await expect(page.getByTestId('page-title')).toBeVisible();\n      \n      // Test tablet\n      await page.setViewportSize({ width: 768, height: 1024 });\n      await expect(page.getByTestId('page-title')).toBeVisible();\n    });\n  });\n\n  test.describe('Content Quality', () => {\n    test('has descriptive page content', async ({ page }) => {\n      // Check main heading\n      const heading = page.getByTestId('page-title');\n      await expect(heading).toBeVisible();\n      \n      // Check for descriptive paragraph\n      const description = page.locator('p:has-text(\"Discover premium organic vegetables\")');\n      await expect(description).toBeVisible();\n      \n      const descriptionText = await description.textContent();\n      expect(descriptionText!.length).toBeGreaterThan(100); // Substantial content\n    });\n\n    test('search functionality has proper structure', async ({ page }) => {\n      const searchInput = page.getByPlaceholder('Search products...');\n      await expect(searchInput).toBeVisible();\n      \n      // Test search functionality\n      await searchInput.fill('organic');\n      // Could add more search tests here\n    });\n\n    test('navigation has proper structure', async ({ page }) => {\n      const nav = page.locator('nav[role=\"navigation\"]');\n      await expect(nav).toBeVisible();\n      \n      // Check for proper ARIA labels\n      const ariaLabel = await nav.getAttribute('aria-label');\n      expect(ariaLabel).toBe('Main navigation');\n    });\n  });\n});"}