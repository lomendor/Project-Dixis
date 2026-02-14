'use client';

import { useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/contexts/ToastContext';
import { formatCurrency } from '@/env';
import {
  ShippingLabelApiResponseSchema,
  type ShippingLabelCreateResponse
} from '@/lib/shippingSchemas';

interface ShippingLabelManagerProps {
  orderId: string;
  orderDetails?: {
    id: number;
    status: string;
    customer_name: string;
    shipping_address: string;
    total_amount: number;
  };
  onLabelCreated?: (labelData: ShippingLabelCreateResponse['data']) => void;
  className?: string;
}

// Extend the Zod type with additional fields that might be returned
type ShippingLabelData = ShippingLabelCreateResponse['data'] & {
  estimated_delivery_days?: number;
  zone_code?: string;
  billable_weight_kg?: number;
  shipping_cost_eur?: number;
};

export default function ShippingLabelManager({
  orderId,
  orderDetails,
  onLabelCreated,
  className = ''
}: ShippingLabelManagerProps) {
  const [labelData, setLabelData] = useState<ShippingLabelData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const createLabel = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/shipping/labels/${orderId}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      const rawData = await response.json();

      // Validate response using Zod schema
      const parseResult = ShippingLabelApiResponseSchema.safeParse(rawData);

      if (!parseResult.success) {
        throw new Error('Μη έγκυρη απάντηση από τον διακομιστή');
      }

      const data = parseResult.data;

      if (!response.ok) {
        const errorMessage = data.success === false ? data.message : 'Αποτυχία δημιουργίας ετικέτας';
        throw new Error(errorMessage);
      }

      if (data.success) {
        // Extend the validated data with any additional fields from raw response
        const labelData: ShippingLabelData = {
          ...data.data,
          estimated_delivery_days: rawData.data?.estimated_delivery_days,
          zone_code: rawData.data?.zone_code,
          billable_weight_kg: rawData.data?.billable_weight_kg,
          shipping_cost_eur: rawData.data?.shipping_cost_eur
        };
        setLabelData(labelData);
        onLabelCreated?.(data.data);
        showToast('success', 'Η ετικέτα αποστολής δημιουργήθηκε επιτυχώς');
      } else {
        throw new Error('message' in data ? data.message : 'Αποτυχία δημιουργίας ετικέτας');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Σφάλμα δικτύου';
      setError(errorMessage);
      showToast('error', errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const downloadLabel = () => {
    if (labelData?.label_url) {
      window.open(labelData.label_url, '_blank');
    }
  };

  const getCarrierDisplayName = (carrierCode: string): string => {
    const carrierNames: Record<string, string> = {
      'ELTA': 'ΕΛΤΑ',
      'ACS': 'ACS Courier',
      'SPEEDEX': 'Speedex'
    };
    return carrierNames[carrierCode] || carrierCode;
  };

  const getZoneDisplayName = (zoneCode: string): string => {
    const zoneNames: Record<string, string> = {
      'GR_ATTICA': 'Αττική',
      'GR_THESSALONIKI': 'Θεσσαλονίκη',
      'GR_MAINLAND': 'Ηπειρωτική Ελλάδα',
      'GR_CRETE': 'Κρήτη',
      'GR_ISLANDS_LARGE': 'Μεγάλα Νησιά',
      'GR_ISLANDS_SMALL': 'Μικρά Νησιά'
    };
    return zoneNames[zoneCode] || zoneCode;
  };

  return (
    <div className={`shipping-label-manager ${className}`}>
      <div className="border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Διαχείριση Ετικέτας Αποστολής</h3>
          <span className="text-sm text-gray-500">Παραγγελία #{orderId}</span>
        </div>

        {/* Order Details Summary */}
        {orderDetails && (
          <div className="bg-gray-50 rounded-md p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Στοιχεία Παραγγελίας</h4>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Πελάτης:</span>
                <p className="font-medium">{orderDetails.customer_name}</p>
              </div>
              <div>
                <span className="text-gray-600">Κατάσταση:</span>
                <p className="font-medium">{orderDetails.status}</p>
              </div>
              <div>
                <span className="text-gray-600">Αξία Παραγγελίας:</span>
                <p className="font-medium">{formatCurrency(orderDetails.total_amount)}</p>
              </div>
              <div>
                <span className="text-gray-600">Διεύθυνση Αποστολής:</span>
                <p className="font-medium">{orderDetails.shipping_address}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
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
                  onClick={createLabel}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Προσπάθεια ξανά
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Label Action */}
        {!labelData && !isCreating && (
          <div className="text-center">
            <div className="mb-4">
              <svg className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a.997.997 0 01-.707.293H7a4 4 0 01-4-4V7a4 4 0 014-4z" />
              </svg>
              <p className="text-gray-500 mt-2">Δεν έχει δημιουργηθεί ετικέτα αποστολής</p>
            </div>
            <button
              onClick={createLabel}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Δημιουργία Ετικέτας Αποστολής
            </button>
          </div>
        )}

        {/* Creating Label Loading State */}
        {isCreating && (
          <div className="text-center py-8">
            <LoadingSpinner size="md" />
            <p className="text-gray-600 mt-3">Δημιουργία ετικέτας αποστολής...</p>
            <p className="text-sm text-gray-500 mt-1">Αυτό μπορεί να χρειαστεί λίγα δευτερόλεπτα</p>
          </div>
        )}

        {/* Label Created Successfully */}
        {labelData && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800 font-medium">
                    Η ετικέτα αποστολής δημιουργήθηκε επιτυχώς!
                  </p>
                </div>
              </div>
            </div>

            {/* Label Details */}
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Κωδικός Παρακολούθησης:</span>
                <p className="font-mono text-blue-600 text-base">{labelData.tracking_code}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Μεταφορέας:</span>
                <p>{getCarrierDisplayName(labelData.carrier_code)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Ζώνη Αποστολής:</span>
                <p>{getZoneDisplayName(labelData.zone_code)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Χρεώσιμο Βάρος:</span>
                <p>{labelData.billable_weight_kg.toFixed(2)} kg</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Κόστος Αποστολής:</span>
                <p className="font-medium">{formatCurrency(labelData.shipping_cost_eur)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Εκτιμώμενη Παράδοση:</span>
                <p>
                  {labelData.estimated_delivery_days === 1
                    ? '1 εργάσιμη ημέρα'
                    : `${labelData.estimated_delivery_days} εργάσιμες ημέρες`
                  }
                </p>
              </div>
            </div>

            {/* Download Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={downloadLabel}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium flex items-center justify-center"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Λήψη Ετικέτας PDF
              </button>

              <button
                onClick={() => navigator.clipboard.writeText(labelData.tracking_code)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium flex items-center justify-center"
                title="Αντιγραφή κωδικού παρακολούθησης"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Αντιγραφή Κωδικού
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}