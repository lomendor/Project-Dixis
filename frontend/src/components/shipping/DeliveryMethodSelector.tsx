'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/contexts/ToastContext';
import {
  DeliveryMethodSchema,
  type DeliveryMethod,
  type PaymentMethod,
  type ShippingQuoteRequest,
  type ShippingQuoteResponse,
  type LockerSearchResponse
} from '@dixis/contracts/shipping';
import { toQty } from '@/contracts/items';
import { formatCurrency } from '@/env';
import LoadingSpinner from '@/components/LoadingSpinner';
import LockerSearch from './LockerSearch';

interface DeliveryMethodSelectorProps {
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
  postalCode: string;
  paymentMethod?: PaymentMethod;
  onQuoteReceived?: (quote: ShippingQuoteResponse['data']) => void;
  className?: string;
}

export default function DeliveryMethodSelector({
  items,
  postalCode,
  paymentMethod = 'CARD',
  onQuoteReceived,
  className = ''
}: DeliveryMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<DeliveryMethod>('HOME');
  const [isLoading, setIsLoading] = useState(false);
  const [homeQuote, setHomeQuote] = useState<ShippingQuoteResponse['data'] | null>(null);
  const [lockerQuote, setLockerQuote] = useState<ShippingQuoteResponse['data'] | null>(null);
  const [selectedLocker, setSelectedLocker] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  // Check if locker delivery is enabled
  const [lockersEnabled, setLockersEnabled] = useState(false);

  useEffect(() => {
    // Check feature flag from environment or API
    const checkLockerFeature = async () => {
      try {
        // For now, assume enabled for dev/testing
        // In production, this would check against backend config
        setLockersEnabled(true);
      } catch (err) {
        setLockersEnabled(false);
      }
    };
    checkLockerFeature();
  }, []);

  const fetchShippingQuote = useCallback(async (deliveryMethod: DeliveryMethod) => {
    if (!items.length || !postalCode || postalCode.length !== 5) {
      return null;
    }

    try {
      const requestPayload: ShippingQuoteRequest = {
        items: toQty(items),
        postal_code: postalCode,
        delivery_method: deliveryMethod,
        payment_method: paymentMethod
      };

      const response = await fetch('/api/v1/shipping/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Αποτυχία υπολογισμού μεταφορικών');
      }
    } catch (err) {
      throw err;
    }
  }, [items, postalCode, paymentMethod]);

  // Fetch both quotes when postal code or items change
  useEffect(() => {
    if (!postalCode || postalCode.length !== 5 || !items.length) {
      return;
    }

    const fetchQuotes = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Always fetch home quote
        const homeResult = await fetchShippingQuote('HOME');
        setHomeQuote(homeResult);

        // Fetch locker quote if enabled
        let lockerResult = null;
        if (lockersEnabled) {
          lockerResult = await fetchShippingQuote('LOCKER');
          setLockerQuote(lockerResult);
        }

        // Notify parent with current selected method quote
        const currentQuote = selectedMethod === 'HOME' ? homeResult : (lockersEnabled ? lockerResult : homeResult);
        if (currentQuote) {
          onQuoteReceived?.(currentQuote);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Σφάλμα δικτύου';
        setError(errorMessage);
        showToast('error', errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuotes();
  }, [postalCode, items, selectedMethod, lockersEnabled, paymentMethod, fetchShippingQuote, onQuoteReceived, showToast]);

  const handleMethodChange = (method: DeliveryMethod) => {
    setSelectedMethod(method);
    setSelectedLocker(null);

    // Notify parent with the quote for selected method
    const quote = method === 'HOME' ? homeQuote : lockerQuote;
    if (quote) {
      onQuoteReceived?.(quote);
    }
  };

  const handleLockerSelected = (lockerId: string) => {
    setSelectedLocker(lockerId);
    // When a locker is selected, we still use the locker quote
    if (lockerQuote) {
      onQuoteReceived?.(lockerQuote);
    }
  };

  const getDisplayQuote = () => {
    return selectedMethod === 'HOME' ? homeQuote : lockerQuote;
  };

  const displayQuote = getDisplayQuote();
  const hasDiscount = lockerQuote && lockerQuote.breakdown?.locker_discount_cents;

  if (isLoading) {
    return (
      <div className={`delivery-method-selector loading ${className}`} data-testid="delivery-method-loading">
        <div className="flex items-center justify-center p-4">
          <LoadingSpinner size="sm" />
          <span className="ml-2 text-sm text-gray-600">Υπολογισμός επιλογών παράδοσης...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`delivery-method-selector error ${className}`} data-testid="delivery-method-error">
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
                onClick={() => {
                  setError(null);
                  // Retry will be triggered by useEffect
                }}
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

  if (!displayQuote) {
    return null;
  }

  return (
    <div className={`delivery-method-selector ${className}`} data-testid="delivery-method-selector">
      {/* Delivery Method Options */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Επιλέξτε μέθοδο παράδοσης</h4>

        {/* Home Delivery Option */}
        <label className="flex items-start cursor-pointer">
          <input
            type="radio"
            name="delivery-method"
            value="HOME"
            checked={selectedMethod === 'HOME'}
            onChange={() => handleMethodChange('HOME')}
            className="mt-1 mr-3"
            data-testid="delivery-method-home"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Παράδοση στο σπίτι</div>
                <div className="text-sm text-gray-600">Παράδοση στη διεύθυνσή σας</div>
                {homeQuote && (
                  <div className="text-sm text-gray-500 mt-1">
                    Παράδοση σε {homeQuote.estimated_delivery_days === 1
                      ? '1 εργάσιμη ημέρα'
                      : `${homeQuote.estimated_delivery_days} εργάσιμες ημέρες`}
                  </div>
                )}
              </div>
              {homeQuote && (
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(homeQuote.cost_cents / 100)}</div>
                </div>
              )}
            </div>
          </div>
        </label>

        {/* Locker Delivery Option */}
        {lockersEnabled && lockerQuote && (
          <label className="flex items-start cursor-pointer">
            <input
              type="radio"
              name="delivery-method"
              value="LOCKER"
              checked={selectedMethod === 'LOCKER'}
              onChange={() => handleMethodChange('LOCKER')}
              className="mt-1 mr-3"
              data-testid="delivery-method-locker"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium flex items-center">
                    Παράδοση σε locker
                    {hasDiscount && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Έκπτωση!
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Παραλαβή από αυτόματο κουτί</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Παράδοση σε {lockerQuote.estimated_delivery_days === 1
                      ? '1 εργάσιμη ημέρα'
                      : `${lockerQuote.estimated_delivery_days} εργάσιμες ημέρες`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(lockerQuote.cost_cents / 100)}</div>
                  {hasDiscount && homeQuote && (
                    <div className="text-xs text-green-600 line-through">
                      {formatCurrency(homeQuote.cost_cents / 100)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </label>
        )}
      </div>

      {/* Locker Search - only show when locker method is selected */}
      {selectedMethod === 'LOCKER' && lockersEnabled && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <LockerSearch
            postalCode={postalCode}
            selectedLockerId={selectedLocker}
            onLockerSelected={handleLockerSelected}
          />
        </div>
      )}

      {/* Quote Summary */}
      {displayQuote && (
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-md p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h4 className="text-sm font-medium text-gray-900">
                Κόστος μεταφορικών
              </h4>
              <div className="mt-2 text-sm text-gray-700">
                <div className="flex justify-between items-center mb-1">
                  <span>Μέθοδος:</span>
                  <span className="font-semibold">
                    {selectedMethod === 'HOME' ? 'Παράδοση στο σπίτι' : 'Παράδοση σε locker'}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span>Κόστος:</span>
                  <span className="font-semibold">{formatCurrency(displayQuote.cost_cents / 100)}</span>
                </div>
                {hasDiscount && selectedMethod === 'LOCKER' && (
                  <div className="flex justify-between items-center mb-1 text-green-600">
                    <span>Έκπτωση locker:</span>
                    <span className="font-semibold">
                      -{formatCurrency((lockerQuote?.breakdown?.locker_discount_cents || 0) / 100)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span>Εκτιμώμενη παράδοση:</span>
                  <span>
                    {displayQuote.estimated_delivery_days === 1
                      ? '1 εργάσιμη ημέρα'
                      : `${displayQuote.estimated_delivery_days} εργάσιμες ημέρες`
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}