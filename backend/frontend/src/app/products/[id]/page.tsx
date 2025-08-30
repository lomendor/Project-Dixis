'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient, Product } from '@/lib/api';
import Navigation from '@/components/Navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProductDetailSkeleton from '@/components/ProductDetailSkeleton';
import EnhancedErrorState from '@/components/EnhancedErrorState';
import ProductImageGallery from '@/components/ProductImageGallery';
import ProducerInfo from '@/components/ProducerInfo';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | string | null>(null);
  const [errorType, setErrorType] = useState<'error' | '404' | '500' | 'network'>('error');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const productId = parseInt(params.id as string);

  // Validate product ID
  useEffect(() => {
    if (isNaN(productId) || productId <= 0) {
      setError('Invalid product ID');
      setErrorType('404');
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    if (isNaN(productId) || productId <= 0) {
      return; // Skip if invalid ID
    }

    try {
      setLoading(true);
      setError(null);
      setErrorType('error');
      
      const productData = await apiClient.getProduct(productId);
      
      if (!productData) {
        setError('Product not found');
        setErrorType('404');
        return;
      }
      
      setProduct(productData);
    } catch (err) {
      console.error('Product loading error:', err);
      
      // Determine error type based on error message/status
      let type: 'error' | '404' | '500' | 'network' = 'error';
      let errorMessage = 'Failed to load product';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        if (errorMessage.includes('404') || errorMessage.toLowerCase().includes('not found')) {
          type = '404';
        } else if (errorMessage.includes('500') || errorMessage.toLowerCase().includes('server error')) {
          type = '500';
        } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')) {
          type = 'network';
        }
      }
      
      setError(err instanceof Error ? err : new Error(errorMessage));
      setErrorType(type);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      showToast('info', 'Please login to add items to cart');
      router.push('/auth/login');
      return;
    }

    if (!product) {
      showToast('error', 'Product information is not available');
      return;
    }

    if (product.stock !== null && product.stock <= 0) {
      showToast('error', 'This product is out of stock');
      return;
    }

    if (quantity <= 0) {
      showToast('error', 'Please select a valid quantity');
      return;
    }

    try {
      setAddingToCart(true);
      await apiClient.addToCart(productId, quantity);
      
      const productName = product.name || 'Product';
      const itemText = quantity === 1 ? 'item' : 'items';
      showToast('success', `${quantity} ${itemText} of ${productName} added to cart!`);
      setQuantity(1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      let message = 'Failed to add product to cart';
      
      if (error instanceof Error) {
        if (error.message.toLowerCase().includes('stock')) {
          message = 'Not enough stock available';
        } else if (error.message.toLowerCase().includes('auth')) {
          message = 'Session expired. Please login again';
          router.push('/auth/login');
        } else {
          message = error.message;
        }
      }
      
      showToast('error', message);
    } finally {
      setAddingToCart(false);
    }
  };

  // Calculate max quantity with better logic
  const getMaxQuantity = () => {
    if (!product) return 1;
    if (product.stock === null || product.stock === undefined) return 10; // Unknown stock
    return Math.min(Math.max(product.stock, 1), 10); // Between 1 and 10, but respect actual stock
  };
  
  const maxQuantity = getMaxQuantity();
  const isOutOfStock = product?.stock === 0;
  const hasLimitedStock = product?.stock !== null && product?.stock !== undefined && product.stock < 10;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="text-green-600 hover:text-green-700 flex items-center text-sm font-medium"
          >
            ← Back to Products
          </Link>
        </div>

        {loading ? (
          <ProductDetailSkeleton />
        ) : error ? (
          <EnhancedErrorState 
            error={error}
            variant={errorType}
            onRetry={loadProduct}
            showDetails={process.env.NODE_ENV === 'development'}
          />
        ) : product ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <ProductImageGallery 
              images={product.images || []}
              productName={product.name || 'Product'}
            />

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="product-title">
                  {product.name || 'Unnamed Product'}
                </h1>
                
                <div className="text-xl text-green-600 font-bold mb-4" data-testid="product-price">
                  {product.price ? `€${product.price}` : 'Price unavailable'}
                  {product.unit && ` / ${product.unit}`}
                </div>

                {product.description ? (
                  <div className="prose prose-sm text-gray-600 mb-6" data-testid="product-description">
                    <p>{product.description}</p>
                  </div>
                ) : (
                  <div className="text-gray-500 italic mb-6" data-testid="no-description">
                    <p>No description available for this product.</p>
                  </div>
                )}
              </div>

              {/* Producer Info */}
              <ProducerInfo producer={product.producer} variant="default" />

              {/* Categories */}
              <div data-testid="product-categories">
                {product.categories && product.categories.length > 0 ? (
                  <>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Categories
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {product.categories.map((category) => (
                        <span
                          key={category.id}
                          className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full"
                        >
                          {category.name || 'Unnamed Category'}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Categories
                    </h3>
                    <p className="text-sm text-gray-500 italic">No categories assigned</p>
                  </>
                )}
              </div>

              {/* Stock Info */}
              <div className="border-t pt-6" data-testid="stock-section">
                {product.stock !== null && product.stock !== undefined ? (
                  <div className="mb-4">
                    {product.stock > 0 ? (
                      <span className="text-sm text-gray-600" data-testid="stock-available">
                        Available Stock: {product.stock} {product.unit || 'item'}(s)
                      </span>
                    ) : (
                      <span className="text-sm text-red-600" data-testid="out-of-stock">
                        ❌ Out of Stock
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="mb-4">
                    <span className="text-sm text-green-600" data-testid="stock-unknown">
                      ✓ Available (Stock not tracked)
                    </span>
                  </div>
                )}

                {/* Add to Cart */}
                <div className="space-y-4" data-testid="add-to-cart-section">
                  <div className="flex items-center gap-4">
                    <label htmlFor="quantity" className="text-sm font-medium text-gray-900">
                      Quantity:
                    </label>
                    <select
                      id="quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      disabled={isOutOfStock || addingToCart}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                      data-testid="quantity-selector"
                    >
                      {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num}>
                          {num} {hasLimitedStock && num === maxQuantity ? '(max)' : ''}
                        </option>
                      ))}
                    </select>
                    
                    {hasLimitedStock && (
                      <span className="text-xs text-orange-600" data-testid="stock-warning">
                        Only {product?.stock} left!
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || addingToCart || !product}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    data-testid="add-to-cart-button"
                  >
                    {addingToCart ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding to Cart...
                      </span>
                    ) : isOutOfStock ? (
                      'Out of Stock'
                    ) : !isAuthenticated ? (
                      'Login to Add to Cart'
                    ) : !product ? (
                      'Product Unavailable'
                    ) : (
                      'Add to Cart'
                    )}
                  </button>

                  {!isAuthenticated && (
                    <p className="text-sm text-gray-600 text-center" data-testid="auth-prompt">
                      <Link href="/auth/login" className="text-green-600 hover:text-green-700 underline">
                        Login
                      </Link>
                      {' '}or{' '}
                      <Link href="/auth/register" className="text-green-600 hover:text-green-700 underline">
                        create an account
                      </Link>
                      {' '}to add items to cart
                    </p>
                  )}
                  
                  {isOutOfStock && (
                    <p className="text-sm text-red-600 text-center" data-testid="out-of-stock-message">
                      This product is currently out of stock. Please check back later.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Product not found.</p>
          </div>
        )}
      </main>
    </div>
  );
}