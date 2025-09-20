'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { formatCurrency } from '@/env';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/contexts/ToastContext';
import {
  ShippingQuoteApiResponseSchema,
  type ShippingQuoteResponse,
  type ShippingQuoteRequest
} from '@/lib/shippingSchemas';

interface ShippingQuoteProps {
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
  postalCode: string;
  onQuoteReceived?: (quote: ShippingQuoteResponse['data']) => void;
  className?: string;
}

export default function ShippingQuote({
  items,
  postalCode,
  onQuoteReceived,
  className = ''
}: ShippingQuoteProps) {
  const [quote, setQuote] = useState<ShippingQuoteResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchQuote = useCallback(async () => {
    if (!items.length || !postalCode || postalCode.length !== 5) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build request payload using Zod schema structure
      const requestPayload: ShippingQuoteRequest = {
        items,
        postal_code: postalCode
      };

      const response = await fetch('/api/v1/shipping/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });

      const rawData = await response.json();

      // Validate response using Zod schema
      const parseResult = ShippingQuoteApiResponseSchema.safeParse(rawData);

      if (!parseResult.success) {
        console.error('Invalid API response format:', parseResult.error);
        throw new Error('Μη έγκυρη απάντηση από τον διακομιστή');
      }

      const data = parseResult.data;

      if (!response.ok) {
        const errorMessage = data.success === false ? data.message : 'Αποτυχία υπολογισμού μεταφορικών';
        throw new Error(errorMessage);
      }

      if (data.success) {
        setQuote(data.data);
        onQuoteReceived?.(data.data);
      } else {
        throw new Error('message' in data ? data.message : 'Αποτυχία υπολογισμού μεταφορικών');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Σφάλμα δικτύου';
      setError(errorMessage);
      showToast('error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [items, postalCode, showToast]);

  // Custom debounce implementation
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedFetchQuote = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchQuote();
    }, 300);
  }, [fetchQuote]);

  // Stable items dependency using JSON.stringify
  const stableItemsKey = useMemo(
    () => JSON.stringify(items),
    [items]
  );

  useEffect(() => {
    if (items.length > 0 && postalCode.length === 5) {
      debouncedFetchQuote();
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [stableItemsKey, postalCode, debouncedFetchQuote]);

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

  const getCarrierDisplayName = (carrierCode: string): string => {
    const carrierNames: Record<string, string> = {
      'ELTA': 'ΕΛΤΑ',
      'ACS': 'ACS Courier',
      'SPEEDEX': 'Speedex'
    };
    return carrierNames[carrierCode] || carrierCode;
  };

  if (isLoading) {
    return (
      <div className={`shipping-quote loading ${className}`} data-testid="shipping-quote-loading">
        <div className="flex items-center justify-center p-4">
          <LoadingSpinner size="sm" />
          <span className="ml-2 text-sm text-gray-600">Υπολογισμός μεταφορικών...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`shipping-quote error ${className}`} data-testid="shipping-quote-error">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={fetchQuote}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Προσπάθεια ξανά
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quote) {
    return null;
  }

  return (
    <div className={`shipping-quote success ${className}`} data-testid="shipping-quote-success">
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h4 className="text-sm font-medium text-green-800">
              Μεταφορικά διαθέσιμα
            </h4>
            <div className="mt-2 text-sm text-green-700">
              <div className="flex justify-between items-center mb-1">
                <span>Κόστος:</span>
                <span className="font-semibold">{formatCurrency(quote.cost_cents / 100)}</span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span>Μεταφορέας:</span>
                <span>{getCarrierDisplayName(quote.carrier_code)}</span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span>Ζώνη:</span>
                <span>{getZoneDisplayName(quote.zone_code)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Εκτιμώμενη παράδοση:</span>
                <span>
                  {quote.estimated_delivery_days === 1
                    ? '1 εργάσιμη ημέρα'
                    : `${quote.estimated_delivery_days} εργάσιμες ημέρες`
                  }
                </span>
              </div>
            </div>

            {/* Detailed breakdown - expandable */}
            <details className="mt-2">
              <summary className="text-xs text-green-600 cursor-pointer hover:text-green-800">
                Λεπτομέρειες υπολογισμού
              </summary>
              <div className="mt-1 text-xs text-green-600 space-y-1">
                <div className="flex justify-between">
                  <span>Βασικό κόστος:</span>
                  <span>{formatCurrency(quote.breakdown.base_cost_cents / 100)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Προσαρμογή βάρους:</span>
                  <span>{formatCurrency(quote.breakdown.weight_adjustment_cents / 100)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Προσαρμογή όγκου:</span>
                  <span>{formatCurrency(quote.breakdown.volume_adjustment_cents / 100)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Συντελεστής ζώνης:</span>
                  <span>×{quote.breakdown.zone_multiplier}</span>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}