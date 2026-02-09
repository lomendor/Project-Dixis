import { API_BASE_URL } from '@/env';

// Import shared types and utilities from admin analytics
import type {
  SalesData,
  SalesAnalytics,
  OrdersAnalytics,
  TopProduct,
  ProductsAnalytics
} from './analytics';

import {
  formatCurrency,
  formatPercentage,
  getStatusColor
} from './analytics';

// Re-export shared utilities for convenience
export { formatCurrency, formatPercentage, getStatusColor };

// Producer-specific analytics interfaces (same structure as admin but scoped to producer)
export interface ProducerSalesAnalytics extends SalesAnalytics {}
export interface ProducerOrdersAnalytics extends OrdersAnalytics {}
export interface ProducerProductsAnalytics extends ProductsAnalytics {}

// Producer analytics API client
export const producerAnalyticsApi = {
  /**
   * Get sales analytics for the authenticated producer
   */
  async getSales(period: 'daily' | 'monthly' = 'daily', limit = 30): Promise<ProducerSalesAnalytics> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Δεν βρέθηκε token πιστοποίησης');
    }

    const params = new URLSearchParams({
      period,
      limit: limit.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/producer/analytics/sales?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Απαιτείται πρόσβαση παραγωγού. Βεβαιωθείτε ότι είστε συνδεδεμένος παραγωγός.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.analytics;
  },

  /**
   * Get orders analytics for the authenticated producer
   */
  async getOrders(): Promise<ProducerOrdersAnalytics> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Δεν βρέθηκε token πιστοποίησης');
    }

    const response = await fetch(`${API_BASE_URL}/producer/analytics/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Απαιτείται πρόσβαση παραγωγού. Βεβαιωθείτε ότι είστε συνδεδεμένος παραγωγός.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.analytics;
  },

  /**
   * Get products analytics for the authenticated producer
   */
  async getProducts(limit = 10): Promise<ProducerProductsAnalytics> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Δεν βρέθηκε token πιστοποίησης');
    }

    const params = new URLSearchParams({
      limit: limit.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/producer/analytics/products?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Απαιτείται πρόσβαση παραγωγού. Βεβαιωθείτε ότι είστε συνδεδεμένος παραγωγός.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.analytics;
  },
};

/**
 * Check if user has producer access
 */
export function checkProducerAccess(): boolean {
  // This would typically check user role/producer association
  // For now, we'll rely on API responses to determine access
  const token = localStorage.getItem('token');
  return !!token;
}

/**
 * Helper to handle producer-specific errors
 */
export function handleProducerError(error: Error): string {
  if (error.message.includes('πρόσβαση παραγωγού')) {
    return 'Πρέπει να είστε συνδεδεμένος παραγωγός για προβολή αναλυτικών. Επικοινωνήστε με την υποστήριξη αν πιστεύετε ότι πρόκειται για σφάλμα.';
  }
  if (error.message.includes('token πιστοποίησης')) {
    return 'Συνδεθείτε για προβολή αναλυτικών παραγωγού.';
  }
  if (error.message.includes('HTTP error! status: 401')) {
    return 'Η συνεδρία σας έληξε. Συνδεθείτε ξανά.';
  }
  if (error.message.includes('HTTP error! status: 403')) {
    return 'Δεν έχετε δικαίωμα προβολής αναλυτικών παραγωγού.';
  }
  return 'Αποτυχία φόρτωσης αναλυτικών. Δοκιμάστε ξανά.';
}