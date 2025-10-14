'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useCart } from '@/lib/cart/context'
import type { CartItem } from '@/lib/cart/store'
import { calcTotals, fmtEUR } from '@/lib/cart/totals'
import { DEFAULT_OPTIONS } from '@/contracts/shipping'
import { useTranslations } from 'next-intl'

export default function CheckoutClient(){
  const router = useRouter()
  const searchParams = useSearchParams()
  const err = searchParams?.get('err') || null
  const cart = useCart()
  const t = useTranslations()
  const state = cart.getCart()
  const items: CartItem[] = state.items
  const shippingMethod = state.shippingMethod
  const [loading, setLoading] = useState(false)

  // Find shipping option details
  const shippingOption = DEFAULT_OPTIONS.find(opt => opt.code === shippingMethod) || DEFAULT_OPTIONS[0]

  const lines = items.map((i: CartItem)=>({ price:Number(i.price||0), qty:Number(i.qty||0) }))
  const totals = calcTotals({
    items: lines,
    shippingMethod,
    baseShipping: shippingOption.baseCost * 100, // Convert to cents
    codFee: (shippingOption.codFee || 0) * 100, // Convert to cents
    taxRate: 0.24 // 24% VAT
  })

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
      const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:3000'
      const res = await fetch(`${base}/api/checkout`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          items: items.map((i: CartItem)=>({ productId: i.productId, qty: i.qty })),
          shipping: { name, phone, email, line1, city, postal },
          payment: { method:'COD' }
        })
      })

      if(!res.ok){
        router.push('/checkout?err=submit')
        return
      }

      const body = await res.json()
      const orderId = body.orderId || body.id || ''
      cart.clear()
      router.push(`/order/${encodeURIComponent(orderId)}`)
    }catch(e){
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
              {items.map((it: CartItem)=>(
                <li key={it.productId} className="flex justify-between gap-4">
                  <span className="text-sm">{it.title} × {it.qty}</span>
                  <span className="text-sm font-medium">{fmtEUR(Number(it.price)*Number(it.qty))}</span>
                </li>
              ))}
            </ul>
            <hr className="border-gray-200 my-4"/>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('cart.subtotal')}</span>
                <span className="font-medium">{fmtEUR(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('cart.shipping')}</span>
                <span>{totals.shipping === 0 ? t('shipping.PICKUP') : fmtEUR(totals.shipping)}</span>
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
          </aside>
        </div>
      )}
    </main>
  )
}
