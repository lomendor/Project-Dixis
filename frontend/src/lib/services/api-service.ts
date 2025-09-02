/**
 * Validated API Service
 * 
 * Type-safe API client with comprehensive Zod validation for all requests and responses.
 * Ensures 100% payload validation and provides clear error messages.
 */

import { env } from '@lib/env';
import {
  z,
  validateLoginRequest,
  validateRegistrationRequest,
  validateAuthResponse,
  validateUserProfile,
  validateCheckoutRequest,
  validateOrderResponse,
  validateShippingQuoteRequest,
  validateShippingQuoteResponse,
  validatePayload,
  apiErrorSchema,
  type LoginRequest,
  type RegistrationRequest,
  type AuthResponse,
  type UserProfile,
  type CheckoutRequest,
  type OrderResponse,
  type ShippingQuoteRequest,
  type ShippingQuoteResponse,
  type ApiError,
} from '@lib/schemas';

/**
 * HTTP Client with validation
 */
class ValidatedApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseUrl = env.NEXT_PUBLIC_API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Set authentication token for subsequent requests
   */
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * Make HTTP request with validation
   */
  private async request<TRequest, TResponse>(
    endpoint: string,
    options: {
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      data?: TRequest;
      requestValidator?: (data: unknown) => TRequest;
      responseValidator: (data: unknown) => TResponse;
      headers?: Record<string, string>;
    }
  ): Promise<TResponse> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = { ...this.defaultHeaders, ...options.headers };

    // Validate request payload if provided
    let validatedData: TRequest | undefined;
    if (options.data && options.requestValidator) {
      try {
        validatedData = options.requestValidator(options.data);
      } catch (error) {
        throw new Error(`Request validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    try {
      const response = await fetch(url, {
        method: options.method,
        headers,
        body: validatedData ? JSON.stringify(validatedData) : undefined,
      });

      const responseText = await response.text();
      let responseData: unknown;

      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(`Invalid JSON response from server: ${responseText.slice(0, 100)}`);
      }

      // Handle HTTP error responses
      if (!response.ok) {
        // Try to parse as API error
        try {
          const apiError = validatePayload(apiErrorSchema, responseData, 'API error');
          throw new ApiValidationError(apiError.message, response.status, apiError);
        } catch (_validationError) {
          // If error response doesn't match schema, throw generic error
          throw new ApiValidationError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status
          );
        }
      }

      // Validate successful response
      try {
        return options.responseValidator(responseData);
      } catch (error) {
        throw new Error(`Response validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } catch (error) {
      if (error instanceof ApiValidationError) {
        throw error;
      }
      
      // Network or other errors
      if (error instanceof Error) {
        throw new Error(`Network error: ${error.message}`);
      }
      
      throw new Error('Unknown network error occurred');
    }
  }

  // Authentication endpoints
  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      data,
      requestValidator: validateLoginRequest,
      responseValidator: validateAuthResponse,
    });
  }

  async register(data: RegistrationRequest): Promise<AuthResponse> {
    return this.request('/auth/register', {
      method: 'POST',
      data,
      requestValidator: validateRegistrationRequest,
      responseValidator: validateAuthResponse,
    });
  }

  async getProfile(): Promise<UserProfile> {
    return this.request('/auth/profile', {
      method: 'GET',
      responseValidator: validateUserProfile,
    });
  }

  async logout(): Promise<{ message: string }> {
    return this.request<never, { message: string }>('/auth/logout', {
      method: 'POST',
      responseValidator: (data: unknown) => {
        const schema = z.object({ message: z.string() });
        return schema.parse(data) as { message: string };
      },
    });
  }

  // Checkout endpoints
  async createOrder(data: CheckoutRequest): Promise<OrderResponse> {
    return this.request('/orders', {
      method: 'POST',
      data,
      requestValidator: validateCheckoutRequest,
      responseValidator: validateOrderResponse,
    });
  }

  async getOrder(orderId: number): Promise<OrderResponse> {
    return this.request(`/orders/${orderId}`, {
      method: 'GET',
      responseValidator: validateOrderResponse,
    });
  }

  // Shipping endpoints
  async getShippingQuote(data: ShippingQuoteRequest): Promise<ShippingQuoteResponse> {
    return this.request('/shipping/quote', {
      method: 'POST',
      data,
      requestValidator: validateShippingQuoteRequest,
      responseValidator: validateShippingQuoteResponse,
    });
  }
}

/**
 * Custom error class for API validation errors
 */
export class ApiValidationError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public apiError?: ApiError
  ) {
    super(message);
    this.name = 'ApiValidationError';
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    if (this.apiError?.errors) {
      // Format validation errors from API
      const fieldErrors = Object.entries(this.apiError.errors)
        .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
        .join('; ');
      return fieldErrors || this.message;
    }
    
    return this.message;
  }

  /**
   * Check if error is due to authentication
   */
  isAuthError(): boolean {
    return this.statusCode === 401 || this.statusCode === 403;
  }

  /**
   * Check if error is due to validation
   */
  isValidationError(): boolean {
    return this.statusCode === 422;
  }

  /**
   * Check if error is server-side
   */
  isServerError(): boolean {
    return this.statusCode ? this.statusCode >= 500 : false;
  }
}

/**
 * Singleton API client instance
 */
export const apiClient = new ValidatedApiClient();

/**
 * Helper function to handle API errors consistently
 */
export const handleApiError = (error: unknown): never => {
  if (error instanceof ApiValidationError) {
    if (error.isAuthError()) {
      // Clear token and redirect to login
      apiClient.clearAuthToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    throw error;
  }

  if (error instanceof Error) {
    throw new ApiValidationError(error.message);
  }

  throw new ApiValidationError('An unexpected error occurred');
};

/**
 * Type-safe API hooks for common operations
 */
export const useApiWithValidation = () => {
  const safeLogin = async (data: Partial<LoginRequest>) => {
    try {
      const validatedData = validateLoginRequest(data);
      return await apiClient.login(validatedData);
    } catch (error) {
      return handleApiError(error);
    }
  };

  const safeRegister = async (data: Partial<RegistrationRequest>) => {
    try {
      const validatedData = validateRegistrationRequest(data);
      return await apiClient.register(validatedData);
    } catch (error) {
      return handleApiError(error);
    }
  };

  const safeCheckout = async (data: Partial<CheckoutRequest>) => {
    try {
      const validatedData = validateCheckoutRequest(data);
      return await apiClient.createOrder(validatedData);
    } catch (error) {
      return handleApiError(error);
    }
  };

  return {
    safeLogin,
    safeRegister,
    safeCheckout,
  };
};