/**
 * Viva Wallet API Types
 * Based on Viva Wallet Smart Checkout API documentation
 */

// OAuth2 Authentication
export interface VivaTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// Payment Order
export interface VivaCreateOrderRequest {
  amount: number; // Amount in cents (e.g., 1000 = 10.00 EUR)
  customerTrns?: string; // Customer description shown on statement
  merchantTrns?: string; // Merchant reference (order ID)
  sourceCode: string; // Payment source code from Viva dashboard
  disableCash?: boolean;
  disableCard?: boolean;
  disableExactAmount?: boolean;
  disableWallet?: boolean;
}

export interface VivaCreateOrderResponse {
  orderCode: number; // The unique order code to use for payment
}

// Payment URL
export interface VivaCheckoutUrl {
  redirectUrl: string;
  orderCode: number;
}

// Transaction Status
export type VivaTransactionStatus =
  | 'E' // Pending
  | 'A' // Active (awaiting payment)
  | 'C' // Cancelled
  | 'F' // Fulfilled (paid)
  | 'R' // Refunded
  | 'X' // Expired
  | 'M' // Partially refunded;

export interface VivaTransactionResponse {
  email: string;
  amount: number;
  orderCode: number;
  statusId: VivaTransactionStatus;
  fullName: string;
  insDate: string;
  cardNumber: string;
  currencyCode: string;
  customerTrns: string;
  merchantTrns: string;
  transactionTypeId: number;
  recurringSupport: boolean;
  totalInstallments: number;
  cardCountryCode: string;
  cardIssuingBank: string;
  currentInstallment: number;
  cardUniqueReference: string;
  cardTypeId: number;
}

export interface VivaOrderDetailsResponse {
  orderCode: number;
  merchantTrns: string;
  customerTrns: string;
  sourceCode: string;
  createdDate: string;
  stateId: number;
  requestAmount: number;
  isConverted: boolean;
  paymentId: string;
  transactions: VivaTransactionResponse[];
}

// Refund
export interface VivaRefundRequest {
  amount?: number; // Optional: partial refund in cents
  sourceCode: string;
}

export interface VivaRefundResponse {
  transactionId: string;
}

// Webhook Events
export interface VivaWebhookPayload {
  EventTypeId: number;
  EventData: {
    TransactionId: string;
    OrderCode: number;
    Amount: number;
    StatusId: VivaTransactionStatus;
    Email?: string;
    MerchantTrns?: string;
    CustomerTrns?: string;
  };
  Created: string;
  CorrelationId: string;
}

// Common webhook event types
export const VIVA_WEBHOOK_EVENTS = {
  TRANSACTION_PAYMENT_CREATED: 1796,
  TRANSACTION_FAILED: 1797,
  TRANSACTION_REVERSED: 1798,
  TRANSACTION_REFUNDED: 1799,
} as const;
