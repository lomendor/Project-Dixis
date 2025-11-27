/**
 * Viva Wallet API Client
 * Handles authentication and API calls to Viva Wallet Smart Checkout
 */

import { getVivaWalletConfig, type VivaWalletConfig } from './config';
import type {
  VivaTokenResponse,
  VivaCreateOrderRequest,
  VivaCreateOrderResponse,
  VivaCheckoutUrl,
  VivaOrderDetailsResponse,
  VivaRefundResponse,
  VivaTransactionStatus,
} from './types';

export class VivaWalletClient {
  private config: VivaWalletConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.config = getVivaWalletConfig();
  }

  /**
   * Get OAuth2 access token (with caching)
   */
  async getAccessToken(): Promise<string> {
    // Return cached token if still valid (with 60s buffer)
    if (this.accessToken && Date.now() < this.tokenExpiry - 60000) {
      return this.accessToken;
    }

    const credentials = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`
    ).toString('base64');

    const response = await fetch(this.config.authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Viva auth failed: ${response.status} - ${error}`);
    }

    const data: VivaTokenResponse = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + data.expires_in * 1000;

    return this.accessToken;
  }

  /**
   * Create a payment order
   */
  async createOrder(
    amountCents: number,
    merchantRef: string,
    customerDescription?: string
  ): Promise<VivaCreateOrderResponse> {
    const token = await this.getAccessToken();

    const orderData: VivaCreateOrderRequest = {
      amount: amountCents,
      merchantTrns: merchantRef,
      customerTrns: customerDescription || `Order ${merchantRef}`,
      sourceCode: this.config.sourceCode,
      disableCash: true, // Online payments only
      disableExactAmount: false,
    };

    const response = await fetch(
      `${this.config.baseUrl}/checkout/v2/orders`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Create order failed: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Get the checkout URL for a payment order
   */
  getCheckoutUrl(orderCode: number): VivaCheckoutUrl {
    return {
      orderCode,
      redirectUrl: `${this.config.checkoutUrl}?ref=${orderCode}`,
    };
  }

  /**
   * Get order details including transaction status
   */
  async getOrderDetails(orderCode: number): Promise<VivaOrderDetailsResponse> {
    const token = await this.getAccessToken();

    const response = await fetch(
      `${this.config.baseUrl}/checkout/v2/orders/${orderCode}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Get order failed: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Check if an order is paid
   */
  async isOrderPaid(orderCode: number): Promise<boolean> {
    const details = await this.getOrderDetails(orderCode);
    // Check if any transaction has status 'F' (Fulfilled)
    return details.transactions?.some(t => t.statusId === 'F') ?? false;
  }

  /**
   * Get the status of an order
   */
  async getOrderStatus(orderCode: number): Promise<VivaTransactionStatus | null> {
    const details = await this.getOrderDetails(orderCode);
    // Return the latest transaction status
    if (details.transactions && details.transactions.length > 0) {
      return details.transactions[details.transactions.length - 1].statusId;
    }
    return null;
  }

  /**
   * Refund a transaction (full or partial)
   */
  async refund(transactionId: string, amountCents?: number): Promise<VivaRefundResponse> {
    const token = await this.getAccessToken();

    const url = amountCents
      ? `${this.config.baseUrl}/api/transactions/${transactionId}?amount=${amountCents}`
      : `${this.config.baseUrl}/api/transactions/${transactionId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Refund failed: ${response.status} - ${error}`);
    }

    return response.json();
  }
}

// Singleton instance
let clientInstance: VivaWalletClient | null = null;

export function getVivaWalletClient(): VivaWalletClient {
  if (!clientInstance) {
    clientInstance = new VivaWalletClient();
  }
  return clientInstance;
}
