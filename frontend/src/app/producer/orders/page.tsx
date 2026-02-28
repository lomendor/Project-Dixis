'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { apiClient, ProducerOrder } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatCurrency } from '@/env';
import { useTranslations } from '@/contexts/LocaleContext';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface ShippingAddress {
  name?: string;
  phone?: string;
  email?: string;
  line1?: string;
  city?: string;
  postal_code?: string;
  country?: string;
}

interface OrderCounts {
  total: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
}

/** Kanban column definitions — order matters (left→right = workflow) */
const COLUMNS: {
  key: string;
  statuses: OrderStatus[];
  colorBg: string;
  colorBorder: string;
  colorText: string;
  colorBadge: string;
  icon: string;
}[] = [
  {
    key: 'new',
    statuses: ['confirmed', 'pending'],
    colorBg: 'bg-amber-50',
    colorBorder: 'border-amber-200',
    colorText: 'text-amber-800',
    colorBadge: 'bg-amber-500',
    icon: '🆕',
  },
  {
    key: 'processing',
    statuses: ['processing'],
    colorBg: 'bg-blue-50',
    colorBorder: 'border-blue-200',
    colorText: 'text-blue-800',
    colorBadge: 'bg-blue-500',
    icon: '⚙️',
  },
  {
    key: 'shipped',
    statuses: ['shipped'],
    colorBg: 'bg-purple-50',
    colorBorder: 'border-purple-200',
    colorText: 'text-purple-800',
    colorBadge: 'bg-purple-500',
    icon: '📦',
  },
  {
    key: 'delivered',
    statuses: ['delivered'],
    colorBg: 'bg-green-50',
    colorBorder: 'border-green-200',
    colorText: 'text-green-800',
    colorBadge: 'bg-green-500',
    icon: '✅',
  },
];

export default function ProducerOrdersPage() {
  const t = useTranslations();
  const [orders, setOrders] = useState<ProducerOrder[]>([]);
  const [counts, setCounts] = useState<OrderCounts>({
    total: 0, pending: 0, confirmed: 0, processing: 0, shipped: 0, delivered: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProducerOrders();
      setOrders(response.orders);
      setCounts(response.meta);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Αποτυχία φόρτωσης παραγγελιών');
    } finally {
      setLoading(false);
    }
  };

  /** Group orders by kanban column */
  const grouped = useMemo(() => {
    const map = new Map<string, ProducerOrder[]>();
    for (const col of COLUMNS) map.set(col.key, []);
    for (const order of orders) {
      const col = COLUMNS.find(c => c.statuses.includes(order.status));
      if (col) map.get(col.key)!.push(order);
    }
    return map;
  }, [orders]);

  const handleExportCsv = async () => {
    try {
      setExportLoading(true);
      const blob = await apiClient.exportProducerOrdersCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert(t('producerOrders.exportError'));
    } finally {
      setExportLoading(false);
    }
  };

  const getStatusLabel = (status: OrderStatus): string => t(`producerOrders.${status}`);

  /** Compact card for kanban column */
  const OrderCard = ({ order }: { order: ProducerOrder }) => {
    const isNew = order.status === 'confirmed' || order.status === 'pending';
    return (
      <Link href={`/producer/orders/${order.id}`} className="block group">
        <div className={`bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer ${
          isNew ? 'ring-1 ring-amber-300' : ''
        }`}>
          {/* Header: order # + amount */}
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-bold text-neutral-900">
              #{order.id}
            </span>
            <span className="text-sm font-bold text-neutral-900">
              {formatCurrency(parseFloat(order.total))}
            </span>
          </div>

          {/* Customer */}
          <p className="text-sm text-neutral-600 mb-1">
            {order.user?.name || t('producerOrders.guest')}
          </p>

          {/* Products (compact) */}
          <div className="space-y-0.5 mb-2">
            {(order.orderItems ?? []).slice(0, 3).map((item) => (
              <p key={item.id} className="text-xs text-neutral-500 truncate">
                {item.quantity}× {item.product_name || item.product?.name}
              </p>
            ))}
            {(order.orderItems ?? []).length > 3 && (
              <p className="text-xs text-neutral-400">
                +{(order.orderItems ?? []).length - 3} {t('producerOrders.moreItems')}
              </p>
            )}
          </div>

          {/* Date + status badge */}
          <div className="flex justify-between items-center pt-2 border-t border-neutral-100">
            <time
              dateTime={order.created_at}
              suppressHydrationWarning
              className="text-xs text-neutral-400"
            >
              {mounted
                ? new Date(order.created_at).toLocaleDateString('el-GR', {
                    day: 'numeric', month: 'short',
                  })
                : ''}
            </time>
            {isNew && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-medium rounded-full border border-amber-200">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                {t('producerOrders.needsAction')}
              </span>
            )}
          </div>

          {/* Shipping address (if present) */}
          {(order as ProducerOrder & { shipping_address?: ShippingAddress }).shipping_address && (
            <div className="mt-2 p-2 bg-neutral-50 rounded text-xs text-neutral-500">
              {(() => {
                const addr = (order as ProducerOrder & { shipping_address?: ShippingAddress }).shipping_address!;
                return [addr.name, addr.city].filter(Boolean).join(', ');
              })()}
            </div>
          )}
        </div>
      </Link>
    );
  };

  /** Single kanban column */
  const KanbanColumn = ({ colIndex }: { colIndex: number }) => {
    const col = COLUMNS[colIndex];
    const columnOrders = grouped.get(col.key) ?? [];
    const count = columnOrders.length;

    return (
      <div className={`flex flex-col rounded-xl ${col.colorBg} border ${col.colorBorder} min-w-[280px] max-w-[340px] w-full`}>
        {/* Column header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-200/50">
          <span className="text-lg" role="img" aria-hidden="true">{col.icon}</span>
          <h2 className={`text-sm font-bold ${col.colorText}`}>
            {t(`producerOrders.col_${col.key}`)}
          </h2>
          <span className={`ml-auto inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white rounded-full ${col.colorBadge}`}>
            {count}
          </span>
        </div>

        {/* Cards */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ maxHeight: 'calc(100vh - 240px)' }}>
          {columnOrders.length === 0 ? (
            <p className="text-xs text-neutral-400 text-center py-6">
              {t('producerOrders.colEmpty')}
            </p>
          ) : (
            columnOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div data-testid="producer-orders-page">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900" data-testid="producer-orders-title">
              {t('producerOrders.title')}
            </h1>
            <p className="text-neutral-600 mt-1">
              {t('producerOrders.subtitle')}
              {counts.total > 0 && (
                <span className="ml-2 text-sm text-neutral-400">
                  ({counts.total} {t('producerOrders.totalLabel')})
                </span>
              )}
            </p>
          </div>
          <button
            onClick={handleExportCsv}
            disabled={exportLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 text-sm font-medium text-neutral-700 disabled:opacity-50 transition-colors"
            data-testid="export-csv-btn"
          >
            {exportLoading ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            )}
            {exportLoading ? t('producerOrders.exporting') : t('producerOrders.exportCsv')}
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadOrders}
              className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg transition-colors"
            >
              {t('producerOrders.tryAgain')}
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-neutral-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              {t('producerOrders.noOrders')}
            </h3>
            <p className="text-neutral-600">
              {t('producerOrders.noOrdersYet')}
            </p>
          </div>
        ) : (
          /* Kanban Board */
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
            {COLUMNS.map((_, i) => (
              <KanbanColumn key={COLUMNS[i].key} colIndex={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
