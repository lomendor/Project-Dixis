import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { requireAdmin, AdminError } from '@/lib/auth/admin'
import { fetchProductCounts, fetchProducerCount } from '@/lib/laravel/counts'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/analytics
 * Pass PR-FIX-03: Prisma-based analytics endpoint.
 *
 * Returns sales, orders, products, and producer stats.
 * Uses cookie-based admin auth (requireAdmin).
 */
export async function GET() {
  try {
    await requireAdmin()

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Run all queries in parallel
    // Order/OrderItem queries stay in Prisma (orders are Prisma-only)
    // Product/Producer counts come from Laravel (SSOT)
    const [
      totalOrders,
      productCounts,
      totalProducers,
      pendingOrders,
      ordersByStatus,
      ordersToday,
      ordersMonth,
      allOrders30d,
      topItems,
    ] = await Promise.all([
      prisma.order.count(),
      fetchProductCounts(),
      fetchProducerCount(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.groupBy({ by: ['status'], _count: true }),
      prisma.order.findMany({ where: { createdAt: { gte: today } }, select: { total: true } }),
      prisma.order.findMany({ where: { createdAt: { gte: monthStart } }, select: { total: true } }),
      prisma.order.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { total: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.orderItem.groupBy({
        by: ['titleSnap'],
        _sum: { qty: true },
        orderBy: { _sum: { qty: 'desc' } },
        take: 10,
      }),
    ])
    const totalProducts = productCounts.total
    const activeProducts = productCounts.active

    // Calculate sales
    const todaySales = ordersToday.reduce((s, o) => s + Number(o.total ?? 0), 0)
    const monthSales = ordersMonth.reduce((s, o) => s + Number(o.total ?? 0), 0)
    const totalRevenue = allOrders30d.reduce((s, o) => s + Number(o.total ?? 0), 0)

    // Build daily sales data (last 30 days)
    const dailyMap = new Map<string, { total: number; count: number }>()
    for (const o of allOrders30d) {
      const key = o.createdAt.toISOString().slice(0, 10)
      const cur = dailyMap.get(key) || { total: 0, count: 0 }
      cur.total += Number(o.total ?? 0)
      cur.count += 1
      dailyMap.set(key, cur)
    }

    const salesData = Array.from(dailyMap.entries()).map(([date, v]) => ({
      date,
      total_sales: v.total,
      order_count: v.count,
      average_order_value: v.count > 0 ? v.total / v.count : 0,
    }))

    // Status breakdown
    const byStatus: Record<string, number> = {}
    for (const g of ordersByStatus) {
      byStatus[g.status] = g._count
    }

    // Top products
    const topProducts = topItems.map((item, i) => ({
      id: i + 1,
      name: item.titleSnap || '—',
      total_quantity_sold: item._sum?.qty ?? 0,
      total_revenue: 0,
      order_count: 0,
      price: 0,
    }))

    return NextResponse.json({
      sales: {
        period: 'daily',
        data: salesData,
        summary: {
          total_revenue: totalRevenue,
          total_orders: allOrders30d.length,
          average_order_value: allOrders30d.length > 0 ? totalRevenue / allOrders30d.length : 0,
          period_growth: 0,
        },
      },
      orders: {
        by_status: byStatus,
        by_payment_status: {},
        recent_orders: [],
        summary: {
          total_orders: totalOrders,
          pending_orders: pendingOrders,
          completed_orders: byStatus['DELIVERED'] ?? 0,
          cancelled_orders: byStatus['CANCELLED'] ?? 0,
        },
      },
      products: {
        top_products: topProducts,
        summary: {
          total_products: totalProducts,
          active_products: activeProducts,
          out_of_stock: 0,
        },
      },
      producers: {
        active_producers: totalProducers,
        total_producers: totalProducers,
        top_producers: [],
      },
      summary: {
        today: {
          sales: todaySales,
          orders: ordersToday.length,
          average_order_value: ordersToday.length > 0 ? todaySales / ordersToday.length : 0,
        },
        month: {
          sales: monthSales,
          orders: ordersMonth.length,
          average_order_value: ordersMonth.length > 0 ? monthSales / ordersMonth.length : 0,
          sales_growth: 0,
          orders_growth: 0,
        },
        totals: {
          users: 0,
          producers: totalProducers,
          products: totalProducts,
          lifetime_revenue: totalRevenue,
        },
      },
    })
  } catch (error: unknown) {
    if (error instanceof AdminError) {
      if (error.code === 'NOT_AUTHENTICATED') {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
      }
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    console.error('[Analytics] Error:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
