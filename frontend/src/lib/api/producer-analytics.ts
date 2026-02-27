// Import shared types and utilities from admin analytics
import type {
  SalesAnalytics,
  OrdersAnalytics,
  ProductsAnalytics
} from './analytics';

import {
  formatCurrency,
  formatPercentage,
  getStatusColor
} from './analytics';

import { apiUrl } from '@/lib/api';

// Re-export shared utilities for convenience
export { formatCurrency, formatPercentage, getStatusColor };

// Producer-specific analytics interfaces (same structure as admin but scoped to producer)
export interface ProducerSalesAnalytics extends SalesAnalytics {}
export interface ProducerOrdersAnalytics extends OrdersAnalytics {}
export interface ProducerProductsAnalytics extends ProductsAnalytics {}

/**
 * Producer analytics API client.
 *
 * Calls Laravel backend directly via apiUrl() + credentials: 'include'
 * (Sanctum cookie-based SPA auth). Previously used Next.js proxy routes
 * that sent frontend JWT as Bearer token — which Laravel Sanctum rejects.
 */
export const producerAnalyticsApi = {
  async getSales(period: 'daily' | 'monthly' = 'daily', limit = 30): Promise<ProducerSalesAnalytics> {
    const params = new URLSearchParams({ period, limit: limit.toString() });
    const response = await fetch(apiUrl(`producer/analytics/sales?${params}`), {
      credentials: 'include',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(
        response.status === 401 ? 'AUTH_REQUIRED'
          : response.status === 403 ? 'PRODUCER_ACCESS_REQUIRED'
            : `HTTP_${response.status}`
      );
    }

    const data = await response.json();
    return data.analytics;
  },

  async getOrders(): Promise<ProducerOrdersAnalytics> {
    const response = await fetch(apiUrl('producer/analytics/orders'), {
      credentials: 'include',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(
        response.status === 401 ? 'AUTH_REQUIRED'
          : response.status === 403 ? 'PRODUCER_ACCESS_REQUIRED'
            : `HTTP_${response.status}`
      );
    }

    const data = await response.json();
    return data.analytics;
  },

  async getProducts(limit = 10): Promise<ProducerProductsAnalytics> {
    const params = new URLSearchParams({ limit: limit.toString() });
    const response = await fetch(apiUrl(`producer/analytics/products?${params}`), {
      credentials: 'include',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(
        response.status === 401 ? 'AUTH_REQUIRED'
          : response.status === 403 ? 'PRODUCER_ACCESS_REQUIRED'
            : `HTTP_${response.status}`
      );
    }

    const data = await response.json();
    return data.analytics;
  },
};

/**
 * Map producer error codes to user-facing messages.
 * Returns error codes (not Greek strings) - callers should translate via i18n.
 */
export type ProducerErrorCode =
  | 'PRODUCER_ACCESS_REQUIRED'
  | 'AUTH_REQUIRED'
  | 'SESSION_EXPIRED'
  | 'FORBIDDEN'
  | 'LOAD_FAILED';

export function getProducerErrorCode(error: Error): ProducerErrorCode {
  if (error.message === 'PRODUCER_ACCESS_REQUIRED') return 'PRODUCER_ACCESS_REQUIRED';
  if (error.message === 'AUTH_REQUIRED') return 'AUTH_REQUIRED';
  if (error.message === 'HTTP_401') return 'SESSION_EXPIRED';
  if (error.message === 'HTTP_403') return 'FORBIDDEN';
  return 'LOAD_FAILED';
}

/**
 * @deprecated Use getProducerErrorCode() + i18n instead.
 * Kept for backward compatibility - will be removed in PR 2 (i18n pass).
 */
export function handleProducerError(error: Error): string {
  const code = getProducerErrorCode(error);
  const messages: Record<ProducerErrorCode, string> = {
    PRODUCER_ACCESS_REQUIRED: 'Requires producer access. Make sure you are logged in as a producer.',
    AUTH_REQUIRED: 'Sign in to view producer analytics.',
    SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
    FORBIDDEN: 'You do not have permission to view producer analytics.',
    LOAD_FAILED: 'Failed to load analytics. Please try again.',
  };
  return messages[code];
}
