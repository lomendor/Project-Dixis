/**
 * Accessibility Audit - axe-core WCAG 2.1 A/AA Compliance
 *
 * This test suite uses axe-core to scan key pages for WCAG violations.
 * Results are saved to docs/QA/AXE-REPORT.json for analysis.
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFileSync } from 'fs';
import { join } from 'path';

const PAGES_TO_SCAN = [
  { path: '/', name: 'Home' },
  { path: '/cart', name: 'Cart' },
  { path: '/checkout', name: 'Checkout' },
  { path: '/auth/login', name: 'Login' }
];

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3000';
const allResults: any[] = [];

test.describe('[a11y] axe-core WCAG 2.1 A/AA scan', () => {
  for (const { path, name } of PAGES_TO_SCAN) {
    test(`scan ${name} (${path})`, async ({ page }) => {
      await page.goto(BASE_URL + path, { waitUntil: 'domcontentloaded' });

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      console.log(`[axe] ${name}: ${results.violations.length} violations`);

      allResults.push({
        page: name,
        path,
        violations: results.violations.length,
        violationDetails: results.violations
      });

      // Save results after each scan
      const reportPath = join(process.cwd(), '..', 'docs', 'QA', 'AXE-REPORT.json');
      writeFileSync(reportPath, JSON.stringify(allResults, null, 2));

      // Assert zero critical violations (severity: critical or serious)
      const criticalViolations = results.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      );

      expect(
        criticalViolations.length,
        `Found ${criticalViolations.length} critical/serious violations on ${name}`
      ).toBe(0);
    });
  }
});
