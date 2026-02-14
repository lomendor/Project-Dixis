'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCart, cartTotalCents } from '@/lib/cart'
import { apiClient } from '@/lib/api'
import { paymentApi } from '@/lib/api/payment'
import { useAuth } from '@/hooks/useAuth'
import { useTranslations } from '@/contexts/LocaleContext'
import { useToast } from '@/contexts/ToastContext'
import type { PaymentMethod } from '@/components/checkout/PaymentMethodSelector'
import type { ShippingQuote, CartShippingQuote } from './types'
import {
  trackCheckoutStarted,
  trackCheckoutCompleted,
  trackCheckoutFailed,
  trackShippingQuoteFailed,
  trackShippingQuoteNull,
  trackCardPaymentFailed,
} from '@/lib/sentry-events'

export function useCheckout() {
  const router = useRouter()
  const cartItems = useCart(s => s.items)
  const clear = useCart(s => s.clear)
  const { isAuthenticated, user } = useAuth()
  const t = useTranslations()
  const { showToast } = useToast()

  // --- State ---
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')
  const [cardProcessing, setCardProcessing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null)
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null)
  const [pendingThankYouId, setPendingThankYouId] = useState<string | number | null>(null)
  const [orderTotal, setOrderTotal] = useState<number>(0)
  const [shippingQuote, setShippingQuote] = useState<ShippingQuote | null>(null)
  const [shippingLoading, setShippingLoading] = useState(false)
  const [postalCode, setPostalCode] = useState('')
  const [cartShippingQuote, setCartShippingQuote] = useState<CartShippingQuote | null>(null)
  const [cartShippingError, setCartShippingError] = useState<string | null>(null)
  const [shippingMismatch, setShippingMismatch] = useState<{
    oldAmount: number
    newAmount: number
  } | null>(null)
  const [savedAddress, setSavedAddress] = useState<{
    name?: string
    line1?: string
    city?: string
    postal_code?: string
    phone?: string
  } | null>(null)

  const idempotencyKeyRef = useRef<string>(crypto.randomUUID())
  const isGuest = !isAuthenticated

  // --- Derived ---
  const subtotalCents = cartTotalCents(cartItems)
  const subtotal = subtotalCents / 100

  // --- Effects ---
  useEffect(() => { setIsMounted(true) }, [])

  // Fetch saved address for logged-in users
  useEffect(() => {
    if (isAuthenticated) {
      apiClient.getShippingAddress()
        .then((data) => {
          if (data.address) {
            setSavedAddress(data.address)
            if (data.address.postal_code && /^\d{5}$/.test(data.address.postal_code)) {
              setPostalCode(data.address.postal_code)
            }
          }
        })
        .catch(() => {
          // Silent fail — saved address is optional enhancement
        })
    }
  }, [isAuthenticated])

  // Fetch per-producer cart shipping quote
  const fetchCartShippingQuote = useCallback(async (postal: string, pmMethod?: PaymentMethod) => {
    if (!postal || !/^\d{5}$/.test(postal)) {
      setCartShippingQuote(null)
      setCartShippingError(null)
      setShippingQuote(null)
      return
    }

    const itemCount = Object.keys(cartItems).length
    if (itemCount === 0) {
      setCartShippingQuote(null)
      setCartShippingError(null)
      setShippingQuote(null)
      return
    }

    setShippingLoading(true)
    setCartShippingError(null)
    try {
      const items = Object.values(cartItems).map(item => ({
        product_id: parseInt(item.id.toString()),
        quantity: item.qty
      }))

      const selectedMethod = pmMethod ?? paymentMethod
      const quote = await apiClient.getCartShippingQuote({
        postal_code: postal,
        method: 'HOME',
        items,
        payment_method: selectedMethod === 'card' ? 'CARD' : 'COD',
      })

      setCartShippingQuote(quote)
      setShippingQuote({
        price_eur: quote.total_shipping,
        zone_name: quote.zone_name,
        free_shipping: quote.total_shipping === 0,
        source: 'cart_quote',
      })
    } catch (err: any) {
      if (err?.code === 'ZONE_UNAVAILABLE') {
        trackShippingQuoteFailed({ postalCode: postal, errorCode: 'ZONE_UNAVAILABLE', fallbackUsed: false })
        setCartShippingError(t('checkoutPage.shippingUnavailable'))
        setCartShippingQuote(null)
        setShippingQuote(null)
      } else {
        setCartShippingQuote(null)
        setCartShippingError(null)
        try {
          const legacyQuote = await apiClient.getZoneShippingQuote({
            postal_code: postal,
            method: 'HOME',
            subtotal: subtotal,
          })
          trackShippingQuoteFailed({ postalCode: postal, errorCode: err?.code, fallbackUsed: true })
          setShippingQuote({
            price_eur: legacyQuote.price_eur,
            zone_name: legacyQuote.zone_name,
            free_shipping: legacyQuote.free_shipping,
            source: legacyQuote.source,
          })
        } catch {
          trackShippingQuoteFailed({ postalCode: postal, errorCode: err?.code, fallbackUsed: false })
          setShippingQuote(null)
        }
      }
    } finally {
      setShippingLoading(false)
    }
  }, [cartItems, subtotal, t, paymentMethod])

  // Auto-fetch shipping when postal code is pre-filled from saved address
  useEffect(() => {
    if (postalCode && postalCode.length === 5 && !shippingQuote && !shippingLoading) {
      fetchCartShippingQuote(postalCode)
    }
  }, [postalCode, savedAddress]) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when payment method changes (COD fee differs)
  useEffect(() => {
    if (postalCode && postalCode.length === 5) {
      fetchCartShippingQuote(postalCode, paymentMethod)
    }
  }, [paymentMethod]) // eslint-disable-line react-hooks/exhaustive-deps

  // --- Handlers ---

  function clearShippingState() {
    setCartShippingQuote(null)
    setShippingQuote(null)
    setCartShippingError(null)
  }

  async function handleStripePaymentSuccess(paymentIntentId: string) {
    if (!pendingOrderId) {
      setError('Σφάλμα: Δεν βρέθηκε η παραγγελία. Παρακαλώ δοκιμάστε ξανά.')
      return
    }
    if (!paymentIntentId || typeof paymentIntentId !== 'string' || !paymentIntentId.startsWith('pi_')) {
      setError('Σφάλμα: Μη έγκυρο αναγνωριστικό πληρωμής. Παρακαλώ δοκιμάστε ξανά.')
      return
    }

    try {
      await paymentApi.confirmPayment(pendingOrderId, paymentIntentId)
      trackCheckoutCompleted({
        itemCount: Object.keys(cartItems).length,
        subtotalCents,
        paymentMethod: 'card',
        isGuest,
        orderId: pendingOrderId,
      })
      showToast('success', 'Η πληρωμή ολοκληρώθηκε επιτυχώς')
      clear()
      router.push(`/thank-you?token=${pendingThankYouId ?? pendingOrderId}`)
    } catch (err) {
      trackCardPaymentFailed({ orderId: pendingOrderId, stage: 'confirm', errorMessage: err instanceof Error ? err.message : undefined })
      const errorMessage = err instanceof Error ? err.message : t('checkoutPage.cardPaymentError')
      setError(errorMessage)
    }
  }

  function handleStripePaymentError(errorMessage: string) {
    setError(errorMessage)
    setCardProcessing(false)
  }

  function handleCancelPayment() {
    setStripeClientSecret(null)
    setPendingOrderId(null)
    setPendingThankYouId(null)
    setOrderTotal(0)
    setCardProcessing(false)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (isGuest && paymentMethod === 'card') {
      setError('Για πληρωμή με κάρτα απαιτείται σύνδεση.')
      return
    }

    if (!shippingQuote && !cartShippingQuote && !shippingLoading) {
      trackShippingQuoteNull({ postalCode, itemCount: Object.keys(cartItems).length })
      setError('Εισάγετε ταχυδρομικό κώδικα για υπολογισμό μεταφορικών.')
      return
    }

    const checkoutMeta = {
      itemCount: Object.keys(cartItems).length,
      subtotalCents,
      paymentMethod: paymentMethod as 'cod' | 'card',
      isGuest,
      postalCode,
      shippingSource: cartShippingQuote ? 'cart_quote' : shippingQuote?.source,
    }
    trackCheckoutStarted(checkoutMeta)

    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    const body = {
      customer: {
        name: formData.get('name') as string,
        phone: formData.get('phone') as string,
        email: (formData.get('email') as string) || undefined,
        address: formData.get('address') as string,
        city: formData.get('city') as string,
        postcode: formData.get('postcode') as string
      },
      items: Object.values(cartItems).map(item => ({
        id: item.id,
        qty: item.qty
      })),
      paymentMethod
    }

    try {
      apiClient.refreshToken()

      const shippingAddress = {
        name: body.customer.name,
        phone: body.customer.phone,
        email: body.customer.email,
        line1: body.customer.address,
        city: body.customer.city,
        postal_code: body.customer.postcode,
        country: 'GR'
      }

      const orderData = {
        items: Object.values(cartItems).map(item => ({
          product_id: parseInt(item.id.toString()),
          quantity: item.qty
        })),
        currency: 'EUR' as const,
        shipping_method: 'HOME' as const,
        payment_method: paymentMethod === 'card' ? 'CARD' as const : 'COD' as const,
        shipping_address: shippingAddress,
        notes: '',
        quoted_shipping: cartShippingQuote?.total_shipping ?? shippingQuote?.price_eur ?? undefined,
        quoted_at: cartShippingQuote?.quoted_at ?? undefined,
      }

      const order = await apiClient.createOrder(orderData, idempotencyKeyRef.current)
      idempotencyKeyRef.current = crypto.randomUUID()

      const paymentOrderId = order.payment_order_id ?? order.id
      const thankYouToken = order.public_token || order.id

      sessionStorage.setItem('dixis:last-order-customer', JSON.stringify(body.customer))

      // Card payment via Stripe
      if (paymentMethod === 'card') {
        setCardProcessing(true)
        try {
          const paymentInit = await paymentApi.initPayment(paymentOrderId, {
            customer: {
              email: body.customer.email,
              firstName: body.customer.name.split(' ')[0],
              lastName: body.customer.name.split(' ').slice(1).join(' ') || undefined,
            },
            return_url: `${window.location.origin}/thank-you?token=${thankYouToken}`,
          })

          setPendingOrderId(paymentOrderId)
          setPendingThankYouId(thankYouToken)
          setOrderTotal(paymentInit.payment.amount / 100)
          setStripeClientSecret(paymentInit.payment.client_secret)
          setLoading(false)
          return
        } catch {
          trackCardPaymentFailed({ orderId: paymentOrderId, stage: 'init' })
          setError(t('checkoutPage.cardPaymentError'))
          setCardProcessing(false)
          setLoading(false)
          return
        }
      }

      // COD: Clear cart and redirect
      trackCheckoutCompleted({ ...checkoutMeta, orderId: order.id })
      clear()
      router.push(`/thank-you?token=${thankYouToken}`)
    } catch (err: any) {
      if (err?.code === 'SHIPPING_CHANGED' && err?.quoted_total != null && err?.locked_total != null) {
        setShippingMismatch({
          oldAmount: err.quoted_total,
          newAmount: err.locked_total,
        })
        setLoading(false)
        return
      }
      trackCheckoutFailed({
        ...checkoutMeta,
        errorCode: err?.code,
        errorStatus: err?.status,
        errorMessage: err?.message,
      })
      if (err?.status === 409) {
        setError(t('checkoutPage.stockError') || 'Κάποια προϊόντα δεν είναι διαθέσιμα. Ελέγξτε το καλάθι σας.')
      } else if (err?.status === 400) {
        setError(err?.message || t('checkoutPage.orderError'))
      } else {
        setError(t('checkoutPage.orderError'))
      }
      setPendingOrderId(null)
      setPendingThankYouId(null)
      setStripeClientSecret(null)
    } finally {
      setLoading(false)
    }
  }

  function handleShippingAccept() {
    setShippingMismatch(null)
    if (postalCode.length === 5) {
      fetchCartShippingQuote(postalCode)
    }
  }

  function handleShippingCancel() {
    setShippingMismatch(null)
  }

  return {
    // State
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
    pendingThankYouId,
    // Handlers
    handleSubmit,
    handleStripePaymentSuccess,
    handleStripePaymentError,
    handleCancelPayment,
    handleShippingAccept,
    handleShippingCancel,
    fetchCartShippingQuote,
    clearShippingState,
    t,
  }
}
