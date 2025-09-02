/**
 * Services Index
 * 
 * Central export point for all validated services with Zod integration.
 * Provides type-safe, runtime-validated API clients and error handling.
 */

export * from './api-service';
export * from './error-service';

// Re-export commonly needed types
export type {
  LoginRequest,
  RegistrationRequest,
  AuthResponse,
  CheckoutRequest,
  OrderResponse,
  ShippingQuoteRequest,
  ShippingQuoteResponse,
} from '@lib/schemas';