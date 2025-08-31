'use client';

import { useState, useEffect } from 'react';
import { AnalyticsEvent } from '@/lib/analytics/eventSchema';

interface EventStats {
  totalEvents: number;
  pageViews: number;
  addToCart: number;
  checkoutStarts: number;
  orderCompletes: number;
  uniqueSessions: number;
}

export default function AnalyticsDashboard() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [stats, setStats] = useState<EventStats>({
    totalEvents: 0, pageViews: 0, addToCart: 0,
    checkoutStarts: 0, orderCompletes: 0, uniqueSessions: 0,
  });

  useEffect(() => {
    const mockEvents: AnalyticsEvent[] = [
      {
        event_type: 'page_view', page_path: '/', page_title: 'Dixis - Home',
        session_id: 'sess_123', timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        event_type: 'add_to_cart', product_id: 1, product_name: 'Extra Virgin Olive Oil',
        price: 15.99, quantity: 2, session_id: 'sess_123',
        timestamp: new Date(Date.now() - 2400000).toISOString(),
      },
      {
        event_type: 'checkout_start', cart_value: 31.98, item_count: 2,
        session_id: 'sess_123', timestamp: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        event_type: 'order_complete', order_id: 'ORD-2025-001', total_amount: 36.98,
        item_count: 2, payment_method: 'cash_on_delivery', session_id: 'sess_123',
        timestamp: new Date(Date.now() - 1200000).toISOString(),
      },
    ];

    setEvents(mockEvents);
    const uniqueSessions = new Set(mockEvents.map(e => e.session_id)).size;
    const eventsByType = mockEvents.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setStats({
      totalEvents: mockEvents.length, pageViews: eventsByType.page_view || 0,
      addToCart: eventsByType.add_to_cart || 0, checkoutStarts: eventsByType.checkout_start || 0,
      orderCompletes: eventsByType.order_complete || 0, uniqueSessions,
    });
  }, []);

  const formatTime = (timestamp: string) => {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins < 1 ? 'Just now' : diffMins < 60 ? `${diffMins}m ago` : `${Math.floor(diffMins/60)}h ago`;
  };

  const EventCard = ({ event, index }: { event: AnalyticsEvent, index: number }) => {
    const icons = { page_view: '👁️', add_to_cart: '🛒', checkout_start: '💳', order_complete: '✅' };
    const colors = { 
      page_view: 'bg-blue-50 border-blue-200', add_to_cart: 'bg-green-50 border-green-200',
      checkout_start: 'bg-yellow-50 border-yellow-200', order_complete: 'bg-purple-50 border-purple-200'
    };
    
    return (
      <div key={index} className={`p-3 border rounded ${colors[event.event_type] || 'bg-gray-50'}`}
           data-testid={`event-card-${event.event_type}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{icons[event.event_type] || '📊'}</span>
            <div>
              <h4 className="font-medium capitalize">{event.event_type.replace('_', ' ')}</h4>
              <p className="text-xs text-gray-600">{formatTime(event.timestamp)}</p>
            </div>
          </div>
          <div className="text-xs text-gray-500">#{event.session_id.slice(-4)}</div>
        </div>
        
        <div className="mt-2 text-xs text-gray-700">
          {event.event_type === 'page_view' && <div>Path: {event.page_path}</div>}
          {event.event_type === 'add_to_cart' && <div>{event.product_name} (×{event.quantity})</div>}
          {event.event_type === 'checkout_start' && <div>€{event.cart_value.toFixed(2)} ({event.item_count} items)</div>}
          {event.event_type === 'order_complete' && <div>Order {event.order_id} - €{event.total_amount.toFixed(2)}</div>}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6" data-testid="analytics-dashboard">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">📊 Analytics Dashboard</h1>
        <p className="text-gray-600">Monitor user interactions and marketplace performance</p>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { key: 'totalEvents', label: 'Total Events', color: 'blue', testId: 'stat-total-events' },
          { key: 'pageViews', label: 'Page Views', color: 'green', testId: 'stat-page-views' },
          { key: 'addToCart', label: 'Add to Cart', color: 'yellow', testId: 'stat-add-to-cart' },
          { key: 'checkoutStarts', label: 'Checkout Starts', color: 'orange', testId: 'stat-checkout-starts' },
          { key: 'orderCompletes', label: 'Orders', color: 'purple', testId: 'stat-orders' },
          { key: 'uniqueSessions', label: 'Sessions', color: 'indigo', testId: 'stat-sessions' },
        ].map(({ key, label, color, testId }) => (
          <div key={key} className="bg-white rounded-lg shadow-md p-4 text-center" data-testid={testId}>
            <div className={`text-2xl font-bold text-${color}-600`}>{stats[key as keyof EventStats]}</div>
            <div className="text-sm text-gray-600">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Events</h2>
          <div className="text-sm text-gray-500" data-testid="events-count">{events.length} events</div>
        </div>
        
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500" data-testid="no-events">
            No analytics events yet. Start browsing to generate events!
          </div>
        ) : (
          <div className="space-y-4" data-testid="events-list">
            {events
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((event, index) => <EventCard key={index} event={event} index={index} />)}
          </div>
        )}
      </div>

      {/* Simple Conversion Rate */}
      {stats.pageViews > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6" data-testid="conversion-rate">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Conversion Rate</h2>
          <div className="text-3xl font-bold text-green-600">
            {Math.round((stats.orderCompletes / stats.pageViews) * 100)}%
          </div>
          <div className="text-sm text-gray-600">
            {stats.orderCompletes} orders from {stats.pageViews} page views
          </div>
        </div>
      )}
    </div>
  );
}