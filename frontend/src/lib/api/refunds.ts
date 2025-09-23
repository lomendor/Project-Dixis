const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001/api/v1';

interface RefundRequest {
  amount_cents?: number;
  reason?: string;
}

interface RefundInfo {
  order_id: number;
  refund_id: string | null;
  refunded_amount_cents: number | null;
  refunded_amount_euros: number | null;
  refunded_at: string | null;
  is_refunded: boolean;
  total_amount_cents: number;
  max_refundable_cents: number;
}

interface RefundResponse {
  success: boolean;
  refund_id?: string;
  amount_cents?: number;
  amount_euros?: number;
  currency?: string;
  status?: string;
  reason?: string;
  created_at?: string;
  error?: string;
  error_message?: string;
}

export const refundApi = {
  /**
   * Get all orders eligible for refunds (admin)
   */
  async getRefundableOrders(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/refunds/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Create a refund for an order
   */
  async createRefund(orderId: number, refundData: RefundRequest): Promise<RefundResponse> {
    const response = await fetch(`${API_BASE_URL}/refunds/orders/${orderId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify(refundData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Get refund information for a specific order
   */
  async getRefundInfo(orderId: number): Promise<{ success: boolean; refund_info: RefundInfo }> {
    const response = await fetch(`${API_BASE_URL}/refunds/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};