/**
 * Hooks Index
 * Central export file for all custom hooks
 */

// Debounce hooks
export { useDebounce, useDebouncedCallback } from './useDebounce';

// Currency and formatting hooks
export { useCurrencyFormatter } from './useCurrencyFormatter';

// Data fetching hooks
export { useFetchJson, useFetchJsonMutation, type FetchState, type FetchOptions } from './useFetchJson';

// Existing analytics hook
export { usePageAnalytics } from './usePageAnalytics';