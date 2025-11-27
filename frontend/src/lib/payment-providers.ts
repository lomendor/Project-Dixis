/**
 * Payment Provider Abstraction
 * Supports multiple payment providers with a unified interface
 */

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface PaymentInitResult {
  clientSecret?: string;
  redirectUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaymentProvider {
  name: string;
  initPayment(orderId: string, amountCents: number, currency: string): Promise<PaymentInitResult>;
  confirmPayment(orderId: string, token?: string): Promise<PaymentResult>;
  isSupported(): boolean;
}

/**
 * Fake Payment Provider for development and testing
 * Always succeeds to allow for easy testing of the checkout flow
 */
export class FakePaymentProvider implements PaymentProvider {
  name = 'FakePaymentProvider';

  /**
   * Initialize a payment with the fake provider
   */
  async initPayment(
    orderId: string,
    amountCents: number,
    currency: string = 'EUR'
  ): Promise<PaymentInitResult> {
    // Simulate API delay
    await this.simulateDelay(500, 1500);

    // Random chance of failure for testing (uncomment for failure simulation)
    // if (Math.random() < 0.1) {
    //   throw new Error('Simulated payment initialization failure');
    // }

    return {
      clientSecret: `fake_client_secret_${orderId}_${Date.now()}`,
      metadata: {
        provider: this.name,
        orderId,
        amountCents,
        currency,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Confirm a payment with the fake provider
   */
  async confirmPayment(orderId: string, token?: string): Promise<PaymentResult> {
    // Simulate processing delay
    await this.simulateDelay(1000, 3000);

    // Random chance of failure for testing (uncomment for failure simulation)
    // if (Math.random() < 0.05) {
    //   return {
    //     success: false,
    //     error: 'Simulated payment processing failure',
    //   };
    // }

    const transactionId = `fake_txn_${orderId}_${Date.now()}`;

    return {
      success: true,
      transactionId,
      metadata: {
        provider: this.name,
        orderId,
        token,
        processedAt: new Date().toISOString(),
        method: 'fake_card',
        last4: '4242',
      },
    };
  }

  /**
   * Check if this provider is supported in the current environment
   */
  isSupported(): boolean {
    // Fake provider is always supported in development
    return process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_FAKE_PAYMENT === 'true';
  }

  /**
   * Simulate network delay for realistic testing
   */
  private async simulateDelay(minMs: number = 500, maxMs: number = 2000): Promise<void> {
    const delay = Math.random() * (maxMs - minMs) + minMs;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

/**
 * Viva Wallet Payment Provider
 * Uses Viva Wallet Smart Checkout (hosted payment page)
 */
export class VivaWalletProvider implements PaymentProvider {
  name = 'VivaWallet';

  /**
   * Initialize a payment by creating a Viva order and returning the redirect URL
   */
  async initPayment(
    orderId: string,
    amountCents: number,
    _currency: string = 'EUR'
  ): Promise<PaymentInitResult> {
    // Dynamic import to avoid loading Viva client when not needed
    const { getVivaWalletClient, isVivaWalletConfigured } = await import('./viva-wallet');

    if (!isVivaWalletConfigured()) {
      throw new Error('Viva Wallet is not configured');
    }

    const client = getVivaWalletClient();

    // Create order in Viva Wallet
    const response = await client.createOrder(
      amountCents,
      orderId,
      `Παραγγελία #${orderId}`
    );

    // Get checkout redirect URL
    const checkout = client.getCheckoutUrl(response.orderCode);

    return {
      redirectUrl: checkout.redirectUrl,
      metadata: {
        provider: this.name,
        orderId,
        vivaOrderCode: response.orderCode,
        amountCents,
        createdAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Confirm a payment by checking Viva order status
   * @param orderId Our internal order ID
   * @param token The Viva orderCode (passed back after redirect)
   */
  async confirmPayment(orderId: string, token?: string): Promise<PaymentResult> {
    const { getVivaWalletClient, isVivaWalletConfigured } = await import('./viva-wallet');

    if (!isVivaWalletConfigured()) {
      return {
        success: false,
        error: 'Viva Wallet is not configured',
      };
    }

    if (!token) {
      return {
        success: false,
        error: 'Missing Viva orderCode token',
      };
    }

    const orderCode = parseInt(token, 10);
    if (isNaN(orderCode)) {
      return {
        success: false,
        error: 'Invalid Viva orderCode format',
      };
    }

    const client = getVivaWalletClient();

    try {
      const orderDetails = await client.getOrderDetails(orderCode);

      // Check for successful transaction (status 'F' = Fulfilled)
      const successfulTransaction = orderDetails.transactions?.find(t => t.statusId === 'F');

      if (successfulTransaction) {
        // Use paymentId from order details or orderCode as transaction reference
        const txnId = orderDetails.paymentId || `viva-${orderCode}`;
        return {
          success: true,
          transactionId: txnId,
          metadata: {
            provider: this.name,
            orderId,
            vivaOrderCode: orderCode,
            vivaPaymentId: orderDetails.paymentId,
            amount: successfulTransaction.amount,
            processedAt: new Date().toISOString(),
          },
        };
      }

      // Check for pending or failed status
      const latestTransaction = orderDetails.transactions?.[orderDetails.transactions.length - 1];
      return {
        success: false,
        error: latestTransaction
          ? `Η πληρωμή δεν ολοκληρώθηκε (status: ${latestTransaction.statusId})`
          : 'Δεν βρέθηκε συναλλαγή για αυτή την παραγγελία',
        metadata: {
          vivaOrderCode: orderCode,
          status: latestTransaction?.statusId,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Σφάλμα ελέγχου πληρωμής: ${error instanceof Error ? error.message : 'Άγνωστο σφάλμα'}`,
      };
    }
  }

  /**
   * Check if Viva Wallet is configured and enabled
   * Note: Full config validation happens in initPayment()
   */
  isSupported(): boolean {
    const provider = process.env.PAYMENT_PROVIDER?.toLowerCase();
    return provider === 'viva' || provider === 'vivawallet';
  }
}

/**
 * Stripe Payment Provider (placeholder for future implementation)
 */
export class StripeProvider implements PaymentProvider {
  name = 'Stripe';

  async initPayment(orderId: string, amountCents: number, currency: string): Promise<PaymentInitResult> {
    // TODO: Implement Stripe API integration
    throw new Error('Stripe provider not yet implemented');
  }

  async confirmPayment(orderId: string, token?: string): Promise<PaymentResult> {
    // TODO: Implement Stripe confirmation
    throw new Error('Stripe provider not yet implemented');
  }

  isSupported(): boolean {
    return false; // Not implemented yet
  }
}

/**
 * Payment Manager - handles provider selection and fallbacks
 */
export class PaymentManager {
  private providers: PaymentProvider[];
  private defaultProvider: PaymentProvider;

  constructor() {
    this.providers = [
      new FakePaymentProvider(),
      new VivaWalletProvider(),
      new StripeProvider(),
    ];

    // Set default provider (first supported one)
    this.defaultProvider = this.providers.find(p => p.isSupported()) || new FakePaymentProvider();
  }

  /**
   * Get the current active payment provider
   */
  getActiveProvider(): PaymentProvider {
    return this.defaultProvider;
  }

  /**
   * Get all available providers
   */
  getAvailableProviders(): PaymentProvider[] {
    return this.providers.filter(p => p.isSupported());
  }

  /**
   * Initialize payment with the active provider
   */
  async initPayment(orderId: string, amountCents: number, currency: string = 'EUR'): Promise<PaymentInitResult> {
    const provider = this.getActiveProvider();

    try {
      return await provider.initPayment(orderId, amountCents, currency);
    } catch (error) {
      console.error(`Payment initialization failed with ${provider.name}:`, error);
      throw new Error(`Αποτυχία προετοιμασίας πληρωμής: ${error instanceof Error ? error.message : 'Άγνωστο σφάλμα'}`);
    }
  }

  /**
   * Confirm payment with the active provider
   */
  async confirmPayment(orderId: string, token?: string): Promise<PaymentResult> {
    const provider = this.getActiveProvider();

    try {
      return await provider.confirmPayment(orderId, token);
    } catch (error) {
      console.error(`Payment confirmation failed with ${provider.name}:`, error);
      return {
        success: false,
        error: `Αποτυχία επεξεργασίας πληρωμής: ${error instanceof Error ? error.message : 'Άγνωστο σφάλμα'}`,
      };
    }
  }

  /**
   * Set a specific provider (for testing or configuration)
   */
  setProvider(providerName: string): void {
    const provider = this.providers.find(p => p.name === providerName && p.isSupported());
    if (provider) {
      this.defaultProvider = provider;
    } else {
      throw new Error(`Provider ${providerName} not found or not supported`);
    }
  }
}

// Singleton instance
export const paymentManager = new PaymentManager();

/**
 * Convenience functions for external use
 */
export async function initPayment(orderId: string, amountCents: number, currency: string = 'EUR'): Promise<PaymentInitResult> {
  return paymentManager.initPayment(orderId, amountCents, currency);
}

export async function confirmPayment(orderId: string, token?: string): Promise<PaymentResult> {
  return paymentManager.confirmPayment(orderId, token);
}

export function getActivePaymentProvider(): PaymentProvider {
  return paymentManager.getActiveProvider();
}