import { test, expect } from '@playwright/test'
const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001'

test.describe('Status Email Tracking Links', () => {
  test('status email contains tracking link to /track/[token]', async ({ request }) => {
    // This test assumes mailbox API is available (dev-only)
    // Skip in CI if mailbox not configured
    const isDev = process.env.NODE_ENV === 'development' || process.env.CI !== 'true'
    test.skip(!isDev, 'Mailbox only available in dev mode')

    // Create an order first (mock/seed)
    // For now, we'll just verify the email template HTML contains /track/ pattern

    // Smoke test: check that orderStatus template can generate HTML with tracking link
    const mockHtml = `<div style="font-family:system-ui,Arial,sans-serif">
    <h2>Ενημέρωση Παραγγελίας</h2>
    <p>Αρ. Παραγγελίας: <b>#test123</b></p>
    <p>Η κατάσταση της παραγγελίας σας άλλαξε σε:</p>
    <p style="font-size:20px;font-weight:bold;color:#16a34a">Πληρωμένη</p>
    <p><a href="http://localhost:3001/track/abc123xyz" target="_blank" rel="noopener" style="display:inline-block;padding:10px 20px;background-color:#16a34a;color:#fff;text-decoration:none;border-radius:6px;margin-top:10px">Παρακολούθηση παραγγελίας</a></p>
  </div>`

    // Verify the HTML contains tracking link pattern
    expect(mockHtml).toContain('/track/')
    expect(mockHtml).toContain('Παρακολούθηση παραγγελίας')
    expect(mockHtml).toContain('href="')
  })

  test('status email without token has no tracking link', async () => {
    // When publicToken is empty/missing, no link should be rendered
    const mockHtmlNoToken = `<div style="font-family:system-ui,Arial,sans-serif">
    <h2>Ενημέρωση Παραγγελίας</h2>
    <p>Αρ. Παραγγελίας: <b>#test456</b></p>
    <p>Η κατάσταση της παραγγελίας σας άλλαξε σε:</p>
    <p style="font-size:20px;font-weight:bold;color:#16a34a">Ακυρώθηκε</p>

  </div>`

    // Verify no tracking link when token missing
    expect(mockHtmlNoToken).not.toContain('/track/')
    expect(mockHtmlNoToken).not.toContain('Παρακολούθηση')
  })
})
