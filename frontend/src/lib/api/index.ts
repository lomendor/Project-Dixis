/**
 * API Client Library Exports
 * Centralized exports for all API clients and utilities
 */

// Main API client (re-export from parent)
export {
  apiClient,
  apiUrl,
  getPublicProducts,
  type ApiResponse,
  type Product,
  type Category,
  type ProductImage,
  type Producer,
  type CartItem,
  type CartResponse,
  type Order,
  type OrderItem,
  type User,
  type AuthResponse,
  type ShippingQuote,
  type ShippingQuoteRequest,
  type ProducerKpi,
  type ProducerStats,
  type TopProduct,
} from '../api';

// Core checkout API client with validation
export {
  CheckoutApiClient,
  checkoutApi,
  type ValidatedApiResponse,
  type CheckoutApiError,
} from './checkout';