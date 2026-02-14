'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/contexts/ToastContext';
import {
  OrderShipmentApiResponseSchema,
  type OrderShipmentResponse
} from '@/lib/shippingSchemas';

interface ShipmentTrackingProps {
  trackingCode?: string;
  orderId?: number;
  className?: string;
}

interface TrackingEvent {
  timestamp: string;
  status: string;
  location: string;
  description: string;
}

// Use Zod-inferred type for better type safety
type ShipmentData = OrderShipmentResponse['data'] & {
  events?: TrackingEvent[]; // Extended for tracking events
};

export default function ShipmentTracking({
  trackingCode,
  orderId,
  className = ''
}: ShipmentTrackingProps) {
  const [shipment, setShipment] = useState<ShipmentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputTrackingCode, setInputTrackingCode] = useState(trackingCode || '');
  const { showToast } = useToast();

  const fetchShipmentData = async (code?: string) => {
    const codeToUse = code || inputTrackingCode || trackingCode;

    if (!codeToUse && !orderId) {
      setError('Απαιτείται κωδικός παρακολούθησης ή ID παραγγελίας');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let url: string;
      if (orderId) {
        url = `/api/v1/orders/${orderId}/shipment`;
      } else {
        url = `/api/v1/shipping/tracking/${codeToUse}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      const rawData = await response.json();

      // Validate response using Zod schema
      const parseResult = OrderShipmentApiResponseSchema.safeParse(rawData);

      if (!parseResult.success) {
        throw new Error('Μη έγκυρη απάντηση από τον διακομιστή');
      }

      const data = parseResult.data;

      if (!response.ok) {
        const errorMessage = data.success === false ? data.message : 'Αποτυχία ανάκτησης στοιχείων αποστολής';
        throw new Error(errorMessage);
      }

      if (data.success) {
        // Extend the validated data with events (since tracking might not be in the schema)
        const shipmentData: ShipmentData = {
          ...data.data,
          events: rawData.data?.events || []
        };
        setShipment(shipmentData);
      } else {
        throw new Error('message' in data ? data.message : 'Δεν βρέθηκαν στοιχεία αποστολής');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Σφάλμα δικτύου';
      setError(errorMessage);
      showToast('error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (trackingCode || orderId) {
      fetchShipmentData();
    }
  }, [trackingCode, orderId]);

  const getStatusDisplayName = (status: string): string => {
    const statusNames: Record<string, string> = {
      'pending': 'Εκκρεμεί',
      'labeled': 'Ετικετοποιήθηκε',
      'in_transit': 'Σε μεταφορά',
      'delivered': 'Παραδόθηκε',
      'failed': 'Αποτυχία'
    };
    return statusNames[status] || status;
  };

  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      'pending': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'labeled': 'text-blue-600 bg-blue-50 border-blue-200',
      'in_transit': 'text-purple-600 bg-purple-50 border-purple-200',
      'delivered': 'text-green-600 bg-green-50 border-green-200',
      'failed': 'text-red-600 bg-red-50 border-red-200'
    };
    return statusColors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getCarrierDisplayName = (carrierCode: string): string => {
    const carrierNames: Record<string, string> = {
      'ELTA': 'ΕΛΤΑ',
      'ACS': 'ACS Courier',
      'SPEEDEX': 'Speedex'
    };
    return carrierNames[carrierCode] || carrierCode;
  };

  const formatDateTime = (dateString?: string): string => {
    if (!dateString) return 'Δεν υπάρχει';

    try {
      const date = new Date(dateString);
      return date.toLocaleString('el-GR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Μη έγκυρη ημερομηνία';
    }
  };

  return (
    <div className={`shipment-tracking ${className}`} data-testid="shipment-tracking">
      {/* Search Form - only show if no tracking code provided */}
      {!trackingCode && !orderId && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-3">Παρακολούθηση Αποστολής</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputTrackingCode}
              onChange={(e) => setInputTrackingCode(e.target.value)}
              placeholder="Εισάγετε κωδικό παρακολούθησης"
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => fetchShipmentData()}
              disabled={!inputTrackingCode || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Αναζήτηση...' : 'Αναζήτηση'}
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner size="md" />
          <span className="ml-3 text-gray-600">Φόρτωση στοιχείων αποστολής...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={() => fetchShipmentData()}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Προσπάθεια ξανά
              </button>
            </div>
          </div>
        </div>
      )}

      {shipment && (
        <div className="space-y-6">
          {/* Status Overview */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Κατάσταση Αποστολής</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(shipment.status)}`}>
                {getStatusDisplayName(shipment.status)}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Κωδικός Παρακολούθησης:</span>
                <p className="font-mono text-blue-600">{shipment.tracking_code}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Μεταφορέας:</span>
                <p>{getCarrierDisplayName(shipment.carrier_code)}</p>
              </div>
              {shipment.shipped_at && (
                <div>
                  <span className="font-medium text-gray-700">Ημερομηνία Αποστολής:</span>
                  <p>{formatDateTime(shipment.shipped_at)}</p>
                </div>
              )}
              {shipment.estimated_delivery && (
                <div>
                  <span className="font-medium text-gray-700">Εκτιμώμενη Παράδοση:</span>
                  <p>{formatDateTime(shipment.estimated_delivery)}</p>
                </div>
              )}
              {shipment.delivered_at && (
                <div>
                  <span className="font-medium text-gray-700">Ημερομηνία Παράδοσης:</span>
                  <p className="text-green-600 font-medium">{formatDateTime(shipment.delivered_at)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tracking Events */}
          {shipment.events && shipment.events.length > 0 && (
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Ιστορικό Παρακολούθησης</h3>
              <div className="space-y-4">
                {shipment.events.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3 pb-4 border-b last:border-b-0 last:pb-0">
                    <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full mt-1"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{event.status}</span>
                        <span className="text-sm text-gray-500">{formatDateTime(event.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{event.description}</p>
                      {event.location && (
                        <p className="text-xs text-gray-500">📍 {event.location}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No tracking events message */}
          {(!shipment.events || shipment.events.length === 0) && (
            <div className="border rounded-lg p-6 text-center">
              <div className="text-gray-400 mb-2">
                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m-2 0v5a2 2 0 002 2h2m2 13l4-4 4 4M7 7l10 10" />
                </svg>
              </div>
              <p className="text-gray-500">Δεν υπάρχουν διαθέσιμα στοιχεία παρακολούθησης</p>
              <p className="text-sm text-gray-400 mt-1">Τα στοιχεία θα ενημερωθούν όταν η αποστολή ξεκινήσει</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}