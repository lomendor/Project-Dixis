/**
 * Viva Wallet Integration
 *
 * Usage:
 * ```typescript
 * import { getVivaWalletClient, isVivaWalletConfigured } from '@/lib/viva-wallet';
 *
 * if (isVivaWalletConfigured()) {
 *   const client = getVivaWalletClient();
 *   const order = await client.createOrder(1000, 'order-123');
 *   const checkout = client.getCheckoutUrl(order.orderCode);
 *   // Redirect to checkout.redirectUrl
 * }
 * ```
 */

export { VivaWalletClient, getVivaWalletClient } from './client';
export { getVivaWalletConfig, isVivaWalletConfigured } from './config';
export type { VivaWalletConfig, VivaEnvironment } from './config';
export * from './types';
