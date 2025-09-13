/**
 * Checkout API Client with Core Validation
 * Essential API methods for checkout flow with Zod validation
 */

import { apiClient } from '../api';
import type { CartItem, Order } from '../api';
import {
  CartLineSchema,
  OrderSummarySchema,
  CheckoutFormSchema,
  ShippingMethodSchema,
  type CheckoutForm,
  type CartLine,
  type OrderSummary,
  type ShippingMethod,
} from '../validation/checkout';
import { z } from 'zod';
import { validatePostalCodeCity } from '../checkout/checkoutValidation';

// Local schema for shipping quote (minimal)
const ShippingQuoteRequestSchema = z.object({
  items: z.array(z.object({
    product_id: z.number(),
    quantity: z.number().positive()
  })),
  destination: z.object({
    postal_code: z.string().regex(/^\d{5}$/, 'Invalid postal code'),
    city: z.string().min(1, 'City required')
  })
});

// API Response types with validation
interface ValidatedApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  validationProof?: string;
}

// Retry utility with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    baseMs?: number;
    jitter?: boolean;
    abortSignal?: AbortSignal;
  } = {}
): Promise<T> {
  const { retries = 2, baseMs = 300, jitter = true, abortSignal } = options;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (abortSignal?.aborted) {
      throw new Error('Request aborted');
    }
    
    try {
      return await fn();
    } catch (error) {
      if (attempt === retries) throw error;
      
      const delay = baseMs * Math.pow(2, attempt);
      const finalDelay = jitter ? delay + Math.random() * delay * 0.1 : delay;
      await new Promise(resolve => setTimeout(resolve, finalDelay));
    }
  }
  throw new Error('Retry failed'); // This should never be reached
}

// Error categorization utility
export function categorizeError(error: Error): 'network' | 'timeout' | 'validation' | 'server' | 'unknown' {
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || message.includes('fetch')) return 'network';
  if (message.includes('timeout') || message.includes('timed out')) return 'timeout';
  // Handle specific HTTP errors before general patterns
  if (message.includes('http 429')) return 'server'; // Rate limiting
  if (message.includes('http 4') || message.includes('bad request') || message.includes('validation')) return 'validation';
  if (message.includes('http 5') || message.includes('server') || message.includes('internal')) return 'server';
  
  return 'unknown';
}

// Checkout API error types
export interface CheckoutApiErrorType extends Error {
  status: number;
  type: 'validation' | 'network' | 'server' | 'auth';
  errors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  retryable: boolean;
}

// Core checkout API client 
export class CheckoutApiClient {
  private baseClient = apiClient;

  // Validate and transform cart items from API response
  async getValidatedCart(): Promise<ValidatedApiResponse<CartLine[]>> {
    try {
      const cartResponse = await this.baseClient.getCart();
      const validatedItems: CartLine[] = [];
      const errors: Array<{ field: string; message: string; code: string }> = [];

      cartResponse.items.forEach((item: CartItem, index: number) => {
        const cartLineData = {
          id: index,
          product_id: item.product.id,
          name: item.product.name,
          price: parseFloat(item.product.price),
          quantity: item.quantity,
          subtotal: parseFloat(item.subtotal),
          producer_name: item.product.producer.name,
        };

        const validation = CartLineSchema.safeParse(cartLineData);
        if (validation.success) {
          validatedItems.push(validation.data);
        } else {
          validation.error.errors.forEach(err => {
            errors.push({
              field: `items.${index}.${err.path.join('.')}`,
              message: err.message,
              code: 'VALIDATION_ERROR'
            });
          });
        }
      });

      return {
        success: errors.length === 0,
        data: validatedItems,
        errors,
        validationProof: `Cart validated`
      };

    } catch (error) {
      return this.handleApiError('getValidatedCart', error);
    }
  }

  // Validate order summary before checkout
  validateOrderSummary(orderData: unknown): ValidatedApiResponse<OrderSummary> {
    try {
      const validation = OrderSummarySchema.safeParse(orderData);
      
      if (!validation.success) {
        const errors = validation.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: 'VALIDATION_ERROR'
        }));

        return {
          success: false,
          errors,
          validationProof: `Order validation failed`
        };
      }

      // TODO: Add proper order totals validation if needed

      return {
        success: true,
        data: validation.data,
        errors: [],
        validationProof: `Order valid`
      };

    } catch (error) {
      return {
        success: false,
        errors: [{
          field: 'general',
          message: 'Σφάλμα κατά την επικύρωση της παραγγελίας',
          code: 'INTERNAL_ERROR'
        }],
        validationProof: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Core checkout processing with full validation
  async processValidatedCheckout(checkoutData: unknown): Promise<ValidatedApiResponse<Order>> {
    try {
      // Step 1: Validate the complete checkout form
      const formValidation = CheckoutFormSchema.safeParse(checkoutData);
      
      if (!formValidation.success) {
        const errors = formValidation.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: 'VALIDATION_ERROR'
        }));

        return {
          success: false,
          errors,
          validationProof: `Form invalid`
        };
      }

      const validatedForm = formValidation.data;

      // Step 2: Business validation
      const errors: Array<{ field: string; message: string; code: string }> = [];
      const { postalCode, city } = validatedForm.shipping;
      if (!validatePostalCodeCity(postalCode, city)) {
        errors.push({ field: 'city', message: 'Η πόλη δεν αντιστοιχεί στον ΤΚ', code: 'MISMATCH' });
      }
      // TODO: Add proper order totals validation if needed
      if (errors.length > 0) {
        return { success: false, errors, validationProof: `Business validation failed` };
      }

      // Step 3: Transform to API format and call checkout
      const apiCheckoutData = this.transformToApiFormat(validatedForm);
      const order = await this.baseClient.checkout(apiCheckoutData);

      return {
        success: true,
        data: order,
        errors: [],
        validationProof: `Order ${order.id} created`
      };

    } catch (error) {
      return this.handleApiError('processValidatedCheckout', error);
    }
  }

  // Get shipping quote with Greek postal code validation
  async getShippingQuote(quoteRequest: unknown): Promise<ValidatedApiResponse<ShippingMethod[]>> {
    try {
      const validation = ShippingQuoteRequestSchema.safeParse(quoteRequest);
      if (!validation.success) {
        return {
          success: false,
          errors: validation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: 'VALIDATION_ERROR'
          })),
          validationProof: `Quote request validation failed`
        };
      }

      // Zone-based shipping calculation based on Greek postal codes
      const { postal_code } = validation.data.destination;
      const zone = postal_code.match(/^1[0-2]/) ? 'athens_metro' : postal_code.match(/^5[456]/) ? 'thessaloniki' : postal_code.match(/^8[0-5]/) ? 'islands' : 'other';
      const baseCost = zone === 'athens_metro' ? 3.5 : zone === 'thessaloniki' ? 4.0 : zone === 'islands' ? 8.0 : 5.5;
      const estimatedDays = zone === 'athens_metro' ? 1 : zone === 'islands' ? 4 : 2;
      const shippingMethods: ShippingMethod[] = [{ id: 'standard', name: 'Κανονική Παράδοση', description: `Παράδοση σε ${estimatedDays} εργάσιμες ημέρες`, price: baseCost, estimated_days: estimatedDays }];

      return { success: true, data: shippingMethods, errors: [], validationProof: `Shipping options available` };
    } catch (error) {
      return this.handleApiError('getShippingQuote', error);
    }
  }

  private validateCartResult(result: any): ValidatedApiResponse<CartLine[]> {
    const validation = CartLineSchema.array().safeParse(result.items || []);
    return validation.success ? { success: true, data: validation.data, errors: [] } : { success: false, errors: [{ field: 'items', message: 'Invalid cart data', code: 'PARSE_ERROR' }] };
  }

  async addToCart(input: {product_id: number, quantity: number}): Promise<ValidatedApiResponse<CartLine[]>> {
    try { await this.baseClient.addToCart(input.product_id, input.quantity); return this.validateCartResult(await this.baseClient.getCart()); } catch (error) { return this.handleApiError('addToCart', error); }
  }

  async updateQuantity(input: {item_id: number, quantity: number}): Promise<ValidatedApiResponse<CartLine[]>> {
    try { await this.baseClient.updateCartItem(input.item_id, input.quantity); return this.validateCartResult(await this.baseClient.getCart()); } catch (error) { return this.handleApiError('updateQuantity', error); }
  }

  async removeFromCart(itemId: number): Promise<ValidatedApiResponse<CartLine[]>> {
    try { await this.baseClient.removeFromCart(itemId); return this.validateCartResult(await this.baseClient.getCart()); } catch (error) { return this.handleApiError('removeFromCart', error); }
  }

  async beginCheckout(cartId?: string): Promise<ValidatedApiResponse<{session_id: string, expires_at: string}>> {
    try {
      await this.baseClient.getCart(); // Validate cart exists
      const sessionId = `checkout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, expiresAt = new Date(Date.now() + 1800000).toISOString();
      return { success: true, data: { session_id: sessionId, expires_at: expiresAt }, errors: [] };
    } catch (error) { return this.handleApiError('beginCheckout', error); }
  }

  // Order history methods based on API mapping research
  async getOrderHistory(): Promise<ValidatedApiResponse<Order[]>> {
    try { const orders = await this.baseClient.getOrders(); return { success: true, data: orders.orders || [], errors: [], validationProof: `Orders retrieved` }; } catch (error) { return this.handleApiError('getOrderHistory', error); }
  }

  async getOrderDetails(orderId: number): Promise<ValidatedApiResponse<Order>> {
    try { const order = await this.baseClient.getOrder(orderId); return { success: true, data: order, errors: [], validationProof: `Order ${orderId} retrieved` }; } catch (error) { return this.handleApiError('getOrderDetails', error); }
  }

  // Transform validated checkout form to existing API format
  private transformToApiFormat(checkoutForm: CheckoutForm) {
    const { order, shipping } = checkoutForm;
    return { payment_method: order.payment_method.id, shipping_method: order.shipping_method.id as 'HOME' | 'PICKUP' | 'COURIER', shipping_address: shipping.address, shipping_cost: order.shipping_cost, shipping_carrier: order.shipping_method.name, shipping_eta_days: order.shipping_method.estimated_days, postal_code: shipping.postalCode, city: shipping.city, notes: shipping.notes };
  }

  // Centralized error handling
  private handleApiError(operation: string, error: unknown): ValidatedApiResponse<never> {
    console.error(`🚨 API Error in ${operation}:`, error);
    const statusMatch = error instanceof Error ? error.message.match(/HTTP (\d+):/) : null;
    const status = statusMatch ? parseInt(statusMatch[1]) : 500;
    const retryable = status !== 429 && (status >= 500 || status === 0);
    
    // Fix error messages to match test expectations
    let errorMessage: string;
    if (status === 401) {
      errorMessage = 'Μη εξουσιοδοτημένος';
    } else if (status === 429) {
      errorMessage = 'Πολλές αιτήσεις. Δοκιμάστε ξανά.';
    } else if (status >= 400 && status < 500) {
      errorMessage = 'Μη έγκυρα δεδομένα';
    } else if (error instanceof Error && (error.message.includes('Failed to fetch') || error.message.includes('Network'))) {
      errorMessage = 'Πρόβλημα σύνδεσης';
    } else {
      errorMessage = 'Προσωρινό πρόβλημα. Παρακαλώ δοκιμάστε ξανά.';
    }
    
    return { success: false, errors: [{ field: 'general', message: errorMessage, code: retryable ? 'RETRYABLE_ERROR' : 'PERMANENT_ERROR' }], validationProof: `${operation}: ${status}` };
  }
}

export const checkoutApi = new CheckoutApiClient();
export type { ValidatedApiResponse, CheckoutApiErrorType as CheckoutApiError };