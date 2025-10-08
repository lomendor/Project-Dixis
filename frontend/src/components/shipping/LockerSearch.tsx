'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/contexts/ToastContext';
import {
  LockerSearchResponseSchema,
  type LockerSearchResponse,
  type Locker
} from '@dixis/contracts/shipping';
import LoadingSpinner from '@/components/LoadingSpinner';

interface LockerSearchProps {
  postalCode: string;
  selectedLockerId: string | null;
  onLockerSelected: (lockerId: string) => void;
  className?: string;
}

export default function LockerSearch({
  postalCode,
  selectedLockerId,
  onLockerSelected,
  className = ''
}: LockerSearchProps) {
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const { showToast } = useToast();

  // Debounce search
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchLockers = useCallback(async (searchPostalCode: string) => {
    if (!searchPostalCode || searchPostalCode.length !== 5) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/lockers/search?postal_code=${encodeURIComponent(searchPostalCode)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = typeof errorData === 'object' && errorData && 'message' in errorData
          ? String(errorData.message)
          : 'Αποτυχία αναζήτησης lockers';
        throw new Error(errorMessage);
      }

      const rawData = await response.json();

      // Validate response using Zod schema
      const parseResult = LockerSearchResponseSchema.safeParse(rawData);

      if (!parseResult.success) {
        console.error('Invalid locker search response:', parseResult.error);
        throw new Error('Μη έγκυρη απάντηση από τον διακομιστή');
      }

      const data = parseResult.data;

      // Extract lockers from validated response
      // Cast to Locker[] since schema validation ensures all required fields
      setLockers(data.lockers as Locker[]);
      setSearchAttempted(true);

      // Auto-select first locker if none selected
      if (data.lockers.length > 0 && !selectedLockerId) {
        onLockerSelected(data.lockers[0].id!);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Σφάλμα δικτύου';
      setError(errorMessage);
      showToast('error', errorMessage);
      setSearchAttempted(true);
    } finally {
      setIsLoading(false);
    }
  }, [selectedLockerId, onLockerSelected, showToast]);

  const debouncedSearch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      searchLockers(postalCode);
    }, 500);
  }, [postalCode, searchLockers]);

  useEffect(() => {
    if (postalCode && postalCode.length === 5) {
      debouncedSearch();
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [postalCode, debouncedSearch]);

  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const getLockerIcon = (provider: string) => {
    // Simple icon representation for different providers
    switch (provider.toLowerCase()) {
      case 'boxnow':
        return '📦';
      case 'acs':
        return '🚚';
      case 'speedex':
        return '📮';
      default:
        return '🔒';
    }
  };

  if (isLoading) {
    return (
      <div className={`locker-search loading ${className}`} data-testid="locker-search-loading">
        <div className="flex items-center justify-center p-4">
          <LoadingSpinner size="sm" />
          <span className="ml-2 text-sm text-gray-600">Αναζήτηση lockers...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`locker-search error ${className}`} data-testid="locker-search-error">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  searchLockers(postalCode);
                }}
                className="mt-2 text-sm text-yellow-600 hover:text-yellow-800 underline"
              >
                Προσπάθεια ξανά
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (searchAttempted && lockers.length === 0) {
    return (
      <div className={`locker-search no-results ${className}`} data-testid="locker-search-no-results">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">
                Δεν βρέθηκαν lockers
              </h4>
              <p className="text-sm text-blue-700">
                Δεν υπάρχουν διαθέσιμα lockers για τον ΤΚ {postalCode}. Επιλέξτε παράδοση στο σπίτι.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (lockers.length === 0) {
    return null;
  }

  return (
    <div className={`locker-search ${className}`} data-testid="locker-search-results">
      <h5 className="font-medium text-gray-900 mb-3">Επιλέξτε locker για παραλαβή</h5>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {lockers.map((locker) => (
          <label
            key={locker.id}
            className={`block cursor-pointer border rounded-lg p-3 transition-colors ${
              selectedLockerId === locker.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            data-testid={`locker-option-${locker.id}`}
          >
            <input
              type="radio"
              name="locker"
              value={locker.id}
              checked={selectedLockerId === locker.id}
              onChange={() => onLockerSelected(locker.id)}
              className="sr-only"
            />

            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center mb-1">
                  <span className="text-lg mr-2">{getLockerIcon(locker.provider)}</span>
                  <div className="font-medium text-gray-900 truncate">
                    {locker.name}
                  </div>
                  {locker.distance && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      {formatDistance(locker.distance)}
                    </span>
                  )}
                </div>

                <div className="text-sm text-gray-600 mb-1">
                  {locker.address}
                </div>

                {locker.operating_hours && (
                  <div className="text-xs text-gray-500">
                    Ώρες λειτουργίας: {locker.operating_hours}
                  </div>
                )}

                {locker.notes && (
                  <div className="text-xs text-blue-600 mt-1">
                    {locker.notes}
                  </div>
                )}
              </div>

              {selectedLockerId === locker.id && (
                <div className="flex-shrink-0 ml-2">
                  <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </label>
        ))}
      </div>

      {lockers.length > 0 && (
        <div className="mt-3 text-xs text-gray-500">
          Βρέθηκαν {lockers.length} διαθέσιμα lockers. Επιλέξτε το πιο κοντινό σας.
        </div>
      )}
    </div>
  );
}