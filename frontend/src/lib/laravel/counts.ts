import { getLaravelInternalUrl } from '@/env'

/**
 * Phase 5.5a: Fetch product/producer counts from Laravel (SSOT).
 *
 * Uses /public/products and /public/producers with per_page=1
 * to get totals without transferring full data.
 *
 * Falls back to 0 on error (admin dashboard should still render).
 */

interface ProductCounts {
  total: number
  active: number
  lowStock: number
}

export async function fetchProductCounts(lowStockThreshold = 3): Promise<ProductCounts> {
  try {
    const laravelBase = getLaravelInternalUrl()

    // Fetch all products in one call to get total + compute active/lowStock
    // per_page=200 is enough for our catalogue size
    const url = new URL(`${laravelBase}/public/products`)
    url.searchParams.set('per_page', '200')

    const res = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) return { total: 0, active: 0, lowStock: 0 }

    const json = await res.json()
    const products = json?.data ?? []
    const total = json?.total ?? products.length

    let active = 0
    let lowStock = 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const p of products as any[]) {
      const isActive = p.is_active !== false
      if (isActive) active++
      const stock = typeof p.stock === 'number' ? p.stock : 0
      if (stock <= lowStockThreshold) lowStock++
    }

    return { total, active, lowStock }
  } catch {
    return { total: 0, active: 0, lowStock: 0 }
  }
}

export async function fetchProducerCount(): Promise<number> {
  try {
    const laravelBase = getLaravelInternalUrl()
    const url = new URL(`${laravelBase}/public/producers`)
    url.searchParams.set('per_page', '1')

    const res = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) return 0

    const json = await res.json()
    return json?.total ?? (json?.data?.length ?? 0)
  } catch {
    return 0
  }
}
