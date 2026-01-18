/**
 * Payment API Client
 * Handles payment-related API calls including Stripe integration
 */

export interface PaymentMethodsResponse {
  active_provider: string;
  supported_payment_methods: string[];
  available_providers: string[];
  stripe_public_key?: string;
}

export interface PaymentIntentResponse {
  message: string;
  payment: {
    client_secret: string;
    payment_intent_id: string;
    requires_action?: boolean;
    payment_method_types: string[];
    amount: number;
    currency: string;
    status: string;
  };
  order: {
    id: number;
    total_amount: string;
    payment_status: string;
  };
}

export interface PaymentConfirmationResponse {
  message: string;
  payment: {
    payment_intent_id: string;
    status: string;
    amount_received: number;
    currency: string;
    paid_at: string;
  };
  order: {
    id: number;
    payment_status: string;
    status: string;
  };
}

export interface PaymentStatusResponse {
  message: string;
  payment: {
    payment_intent_id: string;
    status: string;
    amount_received?: number;
    currency?: string;
    last_payment_error?: string;
  };
  order: {
    id: number;
    payment_status: string;
    status: string;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';

class PaymentApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('auth_token');
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(`HTTP ${response.status}: ${error.message || 'Unknown error'}`);
    }

    return response.json();
  }

  async getPaymentMethods(): Promise<PaymentMethodsResponse> {
    return this.request<PaymentMethodsResponse>('/payment/methods');
  }

  async initPayment(
    orderId: number,
    options: {
      customer?: {
        email?: string;
        firstName?: string;
        lastName?: string;
      };
      return_url?: string;
    } = {}
  ): Promise<PaymentIntentResponse> {
    return this.request<PaymentIntentResponse>(`/payments/orders/${orderId}/init`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  async confirmPayment(
    orderId: number,
    paymentIntentId: string
  ): Promise<PaymentConfirmationResponse> {
    return this.request<PaymentConfirmationResponse>(`/payments/orders/${orderId}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ payment_intent_id: paymentIntentId }),
    });
  }

  async cancelPayment(orderId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/payments/orders/${orderId}/cancel`, {
      method: 'POST',
    });
  }

  async getPaymentStatus(orderId: number): Promise<PaymentStatusResponse> {
    return this.request<PaymentStatusResponse>(`/payments/orders/${orderId}/status`);
  }
}

export const paymentApi = new PaymentApiClient();