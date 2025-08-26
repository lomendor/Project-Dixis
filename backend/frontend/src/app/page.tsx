'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient, Product } from '@/lib/api';
import Navigation from '@/components/Navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadProducts();
  }, [search, selectedCategory]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProducts({
        search: search || undefined,
        category: selectedCategory || undefined,
        per_page: 20,
      });
      
      setProducts(response.data);
      
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(
          response.data.flatMap(product => 
            product.categories.map(cat => cat.name)
          )
        )
      );
      setCategories(uniqueCategories);
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: number) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = '/auth/login';
      return;
    }

    try {
      await apiClient.addToCart(productId, 1);
      // Show a better success message
      const successDiv = document.createElement('div');
      successDiv.innerHTML = `
        <div class="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2" data-testid="cart-success">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>Added to cart!</span>
        </div>
      `;
      document.body.appendChild(successDiv);
      setTimeout(() => {
        document.body.removeChild(successDiv);
      }, 3000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Show a better error message
      const errorDiv = document.createElement('div');
      errorDiv.innerHTML = `
        <div class="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span>Failed to add to cart</span>
        </div>
      `;
      document.body.appendChild(errorDiv);
      setTimeout(() => {
        document.body.removeChild(errorDiv);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 data-testid="page-title" className="text-3xl font-bold text-gray-900 mb-4">
            Fresh Products from Local Producers
          </h1>
          
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner text="Loading fresh products..." />
        ) : error ? (
          <ErrorState
            title="Unable to load products"
            message={error}
            onRetry={loadProducts}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} data-testid="product-card" className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Product Image Placeholder */}
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {product.images.length > 0 ? (
                    <img
                      data-testid="product-image"
                      src={product.images[0].url || product.images[0].image_path}
                      alt={product.images[0].alt_text || product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">No Image</span>
                  )}
                </div>

                <div className="p-4">
                  <h3 data-testid="product-name" className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    By {product.producer.name}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span data-testid="product-price" className="text-xl font-bold text-green-600">
                      €{product.price} / {product.unit}
                    </span>
                    {product.stock !== null && (
                      <span className="text-sm text-gray-500">
                        Stock: {product.stock}
                      </span>
                    )}
                  </div>

                  {/* Categories */}
                  {product.categories.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {product.categories.slice(0, 2).map((category) => (
                          <span
                            key={category.id}
                            className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                          >
                            {category.name}
                          </span>
                        ))}
                        {product.categories.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{product.categories.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-center text-sm font-medium"
                    >
                      View Details
                    </Link>
                    <button
                      data-testid="add-to-cart-btn"
                      onClick={() => handleAddToCart(product.id)}
                      disabled={product.stock === 0}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {products.length === 0 && !loading && !error && (
          <EmptyState
            icon={
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
            title="No products found"
            description={search || selectedCategory ? 
              "We couldn't find any products matching your search criteria. Try adjusting your filters or search terms." :
              "No products are currently available. Check back soon for fresh local produce!"
            }
            actionLabel="Clear Filters"
            onAction={() => {
              setSearch('');
              setSelectedCategory('');
            }}
          />
        )}
      </main>
    </div>
  );
}
