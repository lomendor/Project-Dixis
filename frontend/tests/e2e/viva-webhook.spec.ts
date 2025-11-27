import { test, expect } from '@playwright/test';

/**
 * Viva Wallet Webhook API Tests
 * Tests the webhook endpoint that receives payment updates from Viva
 */

test.describe('Viva Wallet Webhook API', () => {
  const webhookUrl = '/api/webhooks/viva-wallet';

  test('GET returns status ok', async ({ request }) => {
    const response = await request.get(webhookUrl);
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json).toHaveProperty('status', 'ok');
    expect(json).toHaveProperty('service', 'viva-wallet-webhook');
  });

  test('POST without body returns error', async ({ request }) => {
    const response = await request.post(webhookUrl, {
      data: '',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status()).toBe(500);
  });

  test('POST with invalid JSON returns error', async ({ request }) => {
    const response = await request.post(webhookUrl, {
      data: 'not valid json',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status()).toBe(500);
  });

  test('POST with valid payload but unknown order returns warning', async ({ request }) => {
    const payload = {
      EventTypeId: 1796,
      OrderCode: 'unknown-order-code-12345',
      TransactionId: 'test-transaction-123',
      Amount: 1000,
      StatusId: 'F',
      Meid: 'test-merchant',
    };

    const response = await request.post(webhookUrl, {
      data: payload,
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json).toHaveProperty('received', true);
    expect(json).toHaveProperty('warning', 'Order not found');
  });

  test('POST accepts different event types gracefully', async ({ request }) => {
    const eventTypes = [
      { id: 1796, name: 'payment created' },
      { id: 1797, name: 'payment failed' },
      { id: 1798, name: 'payment refunded' },
    ];

    for (const eventType of eventTypes) {
      const payload = {
        EventTypeId: eventType.id,
        OrderCode: `test-order-${eventType.id}`,
        TransactionId: `test-tx-${eventType.id}`,
        Amount: 1000,
        StatusId: 'F',
        Meid: 'test-merchant',
      };

      const response = await request.post(webhookUrl, {
        data: payload,
        headers: { 'Content-Type': 'application/json' },
      });

      expect(response.status()).toBe(200);
      const json = await response.json();
      expect(json).toHaveProperty('received', true);
    }
  });
});
