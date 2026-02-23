'use client'

import { Suspense } from 'react'
import LoadingSpinner from '@/components/LoadingSpinner'
import PaymentMethodSelector from '@/components/checkout/PaymentMethodSelector'
import { useTranslations } from '@/contexts/LocaleContext'
import StripeProvider from '@/components/payment/StripeProvider'
import StripePaymentForm from '@/components/payment/StripePaymentForm'
import ShippingChangedModal from '@/components/checkout/ShippingChangedModal'
import CheckoutStepper from '@/components/checkout/CheckoutStepper'
import OrderSummary from './OrderSummary'
import CustomerDetailsForm from './CustomerDetailsForm'
import { useCheckout } from './useCheckout'

function CheckoutContent() {
  const {
    cartItems,
    subtotal,
    loading,
    error,
    paymentMethod,
    setPaymentMethod,
    cardProcessing,
    isMounted,
    stripeClientSecret,
    pendingOrderId,
    orderTotal,
    shippingQuote,
    shippingLoading,
    postalCode,
    setPostalCode,
    cartShippingQuote,
    cartShippingError,
    shippingMismatch,
    savedAddress,
    isGuest,
    user,
    handleSubmit,
    handleStripePaymentSuccess,
    handleStripePaymentError,
    handleCancelPayment,
    handleShippingAccept,
    handleShippingCancel,
    fetchCartShippingQuote,
    clearShippingState,
    t,
  } = useCheckout()

  // SSR/hydration loading
  if (!isMounted) {
    return (
      <main className="min-h-screen bg-neutral-50 py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white border rounded-xl p-6 sm:p-10 text-center">
          <LoadingSpinner text={t('checkoutPage.loading')} />
        </div>
      </main>
    )
  }

  // Empty cart
  if (Object.keys(cartItems).length === 0 && !stripeClientSecret) {
    return (
      <main className="min-h-screen bg-neutral-50 py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white border rounded-xl p-6 sm:p-10 text-center">
          <p className="text-neutral-600 mb-4">{t('checkoutPage.emptyCart')}</p>
          <a href="/products" className="inline-block bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light active:opacity-90 touch-manipulation">
            {t('checkoutPage.viewProducts')}
          </a>
        </div>
      </main>
    )
  }

  // Stripe payment view
  if (stripeClientSecret && pendingOrderId) {
    return (
      <main className="min-h-screen bg-neutral-50 py-8 px-4" data-testid="checkout-page">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold mb-6">{t('checkout.title')}</h1>
          <CheckoutStepper currentStep={3} />

          <div className="bg-white border rounded-xl p-6 mb-6">
            <h2 className="font-semibold mb-4">{t('checkoutPage.cardPayment') || 'Card Payment'}</h2>
            <p className="text-sm text-neutral-600 mb-4">
              {t('checkoutPage.securePayment') || 'Complete your payment securely with Stripe.'}
            </p>

            <StripeProvider clientSecret={stripeClientSecret}>
              <StripePaymentForm
                amount={orderTotal}
                onPaymentSuccess={handleStripePaymentSuccess}
                onPaymentError={handleStripePaymentError}
                disabled={false}
              />
            </StripeProvider>

            {error && (
              <div className="mt-4 text-red-600 text-sm" data-testid="payment-error">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleCancelPayment}
              className="mt-4 w-full h-10 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50"
            >
              {t('checkoutPage.cancelPayment') || 'Cancel and go back'}
            </button>
          </div>
        </div>
      </main>
    )
  }

  // Main checkout view
  return (
    <main className="min-h-screen bg-neutral-50 py-8 px-4" data-testid="checkout-page">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold mb-6" data-testid="checkout-title">{t('checkout.title')}</h1>
        <CheckoutStepper currentStep={1} />

        <OrderSummary
          cartItems={cartItems}
          subtotal={subtotal}
          shippingQuote={shippingQuote}
          cartShippingQuote={cartShippingQuote}
          shippingLoading={shippingLoading}
          postalCode={postalCode}
          cartShippingError={cartShippingError}
        />

        <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6" data-testid="checkout-form">
          <h2 className="font-semibold mb-4">{t('checkoutPage.shippingDetails')}</h2>

          <CustomerDetailsForm
            isGuest={isGuest}
            savedAddress={savedAddress}
            user={user}
            postalCode={postalCode}
            onPostalCodeChange={setPostalCode}
            onFetchShipping={fetchCartShippingQuote}
            onClearShipping={clearShippingState}
          />

          {/* Payment Method Selection */}
          <div className="pt-4 mt-4 border-t">
            <PaymentMethodSelector
              value={paymentMethod}
              onChange={setPaymentMethod}
              disabled={loading}
              codFee={cartShippingQuote?.cod_fee}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm mt-4" data-testid="checkout-error">
              {error}
            </div>
          )}

          {/* Shipping error with retry — prevents silent disabled button */}
          {cartShippingError && !shippingLoading && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between gap-2" data-testid="shipping-error">
              <span>{cartShippingError}</span>
              <button
                type="button"
                onClick={() => fetchCartShippingQuote(postalCode)}
                className="text-red-600 hover:text-red-800 underline text-xs whitespace-nowrap flex-shrink-0"
              >
                {t('common.tryAgain')}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || cardProcessing || !!cartShippingError || shippingLoading || (!shippingQuote && !cartShippingQuote)}
            className="w-full h-12 mt-4 bg-primary hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg text-base touch-manipulation active:opacity-90"
            data-testid="checkout-submit"
          >
            {cardProcessing
              ? t('checkoutPage.redirectingToPayment')
              : loading
                ? t('checkoutPage.processing')
                : paymentMethod === 'card'
                  ? t('checkoutPage.continueToPayment')
                  : t('checkoutPage.completeOrder')}
          </button>

          {/* T3-02: Trust signals for Greek market */}
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-neutral-500">
            <svg className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>{t('checkoutPage.securePaymentTrust')}</span>
          </div>
        </form>
      </div>

      <ShippingChangedModal
        isOpen={shippingMismatch !== null}
        oldAmount={shippingMismatch?.oldAmount ?? 0}
        newAmount={shippingMismatch?.newAmount ?? 0}
        onAccept={handleShippingAccept}
        onCancel={handleShippingCancel}
      />
    </main>
  )
}

export default function CheckoutPage() {
  const t = useTranslations()
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-neutral-50 py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white border rounded-xl p-6 sm:p-10 text-center">
          <LoadingSpinner text={t('checkoutPage.loading')} />
        </div>
      </main>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
