import { test, expect } from '@playwright/test'

test('status email includes Greek footer + tracking link', async () => {
  // Dynamic import of the template module
  const mod = await import('../../src/lib/mail/templates/orderStatus.ts')

  // Test HTML version with tracking link
  const html = mod.html({
    id: 'ABC123',
    status: 'PAID',
    publicToken: 'test-token-123'
  })

  expect(html).toMatch(/Επικοινωνία:/)
  expect(html).toMatch(/Παρακολούθηση παραγγελίας/)
  expect(html).toContain('test-token-123')

  // Test text version with tracking link
  const text = mod.text({
    id: 'ABC123',
    status: 'PAID',
    publicToken: 'test-token-123'
  })

  expect(text).toMatch(/Επικοινωνία:/)
  expect(text).toMatch(/Παρακολούθηση:/)
  expect(text).toContain('test-token-123')
})

test('admin email includes Greek footer', async () => {
  // Dynamic import of the admin template
  const mod = await import('../../src/lib/mail/templates/newOrderAdmin.ts')

  const text = mod.text({
    id: 'ORDER123',
    buyerName: 'Γιάννης Παπαδόπουλος',
    buyerPhone: '+30 210 1234567',
    total: 49.99
  })

  expect(text).toMatch(/Επικοινωνία:/)
  expect(text).toMatch(/Νέα παραγγελία/)
  expect(text).toContain('Γιάννης Παπαδόπουλος')
  expect(text).toMatch(/€/)
})
