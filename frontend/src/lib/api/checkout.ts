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
        const errors = validation.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: 'VALIDATION_ERROR'
        }));
        return {
          success: false,
          errors,
          validationProof: `Quote request validation failed`
        };
      }

      const { items, destination } = validation.data;
      
      // Calculate basic shipping quote (mock implementation for now)
      const totalWeight = items.reduce((sum, item) => sum + (item.quantity * 0.5), 0); // Assume 0.5kg per item
      const shippingMethods: ShippingMethod[] = [
        {
          id: 'standard',
          name: 'Κανονική Παράδοση',
          description: 'Παράδοση σε 3-5 εργάσιμες ημέρες',
          price: Math.max(5.0, totalWeight * 1.5),
          estimated_days: 4
        },
        {
          id: 'express',
          name: 'Ταχεία Παράδοση',
          description: 'Παράδοση σε 1-2 εργάσιμες ημέρες',
          price: Math.max(8.0, totalWeight * 2.5),
          estimated_days: 1
        }
      ];

      return {
        success: true,
        data: shippingMethods,
        errors: [],
        validationProof: `Shipping quote calculated for ${items.length} items to ${destination.city}`
      };

    } catch (error) {
      return this.handleApiError('getShippingQuote', error);
    }
  }

  // Transform validated checkout form to existing API format
  private transformToApiFormat(checkoutForm: CheckoutForm) {
    return {
      payment_method: checkoutForm.order.payment_method.id,
      shipping_method: checkoutForm.order.shipping_method.id as 'HOME' | 'PICKUP' | 'COURIER',
      shipping_address: checkoutForm.shipping.address,
      shipping_cost: checkoutForm.order.shipping_cost,
      shipping_carrier: checkoutForm.order.shipping_method.name,
      shipping_eta_days: checkoutForm.order.shipping_method.estimated_days,
      postal_code: checkoutForm.shipping.postalCode,
      city: checkoutForm.shipping.city,
      notes: checkoutForm.shipping.notes,
    };
  }

  // Centralized error handling
  private handleApiError(operation: string, error: unknown): ValidatedApiResponse<never> {
    console.error(`🚨 API Error in ${operation}:`, error);

    let errorMessage = 'Προσωρινό πρόβλημα. Παρακαλώ δοκιμάστε ξανά.';
    let retryable = true;
    let status = 500;

    if (error instanceof Error) {
      const statusMatch = error.message.match(/HTTP (\d+):/);
      if (statusMatch) {
        status = parseInt(statusMatch[1]);
      }

      // Basic HTTP error mapping
      if (status >= 400 && status < 500) {
        errorMessage = status === 401 ? 'Μη εξουσιοδοτημένος' : 'Μη έγκυρα δεδομένα';
        retryable = false;
      } else if (error.message.toLowerCase().includes('network')) {
        errorMessage = 'Πρόβλημα σύνδεσης';
        retryable = true;
      }
    }

    return {
      success: false,
      errors: [{
        field: 'general',
        message: errorMessage,
        code: retryable ? 'RETRYABLE_ERROR' : 'PERMANENT_ERROR'
      }],
      validationProof: `${operation}: ${status}`
    };
  }
}

export const checkoutApi = new CheckoutApiClient();
export type { ValidatedApiResponse, CheckoutApiErrorType as CheckoutApiError };