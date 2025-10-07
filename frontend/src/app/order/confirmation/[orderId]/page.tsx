'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

interface Order {
  id: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
  total: number;
  currency: string;
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
  }>;
  shippingAddress: {
    name: string;
    line1: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  shipment?: {
    id: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered';
    trackingNumber?: string;
    estimatedDelivery?: string;
    shippingCost: number;
    carrier: string;
  };
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const orderId = params.orderId as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (orderId) {
      loadOrder();
    }
  }, [isAuthenticated, orderId, router]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError('');

      // Mock order data for development
      const mockOrder: Order = {
        id: orderId,
        status: 'paid',
        createdAt: new Date().toISOString(),
        total: 19.80,
        currency: 'EUR',
        items: [
          {
            id: 1,
            name: 'Βιολογικές Ντομάτες Κρήτης',
            price: 3.50,
            quantity: 2,
          },
          {
            id: 2,
            name: 'Εξαιρετικό Παρθένο Ελαιόλαδο',
            price: 12.80,
            quantity: 1,
          },
        ],
        shippingAddress: {
          name: 'Δημήτρης Παπαδόπουλος',
          line1: 'Βασιλίσσης Σοφίας 123',
          city: 'Αθήνα',
          postalCode: '10671',
          country: 'GR',
          phone: '+30 210 1234567',
        },
        shipment: {
          id: 'SHIP-' + orderId,
          status: 'pending',
          shippingCost: 4.50,
          carrier: 'ΕΛΤΑ Courier',
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('el-GR'),
        },
      };

      setOrder(mockOrder);
    } catch {
      setError('Σφάλμα κατά τη φόρτωση της παραγγελίας');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { label: 'Εκκρεμεί', color: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Πληρωμένη', color: 'bg-green-100 text-green-800' },
      processing: { label: 'Επεξεργασία', color: 'bg-blue-100 text-blue-800' },
      shipped: { label: 'Απεστάλη', color: 'bg-purple-100 text-purple-800' },
      delivered: { label: 'Παραδόθηκε', color: 'bg-green-100 text-green-800' },
    };

    const config = statusConfig[status];
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getShipmentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Αναμένεται', color: 'bg-gray-100 text-gray-800' },
      processing: { label: 'Προετοιμασία', color: 'bg-blue-100 text-blue-800' },
      shipped: { label: 'Απεστάλη', color: 'bg-purple-100 text-purple-800' },
      delivered: { label: 'Παραδόθηκε', color: 'bg-green-100 text-green-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">❌</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Σφάλμα</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Επιστροφή στην Αρχική
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Παραγγελία Δεν Βρέθηκε</h1>
            <p className="text-gray-600 mb-6">
              Η παραγγελία με κωδικό {orderId} δεν βρέθηκε.
            </p>
            <Link
              href="/"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Επιστροφή στην Αρχική
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">✅</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="confirmation-title">
            Παραγγελία Ολοκληρώθηκε!
          </h1>
          <p className="text-gray-600">
            Η παραγγελία σας έχει καταγραφεί επιτυχώς και θα επεξεργαστεί σύντομα.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Παραγγελία #{order.id}
            </h2>
            {getStatusBadge(order.status)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Ημερομηνία Παραγγελίας</h3>
              <p className="text-gray-600">
                {new Date(order.createdAt).toLocaleDateString('el-GR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Σύνολο Παραγγελίας</h3>
              <p className="text-xl font-bold text-green-600" data-testid="order-total">
                €{order.total.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Προϊόντα</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Ποσότητα: {item.quantity} × €{item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-medium text-gray-900">
                    €{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Διεύθυνση Αποστολής</h3>
            <div className="text-gray-600">
              <p className="font-medium">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.line1}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
              <p>Ελλάδα</p>
              {order.shippingAddress.phone && (
                <p className="mt-2">Τηλ: {order.shippingAddress.phone}</p>
              )}
            </div>
          </div>

          {/* Shipment Status */}
          {order.shipment && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Κατάσταση Αποστολής</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Κατάσταση:</span>
                  {getShipmentStatusBadge(order.shipment.status)}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Μεταφορέας:</span>
                  <span className="text-sm text-gray-600">{order.shipment.carrier}</span>
                </div>

                {order.shipment.trackingNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Κωδικός Παρακολούθησης:</span>
                    <span className="text-sm font-mono text-gray-600">{order.shipment.trackingNumber}</span>
                  </div>
                )}

                {order.shipment.estimatedDelivery && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Εκτιμώμενη Παράδοση:</span>
                    <span className="text-sm text-gray-600">{order.shipment.estimatedDelivery}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Κόστος Αποστολής:</span>
                  <span className="text-sm text-gray-600">€{order.shipment.shippingCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/orders/track/${order.id}?phone=${encodeURIComponent(order.shippingAddress.phone || '')}`}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
              data-testid="track-order-btn"
            >
              Παρακολούθηση παραγγελίας »
            </Link>

            <Link
              href="/"
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors text-center font-medium"
              data-testid="continue-shopping-btn"
            >
              Συνέχεια Αγορών
            </Link>

            <button
              onClick={() => window.print()}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              data-testid="print-order-btn"
            >
              Εκτύπωση Παραγγελίας
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}