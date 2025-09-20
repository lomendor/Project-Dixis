/**
 * Enhanced Greek Search Hook with fuzzy matching and localization
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { apiClient, Product } from '@/lib/api';
import { 
  createGreekSearchTerms, 
  matchesGreekSearch, 
  normalizeGreekText 
} from '@/lib/greekUtils';

interface Filters {
  search: string;
  category: string;
  producer: string;
  minPrice: string;
  maxPrice: string;
  organic: boolean | null;
  sort: string;
  dir: string;
}

interface SearchState {
  products: Product[];
  filteredProducts: Product[];
  loading: boolean;
  error: string | null;
  categories: string[];
  producers: {id: number, name: string}[];
  totalResults: number;
}

interface UseGreekSearchReturn extends SearchState {
  filters: Filters;
  updateFilter: (key: keyof Filters, value: Filters[keyof Filters]) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
  searchTerms: string[];
  refreshProducts: () => Promise<void>;
}

const DEFAULT_FILTERS: Filters = {
  search: '',
  category: '',
  producer: '',
  minPrice: '',
  maxPrice: '',
  organic: null,
  sort: 'created_at',
  dir: 'desc'
};

export function useGreekSearch(): UseGreekSearchReturn {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [state, setState] = useState<SearchState>({
    products: [],
    filteredProducts: [],
    loading: true,
    error: null,
    categories: [],
    producers: [],
    totalResults: 0
  });

  // Create Greek search terms from the search query
  const searchTerms = useMemo(() => {
    if (!filters.search.trim()) return [];
    return createGreekSearchTerms(filters.search);
  }, [filters.search]);

  // Client-side Greek-insensitive filtering for enhanced UX
  const filteredProducts = useMemo(() => {
    let filtered = state.products;

    // Apply Greek-insensitive search
    if (searchTerms.length > 0) {
      filtered = filtered.filter(product => {
        // Search in product name
        if (matchesGreekSearch(product.name, searchTerms)) return true;
        
        // Search in description
        if (product.description && matchesGreekSearch(product.description, searchTerms)) return true;
        
        // Search in producer name
        if (matchesGreekSearch(product.producer.name, searchTerms)) return true;
        
        // Search in categories
        if (product.categories.some(cat => matchesGreekSearch(cat.name, searchTerms))) return true;
        
        return false;
      });
    }

    // Apply other filters
    if (filters.category) {
      filtered = filtered.filter(product =>
        product.categories.some(cat => cat.name === filters.category)
      );
    }

    if (filters.producer) {
      filtered = filtered.filter(product =>
        product.producer.id.toString() === filters.producer
      );
    }

    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      filtered = filtered.filter(product => parseFloat(product.price) >= minPrice);
    }

    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      filtered = filtered.filter(product => parseFloat(product.price) <= maxPrice);
    }

    if (filters.organic !== null) {
      // This would need to be added to the Product interface and backend
      // For now, we'll check if the product name/description contains "βιολογικό" or "bio"
      const isOrganicSearch = (text: string) => {
        const normalized = normalizeGreekText(text);
        return normalized.includes('βιολογικο') || 
               normalized.includes('bio') || 
               normalized.includes('organic');
      };

      if (filters.organic) {
        filtered = filtered.filter(product =>
          isOrganicSearch(product.name) ||
          (product.description && isOrganicSearch(product.description)) ||
          product.categories.some(cat => isOrganicSearch(cat.name))
        );
      } else {
        filtered = filtered.filter(product =>
          !isOrganicSearch(product.name) &&
          !(product.description && isOrganicSearch(product.description)) &&
          !product.categories.some(cat => isOrganicSearch(cat.name))
        );
      }
    }

    // Apply sorting
    const sortField = filters.sort;
    const sortDirection = filters.dir;

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name, 'el-GR');
          break;
        case 'price':
          comparison = parseFloat(a.price) - parseFloat(b.price);
          break;
        case 'created_at':
        default:
          // Assuming we have a created_at field or using id as proxy
          comparison = a.id - b.id;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [state.products, searchTerms, filters]);

  // Load products from API
  const loadProducts = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const params: Record<string, string | number | boolean> = {
        per_page: 50, // Load more products for better client-side filtering
      };
      
      // Only send server-side filters that the API supports
      if (filters.category) params.category = filters.category;
      if (filters.producer) params.producer = filters.producer;
      if (filters.minPrice) params.min_price = parseFloat(filters.minPrice);
      if (filters.maxPrice) params.max_price = parseFloat(filters.maxPrice);
      
      // Note: We don't send the search query to the server anymore
      // Instead, we do Greek-insensitive search client-side
      
      const response = await apiClient.getProducts(params);
      
      // Extract unique categories and producers for filter dropdowns
      const uniqueCategories = Array.from(
        new Set(response.data.flatMap(product => 
          product.categories.map(cat => cat.name)
        ))
      ).sort((a, b) => a.localeCompare(b, 'el-GR'));
      
      const uniqueProducers = Array.from(
        new Set(response.data.map(product => ({
          id: product.producer.id,
          name: product.producer.name
        })).filter((producer, index, self) => 
          index === self.findIndex(p => p.id === producer.id)
        ))
      ).sort((a, b) => a.name.localeCompare(b.name, 'el-GR'));
      
      setState(prev => ({
        ...prev,
        products: response.data,
        categories: uniqueCategories,
        producers: uniqueProducers,
        loading: false
      }));
      
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load products',
        loading: false
      }));
    }
  }, [filters.category, filters.producer, filters.minPrice, filters.maxPrice]);

  // Update filteredProducts and totalResults when products or filters change
  useEffect(() => {
    setState(prev => ({
      ...prev,
      filteredProducts,
      totalResults: filteredProducts.length
    }));
  }, [filteredProducts]);

  // Load products on mount and when server-side filters change
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const updateFilter = useCallback((key: keyof Filters, value: Filters[keyof Filters]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Boolean(filters.search || 
           filters.category || 
           filters.producer || 
           filters.minPrice || 
           filters.maxPrice || 
           filters.organic !== null)
  }, [filters]);

  const refreshProducts = useCallback(() => {
    return loadProducts();
  }, [loadProducts]);

  return {
    ...state,
    filteredProducts,
    filters,
    updateFilter,
    clearAllFilters,
    hasActiveFilters,
    searchTerms,
    refreshProducts
  };
}