'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useMemo } from 'react'
import { useCart, cartTotalCents } from '@/lib/cart'
import { calcTotals, fmtEUR } from '@/lib/cart/totals'
import { DEFAULT_OPTIONS, calculateShippingCost, type ShippingMethod } from '@/contracts/shipping'
import { useTranslations } from 'next-intl'
import ShippingBreakdown from '@/components/checkout/ShippingBreakdown'
import type { QuoteResponse } from '@/lib/quoteClient'
import { apiClient } from '@/lib/api'

// Shipping method options for UI (Pass 48)
const SHIPPING_OPTIONS: Array<{
  code: 'HOME' | 'PICKUP' | 'COURIER';
  label: string;
  labelEl: string;
  cost: number;
  etaDays?: string;
}> = [
  { code: 'HOME', label: 'Home Delivery', labelEl: 'Παράδοση στο σπίτι', cost: 3.50, etaDays: '2-3 ημέρες' },
  { code: 'PICKUP', label: 'Store Pickup', labelEl: 'Παραλαβή από κατάστημα', cost: 0, etaDays: 'Άμεση' },
  { code: 'COURIER', label: 'Courier', labelEl: 'Μεταφορική εταιρεία', cost: 4.50, etaDays: '1-2 ημέρες' },
];

// Free shipping threshold (€)
const FREE_SHIPPING_THRESHOLD = 35;

// Helper to derive total from subtotal + shipping + cod
function deriveTotal(subtotal: number, shipping: number, cod: number = 0) {
  return Number((subtotal + shipping + cod).toFixed(2));
}

export default function CheckoutClient(){
  const router = useRouter()
  const searchParams = useSearchParams()
  const err = searchParams?.get('err') || null
  const t = useTranslations()

  // Use Zustand cart
  const cartItems = useCart(state => state.items)
  const clearCart = useCart(state => state.clear)
  const items = Object.values(cartItems) // Convert Record to array

  // Pass 48: Shipping method selection state
  const [shippingMethod, setShippingMethod] = useState<'HOME' | 'PICKUP' | 'COURIER'>('HOME')
  const [loading, setLoading] = useState(false)

  // Live totals state from ShippingBreakdown
  const [liveTotals, setLiveTotals] = useState<{shipping:number; cod:number; total:number; free:boolean}>({
    shipping: 0,
    cod: 0,
    total: 0,
    free: false
  })

  // Find shipping option details
  const shippingOption = SHIPPING_OPTIONS.find(opt => opt.code === shippingMethod) || SHIPPING_OPTIONS[0]

  // Map Zustand cart items (priceCents) to totals format (price in cents)
  const lines = items.map(i => ({ price: i.priceCents, qty: i.qty }))

  // Calculate subtotal in euros
  const subtotalEur = lines.reduce((sum, l) => sum + (l.price * l.qty) / 100, 0)

  // Pass 48: Calculate shipping cost (free over threshold)
  const shippingCost = useMemo(() => {
    if (shippingMethod === 'PICKUP') return 0
    if (subtotalEur >= FREE_SHIPPING_THRESHOLD) return 0
    return shippingOption.cost
  }, [shippingMethod, subtotalEur, shippingOption.cost])

  const totals = calcTotals({
    items: lines,
    shippingMethod,
    baseShipping: shippingCost * 100, // Convert to cents
    codFee: 0, // No COD fee in this flow
    taxRate: 0.24 // 24% VAT
  })

  // Callback when ShippingBreakdown gets new quote
  function onQuoteUpdate(q: QuoteResponse | null) {
    try {
      if (!q) return;
      setLiveTotals({
        shipping: q.shippingCost || 0,
        cod: q.codFee || 0,
        total: deriveTotal(totals.subtotal / 100, q.shippingCost || 0, q.codFee || 0),
        free: !!q.freeShipping
      });
    } catch (e) {
      // noop - graceful degradation
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name  = String(formData.get('name')||'').trim()
    const phone = String(formData.get('phone')||'').trim()
    const email = String(formData.get('email')||'').trim()
    const line1 = String(formData.get('line1')||'').trim()
    const city  = String(formData.get('city')||'').trim()
    const postal= String(formData.get('postal')||'').trim()

    if(!items.length){ router.push('/cart'); return }
    if(!name || !phone || !line1 || !city || !postal){
      router.push('/checkout?err=missing')
      return
    }

    setLoading(true)
    try{
      // Pass 44: Use Laravel API directly (Single Source of Truth)
      // Pass 48: Include shipping_cost in order creation
      const order = await apiClient.createOrder({
        items: items.map(i => ({ product_id: parseInt(i.id, 10), quantity: i.qty })),
        currency: 'EUR',
        shipping_method: shippingMethod,
        shipping_address: {
          name,
          phone,
          line1,
          city,
          postal_code: postal,
          country: 'GR', // Default to Greece
        },
        shipping_cost: shippingCost, // Pass 48: Send calculated shipping cost
        payment_method: 'COD',
        notes: undefined,
      });

      // CRITICAL: Do NOT redirect without a valid order ID
      if (!order?.id) {
        console.error('[CHECKOUT] No order ID in response:', order)
        router.push('/checkout?err=no-order-id')
        return
      }

      clearCart()
      router.push(`/order/${encodeURIComponent(order.id)}`)
    }catch(e){
      console.error('[CHECKOUT] Submit error:', e)
      router.push('/checkout?err=submit')
    }finally{
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8" data-testid="checkout-page">
      <h1 className="text-3xl font-bold mb-6">{t('checkout.title')}</h1>
      {!items.length ? (
        <div className="text-gray-500">
          {t('checkout.error.empty')} <a href="/products" className="text-blue-600 hover:underline">{t('cart.continue')}</a>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="checkout-form">
            <div>
              <label className="block text-sm font-medium mb-1">{t('checkout.name')}</label>
              <input
                name="name"
                required
                className="w-full px-3 py-2 border rounded-lg"
                data-testid="checkout-name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('checkout.phone')}</label>
              <input
                name="phone"
                required
                className="w-full px-3 py-2 border rounded-lg"
                data-testid="checkout-phone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('checkout.email')}</label>
              <input
                name="email"
                type="email"
                className="w-full px-3 py-2 border rounded-lg"
                data-testid="checkout-email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('checkout.address')}</label>
              <input
                name="line1"
                required
                className="w-full px-3 py-2 border rounded-lg"
                data-testid="checkout-address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('form.city')}</label>
                <input
                  name="city"
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                  data-testid="checkout-city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('form.postal')}</label>
                <input
                  name="postal"
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                  data-testid="checkout-postal"
                />
              </div>
            </div>

            {/* Pass 48: Shipping Method Selection */}
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium mb-3">Τρόπος Αποστολής</label>
              <div className="space-y-2" data-testid="shipping-method-selector">
                {SHIPPING_OPTIONS.map((option) => {
                  const isSelected = shippingMethod === option.code
                  const isFree = option.code === 'PICKUP' || subtotalEur >= FREE_SHIPPING_THRESHOLD
                  return (
                    <label
                      key={option.code}
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition ${
                        isSelected ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      data-testid={`shipping-option-${option.code}`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping_method"
                          value={option.code}
                          checked={isSelected}
                          onChange={() => setShippingMethod(option.code)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500"
                        />
                        <div>
                          <span className="font-medium">{option.labelEl}</span>
                          {option.etaDays && (
                            <span className="text-xs text-gray-500 ml-2">({option.etaDays})</span>
                          )}
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${isFree ? 'text-green-600' : 'text-gray-700'}`}>
                        {isFree ? 'Δωρεάν' : `€${option.cost.toFixed(2)}`}
                      </span>
                    </label>
                  )
                })}
              </div>
              {subtotalEur >= FREE_SHIPPING_THRESHOLD && shippingMethod !== 'PICKUP' && (
                <p className="mt-2 text-sm text-green-600" data-testid="free-shipping-message">
                  ✓ Δωρεάν αποστολή για παραγγελίες άνω των €{FREE_SHIPPING_THRESHOLD}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition"
              data-testid="checkout-submit"
            >
              {loading ? `${t('common.submit')}...` : t('checkout.submit')}
            </button>
            {err && (
              <p className="text-red-600" data-testid="checkout-error">
                {err === 'missing' ? t('checkout.error.empty') : t('checkout.error.generic')}
              </p>
            )}
          </form>

          <aside className="border rounded-lg p-6 bg-gray-50 h-fit" data-testid="checkout-summary">
            <h3 className="font-semibold mb-4">{t('cart.items')}</h3>
            <ul className="space-y-2 mb-4">
              {items.map(it => (
                <li key={it.id} className="flex justify-between gap-4">
                  <span className="text-sm">{it.title} × {it.qty}</span>
                  <span className="text-sm font-medium">{fmtEUR(it.priceCents * it.qty)}</span>
                </li>
              ))}
            </ul>
            <hr className="border-gray-200 my-4"/>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('cart.subtotal')}</span>
                <span className="font-medium" data-testid="subtotal-display">{fmtEUR(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('cart.shipping')}</span>
                <span data-testid="shipping-cost-display" className={shippingCost === 0 ? 'text-green-600' : ''}>
                  {shippingCost === 0 ? 'Δωρεάν' : `€${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Τρόπος:</span>
                <span data-testid="shipping-method-display">{shippingOption.labelEl}</span>
              </div>
              {totals.codFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cart.codFee')}</span>
                  <span>{fmtEUR(totals.codFee)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">{t('cart.tax')}</span>
                <span>{fmtEUR(totals.tax)}</span>
              </div>
              <hr className="border-gray-200 my-2"/>
              <div className="flex justify-between text-lg font-bold">
                <span>{t('cart.total')}</span>
                <span data-testid="checkout-total">{fmtEUR(totals.grandTotal)}</span>
              </div>
            </div>

            {/* AG7a: Shipping breakdown UI - shows detailed shipping calculation */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <ShippingBreakdown
                onQuote={(q) => onQuoteUpdate(q)}
                initialPostalCode=""
                initialMethod={shippingMethod as any || 'COURIER'}
                initialItems={items.map(i => ({ weightGrams: 500 }))}
                initialSubtotal={totals.subtotal / 100}
              />
            </div>

            {/* AG7b: Live totals from shipping quote */}
            {liveTotals.total > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-lg font-bold">
                  <span>Σύνολο παραγγελίας:</span>
                  <span data-testid="order-total">€{liveTotals.total.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* AG7b: Free shipping banner */}
            {liveTotals.free && (
              <div
                data-testid="free-shipping-banner"
                className="mt-4 bg-green-50 border border-green-500 text-green-800 px-4 py-2 rounded-lg text-sm font-medium"
              >
                ✓ Δωρεάν μεταφορικά
              </div>
            )}
          </aside>
        </div>
      )}
    </main>
  )
}
