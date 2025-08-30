'use client';

import { useState } from 'react';
import { useDebounce, useCurrencyFormatter } from '@/hooks';
import { 
  greekNormalize, 
  safeText, 
  truncateText, 
  safeImageUrl, 
  DEFAULT_FALLBACKS 
} from '@/utils';

/**
 * Test page for our new hooks and utils
 * This page demonstrates the functionality of our PR-HY-C implementation
 */
export default function TestHooksUtilsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [greekText, setGreekText] = useState('Φρέσκα Πορτοκάλια');
  const [price, setPrice] = useState(29.99);
  const [longText, setLongText] = useState('This is a very long text that should be truncated to show how our truncateText utility function works properly with word boundaries and ellipsis.');

  // Test useDebounce hook
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Test useCurrencyFormatter hook
  const { formatCurrency, formatNumber, formatPercent } = useCurrencyFormatter();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Test Hooks & Utils (PR-HY-C)
        </h1>

        <div className="grid gap-8">
          {/* Test useDebounce hook */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">useDebounce Hook</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Term (300ms debounce):
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type to test debouncing..."
                />
              </div>
              <div className="bg-gray-100 p-3 rounded">
                <p><strong>Original:</strong> {searchTerm}</p>
                <p><strong>Debounced:</strong> {debouncedSearchTerm}</p>
              </div>
            </div>
          </div>

          {/* Test useCurrencyFormatter hook */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">useCurrencyFormatter Hook</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price:
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="bg-gray-100 p-3 rounded space-y-2">
                <p><strong>Currency:</strong> {formatCurrency(price)}</p>
                <p><strong>Number:</strong> {formatNumber(price)}</p>
                <p><strong>Percent (15%):</strong> {formatPercent(0.15)}</p>
              </div>
            </div>
          </div>

          {/* Test Greek normalization */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Greek Normalization Utils</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Greek Text:
                </label>
                <input
                  type="text"
                  value={greekText}
                  onChange={(e) => setGreekText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Εισάγετε κείμενο..."
                />
              </div>
              <div className="bg-gray-100 p-3 rounded space-y-2">
                <p><strong>Original:</strong> {greekText}</p>
                <p><strong>Normalized:</strong> {greekNormalize(greekText)}</p>
              </div>
            </div>
          </div>

          {/* Test text utilities */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Safe Text Utils</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Long Text:
                </label>
                <textarea
                  value={longText}
                  onChange={(e) => setLongText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="bg-gray-100 p-3 rounded space-y-2">
                <p><strong>Safe Text:</strong> {safeText(longText)}</p>
                <p><strong>Truncated (50 chars):</strong> {truncateText(longText, { length: 50, preserveWords: true })}</p>
                <p><strong>Truncated (30 chars):</strong> {truncateText(longText, { length: 30, preserveWords: false })}</p>
              </div>
            </div>
          </div>

          {/* Test image utilities */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Safe Image Utils</h2>
            <div className="space-y-4">
              <div className="bg-gray-100 p-3 rounded space-y-2">
                <p><strong>Invalid URL fallback:</strong></p>
                <p>Result: {safeImageUrl(null, DEFAULT_FALLBACKS.product)}</p>
                
                <p><strong>Valid URL:</strong></p>
                <p>Result: {safeImageUrl('https://example.com/image.jpg')}</p>
              </div>
            </div>
          </div>

          {/* API Test placeholder */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">useFetchJson Hook</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> useFetchJson hook is ready but needs an active API endpoint to demonstrate.
                It provides automatic API_BASE_URL integration, error handling, retries, and loading states.
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-8">
          <h2 className="text-lg font-semibold text-green-800 mb-2">
            PR-HY-C Implementation Complete
          </h2>
          <div className="text-green-700 space-y-1">
            <p>✅ <strong>useDebounce(500)</strong> - Debounce hook with 500ms default</p>
            <p>✅ <strong>useCurrencyFormatter(el-GR/EUR)</strong> - Greek locale currency formatting</p>
            <p>✅ <strong>useFetchJson(API_BASE)</strong> - Fetch wrapper using centralized API_BASE_URL</p>
            <p>✅ <strong>greekNormalize</strong> - Remove Greek accents/tonos for search</p>
            <p>✅ <strong>safeImage</strong> - Image URL validation and fallback</p>
            <p>✅ <strong>safeText</strong> - Text sanitization and truncation</p>
            <p>✅ <strong>errorBoundary</strong> - Error boundary helper utilities</p>
          </div>
        </div>
      </div>
    </div>
  );
}