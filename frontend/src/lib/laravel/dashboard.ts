import { getLaravelInternalUrl } from '@/env'
import { cookies } from 'next/headers'
import { SESSION_COOKIE_NAME } from '@/lib/auth/cookies'

/**
 * FIX-ADMIN-DASHBOARD-DATA-01: Fetch admin dashboard data from Laravel (SSOT).
 *
 * Previously the admin dashboard queried Prisma/Neon directly, which only had
 * stale data from before the Laravel migration. Now we fetch from Laravel's
 * AnalyticsService via authenticated admin endpoints.
 */

export interface DashboardSummary {
  today: { sales: number; orders: number; average_order_value: number }
  month: {
    sales: number; orders: number; average_order_value: number
    sales_growth: number; orders_growth: number
  }
  totals: {
    users: number; producers: number; products: number
    lifetime_revenue: number
  }
}

export interface OrdersAnalytics {
  by_status: Record<string, number>
  recent_orders: Array<{
    id: number
    user_email: string | null
    total_amount: string
    status: string
    payment_status: string
    created_at: string
  }>
  summary: {
    total_orders: number
    pending_orders: number
    completed_orders: number
    cancelled_orders: number
  }
}

export interface TopProduct {
  id: number
  name: string
  price: string
  total_quantity_sold: number
  total_revenue: number
  order_count: number
}

export interface ProductsAnalytics {
  top_products: TopProduct[]
  summary: {
    total_products: number
    active_products: number
    out_of_stock: number
  }
}

async function fetchLaravelAdmin<T>(path: string): Promise<T | null> {
  try {
    const base = getLaravelInternalUrl()
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!token) return null

    const res = await fetch(`${base}${path}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) return null
    const json = await res.json()
    return json as T
  } catch {
    return null
  }
}

export async function fetchDashboardSummary(): Promise<DashboardSummary | null> {
  const data = await fetchLaravelAdmin<{ success: boolean; summary: DashboardSummary }>(
    '/admin/analytics/dashboard'
  )
  return data?.summary ?? null
}

export async function fetchOrdersAnalytics(): Promise<OrdersAnalytics | null> {
  const data = await fetchLaravelAdmin<{ success: boolean; analytics: OrdersAnalytics }>(
    '/admin/analytics/orders'
  )
  return data?.analytics ?? null
}

export async function fetchProductsAnalytics(limit = 10): Promise<ProductsAnalytics | null> {
  const data = await fetchLaravelAdmin<{ success: boolean; analytics: ProductsAnalytics }>(
    `/admin/analytics/products?limit=${limit}`
  )
  return data?.analytics ?? null
}
