/**
 * Checkout API Client with Comprehensive Zod Validation
 * Extends the existing API client with checkout-specific validation hooks
 */

import { apiClient } from '../api';
import type { CartItem, Order } from '../api';
import {
  safeValidateCheckoutForm,
  safeValidateCartLine,
  safeValidateShippingMethod,
  safeValidatePaymentMethod,
  safeValidateOrderSummary,
  validateOrderTotals,
  type CheckoutForm,
  type CartLine,
  type ShippingMethod,
  type PaymentMethod,
  type OrderSummary,
} from '../validation/checkout';
import { validatePostalCodeCity } from '../checkout/checkoutValidation';

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

// Checkout API error types for Greek market
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

// Enhanced checkout API client with comprehensive validation
export class CheckoutApiClient {
  private baseClient = apiClient;

  // Validate and transform cart items from API response
  async getValidatedCart(): Promise<ValidatedApiResponse<CartLine[]>> {
    try {
      const cartResponse = await this.baseClient.getCart();
      const validatedItems: CartLine[] = [];
      const errors: Array<{ field: string; message: string; code: string }> = [];

      cartResponse.items.forEach((item: CartItem, index: number) => {
        // Transform API CartItem to our CartLine schema
        const cartLineData = {
          id: index, // Using index as cart line ID
          product_id: item.product.id,
          name: item.product.name,
          price: parseFloat(item.product.price),
          quantity: item.quantity,
          subtotal: parseFloat(item.subtotal),
          producer_name: item.product.producer.name,
        };

        const validation = safeValidateCartLine(cartLineData);
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
        validationProof: `Validated ${validatedItems.length} cart items at ${new Date().toISOString()}`
      };

    } catch (error) {
      return this.handleApiError('getValidatedCart', error);
    }
  }

  // Fetch and validate available shipping methods
  async getValidatedShippingMethods(postalCode?: string): Promise<ValidatedApiResponse<ShippingMethod[]>> {
    try {
      // For now, return mock data as the backend doesn't have shipping methods endpoint yet
      // In production, this would call an actual API endpoint
      const mockShippingMethods = [
        {
          id: 'home_delivery',
          name: 'Παράδοση στο σπίτι',
          description: 'Παράδοση στη διεύθυνσή σας εντός 2-3 εργάσιμων ημερών',
          price: 3.50,
          estimated_days: 3,
          available_for_postal_codes: ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19']
        },
        {
          id: 'pickup_point',
          name: 'Παραλαβή από σημείο',
          description: 'Παραλαβή από το πλησιέστερο σημείο παραλαβής',
          price: 2.50,
          estimated_days: 2,
          available_for_postal_codes: ['10', '11', '12', '15', '16', '17', '54', '55']
        },
        {
          id: 'express',
          name: 'Ταχεία παράδοση',
          description: 'Παράδοση εντός 24 ωρών (μόνο Αθήνα-Θεσσαλονίκη)',
          price: 8.00,
          estimated_days: 1,
          available_for_postal_codes: ['10', '11', '54', '55']
        }
      ];

      const validatedMethods: ShippingMethod[] = [];
      const errors: Array<{ field: string; message: string; code: string }> = [];

      mockShippingMethods.forEach((method, index) => {
        // Filter by postal code if provided
        if (postalCode) {
          const postalPrefix = postalCode.substring(0, 2);
          if (method.available_for_postal_codes && 
              !method.available_for_postal_codes.includes(postalPrefix)) {
            return; // Skip this method if not available for postal code
          }
        }

        const validation = safeValidateShippingMethod(method);
        if (validation.success) {
          validatedMethods.push(validation.data);
        } else {
          validation.error.errors.forEach(err => {
            errors.push({
              field: `shipping_methods.${index}.${err.path.join('.')}`,
              message: err.message,
              code: 'VALIDATION_ERROR'
            });
          });
        }
      });

      return {
        success: errors.length === 0,
        data: validatedMethods,
        errors,
        validationProof: `Validated ${validatedMethods.length} shipping methods for postal code ${postalCode || 'any'} at ${new Date().toISOString()}`
      };

    } catch (error) {
      return this.handleApiError('getValidatedShippingMethods', error);
    }
  }

  // Fetch and validate available payment methods
  async getValidatedPaymentMethods(): Promise<ValidatedApiResponse<PaymentMethod[]>> {
    try {
      // Mock payment methods for Greek market
      const mockPaymentMethods = [
        {
          id: 'card',
          type: 'card' as const,
          name: 'Πιστωτική/Χρεωστική Κάρτα',
          description: 'Visa, Mastercard, Maestro',
          fee_percentage: 0,
          fixed_fee: 0,
          minimum_amount: 0
        },
        {
          id: 'bank_transfer',
          type: 'bank_transfer' as const,
          name: 'Τραπεζική Μεταφορά',
          description: 'Μεταφορά μέσω e-banking ή ATM',
          fee_percentage: 0,
          fixed_fee: 0,
          minimum_amount: 10.00
        },
        {
          id: 'cash_on_delivery',
          type: 'cash_on_delivery' as const,
          name: 'Αντικαταβολή',
          description: 'Πληρωμή κατά την παραλαβή',
          fee_percentage: 0,
          fixed_fee: 2.00,
          minimum_amount: 0
        }
      ];

      const validatedMethods: PaymentMethod[] = [];
      const errors: Array<{ field: string; message: string; code: string }> = [];

      mockPaymentMethods.forEach((method, index) => {
        const validation = safeValidatePaymentMethod(method);
        if (validation.success) {
          validatedMethods.push(validation.data);
        } else {
          validation.error.errors.forEach(err => {
            errors.push({
              field: `payment_methods.${index}.${err.path.join('.')}`,
              message: err.message,
              code: 'VALIDATION_ERROR'
            });
          });
        }
      });

      return {
        success: errors.length === 0,
        data: validatedMethods,
        errors,
        validationProof: `Validated ${validatedMethods.length} payment methods at ${new Date().toISOString()}`
      };

    } catch (error) {
      return this.handleApiError('getValidatedPaymentMethods', error);
    }
  }

  // Validate order summary before checkout
  validateOrderSummary(orderData: unknown): ValidatedApiResponse<OrderSummary> {
    try {
      const validation = safeValidateOrderSummary(orderData);
      
      if (!validation.success) {
        const errors = validation.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: 'VALIDATION_ERROR'
        }));

        return {
          success: false,
          errors,
          validationProof: `Order summary validation failed at ${new Date().toISOString()}`
        };
      }

      // Additional business logic validation
      const totalsValidation = validateOrderTotals(validation.data);
      if (!totalsValidation.isValid) {
        const totalsErrors = totalsValidation.errors.map(error => ({
          field: 'total_calculation',
          message: error,
          code: 'CALCULATION_ERROR'
        }));

        return {
          success: false,
          errors: totalsErrors,
          validationProof: `Order totals validation failed at ${new Date().toISOString()}`
        };
      }

      return {
        success: true,
        data: validation.data,
        errors: [],
        validationProof: `Order summary validated successfully at ${new Date().toISOString()}`
      };

    } catch (error) {
      return {
        success: false,
        errors: [{
          field: 'general',
          message: 'Σφάλμα κατά την επικύρωση της παραγγελίας',
          code: 'INTERNAL_ERROR'
        }],
        validationProof: `Validation error at ${new Date().toISOString()}: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Comprehensive checkout with full validation
  async processValidatedCheckout(checkoutData: unknown): Promise<ValidatedApiResponse<Order>> {
    try {
      // Step 1: Validate the complete checkout form
      const formValidation = safeValidateCheckoutForm(checkoutData);
      
      if (!formValidation.success) {
        const errors = formValidation.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: 'VALIDATION_ERROR'
        }));

        return {
          success: false,
          errors,
          validationProof: `Checkout form validation failed at ${new Date().toISOString()}`
        };
      }

      const validatedForm = formValidation.data;

      // Step 2: Additional business validation
      const businessValidationErrors: Array<{ field: string; message: string; code: string }> = [];

      // Validate postal code and city combination
      const { postalCode, city } = validatedForm.shipping;
      if (!validatePostalCodeCity(postalCode, city)) {
        businessValidationErrors.push({
          field: 'shipping.city',
          message: 'Η πόλη δεν αντιστοιχεί στον ταχυδρομικό κώδικα',
          code: 'MISMATCH'
        });
      }

      // Validate order totals
      const totalsValidation = validateOrderTotals(validatedForm.order);
      if (!totalsValidation.isValid) {
        totalsValidation.errors.forEach(error => {
          businessValidationErrors.push({
            field: 'order.total_amount',
            message: error,
            code: 'CALCULATION_ERROR'
          });
        });
      }

      if (businessValidationErrors.length > 0) {
        return {
          success: false,
          errors: businessValidationErrors,
          validationProof: `Business validation failed at ${new Date().toISOString()}`
        };
      }

      // Step 3: Transform to API format and call existing checkout endpoint
      const apiCheckoutData = this.transformToApiFormat(validatedForm);
      const order = await this.baseClient.checkout(apiCheckoutData);

      return {
        success: true,
        data: order,
        errors: [],
        validationProof: `Checkout completed successfully at ${new Date().toISOString()}, Order ID: ${order.id}`
      };

    } catch (error) {
      return this.handleApiError('processValidatedCheckout', error);
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

  // Centralized error handling with Greek messages
  private handleApiError(operation: string, error: unknown): ValidatedApiResponse<never> {
    console.error(`🚨 API Error in ${operation}:`, error);

    let errorMessage = 'Προσωρινό πρόβλημα. Παρακαλώ δοκιμάστε ξανά.';
    let retryable = true;
    let status = 500;

    if (error instanceof Error) {
      // Parse HTTP status from error message if available
      const statusMatch = error.message.match(/HTTP (\d+):/);
      if (statusMatch) {
        status = parseInt(statusMatch[1]);
      }

      // Map specific HTTP errors to Greek messages
      switch (status) {
        case 400:
          errorMessage = 'Τα στοιχεία που εστάλησαν δεν είναι έγκυρα';
          retryable = false;
          break;
        case 401:
          errorMessage = 'Δεν έχετε εξουσιοδότηση. Παρακαλώ συνδεθείτε ξανά.';
          retryable = false;
          break;
        case 403:
          errorMessage = 'Δεν έχετε δικαίωμα για αυτή την ενέργεια';
          retryable = false;
          break;
        case 422:
          errorMessage = 'Τα στοιχεία που εισάγατε δεν είναι έγκυρα';
          retryable = false;
          break;
        case 429:
          errorMessage = 'Πολλές αιτήσεις. Παρακαλώ περιμένετε λίγο.';
          retryable = true;
          break;
        case 500:
        case 502:
        case 503:
          errorMessage = 'Προσωρινό πρόβλημα με τον διακομιστή';
          retryable = true;
          break;
        default:
          if (error.message.toLowerCase().includes('network')) {
            errorMessage = 'Πρόβλημα σύνδεσης. Ελέγξτε το διαδίκτυο.';
            retryable = true;
          }
      }
    }

    return {
      success: false,
      errors: [{
        field: 'general',
        message: errorMessage,
        code: retryable ? 'RETRYABLE_ERROR' : 'PERMANENT_ERROR'
      }],
      validationProof: `API error in ${operation} at ${new Date().toISOString()}: ${status} ${errorMessage}`
    };
  }

  // Validation hook for real-time form validation
  validateCheckoutFormField(fieldPath: string, fieldValue: unknown, fullForm?: unknown): {
    isValid: boolean;
    error?: string;
  } {
    try {
      // Create a minimal form object for field validation
      const formToValidate = fullForm || this.createMinimalForm(fieldPath, fieldValue);
      const validation = safeValidateCheckoutForm(formToValidate);

      if (validation.success) {
        return { isValid: true };
      }

      // Find error for this specific field
      const fieldError = validation.error.errors.find(error => 
        error.path.join('.') === fieldPath
      );

      return {
        isValid: false,
        error: fieldError?.message || 'Μη έγκυρη τιμή'
      };

    } catch (error) {
      return {
        isValid: false,
        error: 'Σφάλμα κατά την επικύρωση'
      };
    }
  }

  // Helper to create minimal form for field validation
  private createMinimalForm(fieldPath: string, fieldValue: unknown): Partial<CheckoutForm> {
    const pathParts = fieldPath.split('.');
    const form: Record<string, unknown> = {};

    // Create nested structure based on field path
    let current: Record<string, unknown> = form;
    for (let i = 0; i < pathParts.length - 1; i++) {
      current[pathParts[i]] = {};
      current = current[pathParts[i]] as Record<string, unknown>;
    }
    current[pathParts[pathParts.length - 1]] = fieldValue;

    return form as Partial<CheckoutForm>;
  }
}

// Singleton instance for global use
export const checkoutApi = new CheckoutApiClient();

// Hook for React components
export const useCheckoutValidation = () => {
  return {
    validateField: checkoutApi.validateCheckoutFormField.bind(checkoutApi),
    validateOrderSummary: checkoutApi.validateOrderSummary.bind(checkoutApi),
    processCheckout: checkoutApi.processValidatedCheckout.bind(checkoutApi),
    getCart: checkoutApi.getValidatedCart.bind(checkoutApi),
    getShippingMethods: checkoutApi.getValidatedShippingMethods.bind(checkoutApi),
    getPaymentMethods: checkoutApi.getValidatedPaymentMethods.bind(checkoutApi),
  };
};

// Export types for use in components
export type { ValidatedApiResponse, CheckoutApiErrorType as CheckoutApiError };