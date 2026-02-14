/**
 * Sentry Business Events — Strategic Fix 3C
 *
 * Tracks business-critical events beyond crash reporting:
 * checkout flow, shipping failures, cart edge cases.
 *
 * Safe to call even when Sentry DSN is not configured —
 * all calls are wrapped in try/catch to avoid breaking the app.
 */
import * as Sentry from '@sentry/nextjs'

type CheckoutMeta = {
  itemCount: number
  subtotalCents: number
  paymentMethod: 'cod' | 'card'
  isGuest: boolean
  postalCode?: string
  shippingSource?: string
}

/** User clicked "Place Order" — form submitted */
export function trackCheckoutStarted(meta: CheckoutMeta) {
  try {
    Sentry.addBreadcrumb({
      category: 'checkout',
      message: 'checkout_started',
      level: 'info',
      data: meta,
    })
  } catch { /* non-critical */ }
}

/** Order created successfully — redirecting to thank-you */
export function trackCheckoutCompleted(meta: CheckoutMeta & { orderId: number | string }) {
  try {
    Sentry.addBreadcrumb({
      category: 'checkout',
      message: 'checkout_completed',
      level: 'info',
      data: meta,
    })
  } catch { /* non-critical */ }
}

/** Order creation failed — API error */
export function trackCheckoutFailed(meta: CheckoutMeta & { errorCode?: string; errorStatus?: number; errorMessage?: string }) {
  try {
    Sentry.captureMessage('checkout_failed', {
      level: 'warning',
      tags: {
        'checkout.error_code': meta.errorCode || 'unknown',
        'checkout.error_status': String(meta.errorStatus || 0),
        'checkout.payment_method': meta.paymentMethod,
        'checkout.is_guest': String(meta.isGuest),
      },
      extra: meta,
    })
  } catch { /* non-critical */ }
}

/** Shipping quote API call failed */
export function trackShippingQuoteFailed(data: { postalCode: string; errorCode?: string; errorMessage?: string; fallbackUsed: boolean }) {
  try {
    Sentry.addBreadcrumb({
      category: 'shipping',
      message: 'shipping_quote_failed',
      level: 'warning',
      data,
    })
  } catch { /* non-critical */ }
}

/** User attempted checkout with no shipping quote */
export function trackShippingQuoteNull(data: { postalCode: string; itemCount: number }) {
  try {
    Sentry.captureMessage('shipping_quote_null_at_checkout', {
      level: 'warning',
      tags: { 'shipping.postal_code': data.postalCode },
      extra: data,
    })
  } catch { /* non-critical */ }
}

/** Card payment init or confirm failed */
export function trackCardPaymentFailed(data: { orderId: number | string; stage: 'init' | 'confirm'; errorMessage?: string }) {
  try {
    Sentry.captureMessage('card_payment_failed', {
      level: 'warning',
      tags: {
        'payment.stage': data.stage,
      },
      extra: data,
    })
  } catch { /* non-critical */ }
}
