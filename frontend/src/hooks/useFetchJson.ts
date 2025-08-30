'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiUrl } from '@/env';

/**
 * State interface for fetch operations
 */
export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  status: number | null;
}

/**
 * Options for fetch operations
 */
export interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * Custom hook for JSON API requests with advanced error handling and state management
 * Automatically uses the centralized API_BASE_URL from @/env
 * 
 * @param url - API endpoint URL (will be resolved with apiUrl())
 * @param options - Fetch options and hook configuration
 * @returns Object with data, loading, error states and refetch function
 * 
 * @example
 * ```tsx
 * // Basic usage
 * const { data, loading, error, refetch } = useFetchJson<Product[]>('/products');
 * 
 * // With options
 * const { data, loading, error } = useFetchJson<User>('/profile', {
 *   headers: { 'Authorization': `Bearer ${token}` },
 *   timeout: 10000,
 *   retries: 3
 * });
 * ```
 */
export function useFetchJson<T = unknown>(
  url: string | null,
  options: FetchOptions = {}
) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
    status: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Extract hook-specific options
  const {
    timeout = 10000,
    retries = 0,
    retryDelay = 1000,
    body,
    ...fetchOptions
  } = options;

  // Create request body
  const requestBody = body ? JSON.stringify(body) : undefined;

  // Memoized fetch function
  const fetchData = useCallback(async (attemptCount = 0): Promise<void> => {
    if (!url) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Set up timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutRef.current = setTimeout(() => {
          reject(new Error(`Request timeout after ${timeout}ms`));
        }, timeout);
      });

      // Build full URL using apiUrl helper
      const fullUrl = url.startsWith('http') ? url : apiUrl(url);

      // Prepare headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...fetchOptions.headers,
      };

      // Make request with timeout
      const fetchPromise = fetch(fullUrl, {
        ...fetchOptions,
        headers,
        body: requestBody,
        signal: abortControllerRef.current.signal,
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Handle response
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // Use default error message if response body is not JSON
        }

        throw new Error(errorMessage);
      }

      // Parse JSON response
      const data = await response.json();

      setState({
        data,
        loading: false,
        error: null,
        status: response.status,
      });

    } catch (error) {
      // Clear timeout on error
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Handle abort errors
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Don't update state for aborted requests
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      // Retry logic
      if (attemptCount < retries && !errorMessage.includes('AbortError')) {
        setTimeout(() => {
          fetchData(attemptCount + 1);
        }, retryDelay);
        return;
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        status: null,
      }));
    }
  }, [url, requestBody, timeout, retries, retryDelay, fetchOptions]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (url) {
      fetchData();
    }

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fetchData]);

  // Manual refetch function
  const refetch = useCallback(() => {
    if (url) {
      fetchData();
    }
  }, [fetchData]);

  // Cancel current request
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setState(prev => ({ ...prev, loading: false }));
  }, []);

  return {
    ...state,
    refetch,
    cancel,
    isLoading: state.loading,
    isError: !!state.error,
    isSuccess: !state.loading && !state.error && state.data !== null,
  };
}

/**
 * Hook for making POST/PUT/PATCH requests
 * Returns a function to trigger the request manually
 * 
 * @param url - API endpoint URL
 * @param options - Default fetch options
 * @returns Function to trigger request and current state
 * 
 * @example
 * ```tsx
 * const { mutate, loading, error, data } = useFetchJsonMutation<User>('/profile', {
 *   method: 'PUT'
 * });
 * 
 * const handleUpdate = () => {
 *   mutate({ name: 'Updated Name' });
 * };
 * ```
 */
export function useFetchJsonMutation<TData = unknown, TVariables = unknown>(
  url: string,
  defaultOptions: FetchOptions = {}
) {
  const [state, setState] = useState<FetchState<TData>>({
    data: null,
    loading: false,
    error: null,
    status: null,
  });

  const mutate = useCallback(async (
    variables?: TVariables,
    overrideOptions?: FetchOptions
  ): Promise<TData | null> => {
    const options = { ...defaultOptions, ...overrideOptions };
    const { timeout = 10000, body, ...fetchOptions } = options;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const fullUrl = url.startsWith('http') ? url : apiUrl(url);

      // Prepare request body
      let requestBody: string | undefined;
      if (variables) {
        requestBody = JSON.stringify(variables);
      } else if (body) {
        requestBody = JSON.stringify(body);
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...fetchOptions.headers,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(fullUrl, {
        ...fetchOptions,
        headers,
        body: requestBody,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // Use default error message
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      setState({
        data,
        loading: false,
        error: null,
        status: response.status,
      });

      return data;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        status: null,
      }));

      throw error;
    }
  }, [url, defaultOptions]);

  return {
    mutate,
    ...state,
    isLoading: state.loading,
    isError: !!state.error,
  };
}