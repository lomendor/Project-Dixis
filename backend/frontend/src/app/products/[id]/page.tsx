'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient, Product } from '@/lib/api';
import Navigation from '@/components/Navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useCart } from '@/contexts/CartContext';

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { 
    addToCart, 
    isLoading: cartLoading, 
    getItemQuantity, 
    isInCart,
    updateQuantity,
    removeItem,
    cart
  } = useCart();

  const productId = parseInt(params.id as string);

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await apiClient.getProduct(productId);
      setProduct(productData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const currentCartQuantity = getItemQuantity(productId);
  const itemInCart = isInCart(productId);
  const cartItem = cart?.items.find(item => item.product.id === productId);
  
  // Calculate potential total if this quantity is added
  const potentialTotal = useMemo(() => {
    if (!product) return '0.00';
    const productPrice = parseFloat(product.price);
    const totalCost = productPrice * quantity;
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(totalCost);
  }, [product, quantity]);
  
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    const success = await addToCart(productId, quantity);
    if (success) {
      setQuantity(1);
    }
  };
  
  const handleUpdateCartQuantity = async (newQuantity: number) => {
    if (!cartItem) return;
    
    if (newQuantity === 0) {
      await removeItem(cartItem.id);
    } else {
      await updateQuantity(cartItem.id, newQuantity);
    }
  };

  const maxQuantity = product?.stock || 10; // Fallback to 10 if no stock limit

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
          <LoadingSpinner text="Loading product..." />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadProduct}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        ) : product ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                {product.images.length > 0 ? (
                  <img
                    src={product.images.find(img => img.is_primary)?.url || product.images.find(img => img.is_primary)?.image_path || product.images[0].url || product.images[0].image_path}
                    alt={product.images.find(img => img.is_primary)?.alt_text || product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-gray-400">No Image Available</span>
                )}
              </div>
              
              {/* Additional Images */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(0, 4).map((image, index) => (
                    <div key={image.id} className="aspect-square bg-gray-200 rounded flex items-center justify-center">
                      <img
                        src={image.url || image.image_path}
                        alt={image.alt_text || `${product.name} ${index + 1}`}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                
                <div className="space-y-2 mb-4">
                  <div className="text-xl text-green-600 font-bold">
                    €{product.price} / {product.unit}
                  </div>
                  
                  {/* Dynamic total calculation preview */}
                  {quantity > 1 && (
                    <div className="text-sm text-gray-600">
                      Total for {quantity} {product.unit}(s): <span className="font-semibold text-green-600">{potentialTotal}</span>
                    </div>
                  )}
                  
                  {/* Current cart status */}
                  {itemInCart && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full border border-green-200">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {currentCartQuantity} in cart
                    </div>
                  )}
                </div>

                {product.description && (
                  <div className="prose prose-sm text-gray-600 mb-6">
                    <p>{product.description}</p>
                  </div>
                )}
              </div>

              {/* Producer Info */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Producer Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">
                    {product.producer.name}
                  </h4>
                  {product.producer.business_name && (
                    <p className="text-sm text-gray-600">
                      {product.producer.business_name}
                    </p>
                  )}
                  {product.producer.location && (
                    <p className="text-sm text-gray-600 mt-1">
                      📍 {product.producer.location}
                    </p>
                  )}
                  {product.producer.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      {product.producer.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Categories */}
              {product.categories.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.categories.map((category) => (
                      <span
                        key={category.id}
                        className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Info */}
              <div className="border-t pt-6">
                {product.stock !== null ? (
                  <div className="mb-4">
                    <span className="text-sm text-gray-600">
                      Available Stock: {product.stock} {product.unit}(s)
                    </span>
                  </div>
                ) : (
                  <div className="mb-4">
                    <span className="text-sm text-green-600">
                      ✓ In Stock
                    </span>
                  </div>
                )}

                {/* Enhanced Cart Interaction */}
                <div className="space-y-4">
                  {/* Current cart item controls */}
                  {itemInCart && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-green-800">In Your Cart</h4>
                        <span className="text-sm text-green-600">{currentCartQuantity} {product.unit}(s)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateCartQuantity(currentCartQuantity - 1)}
                          disabled={cartLoading || currentCartQuantity <= 1}
                          className="w-8 h-8 flex items-center justify-center bg-white border border-green-300 rounded-md hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="mx-3 font-medium">{currentCartQuantity}</span>
                        <button
                          onClick={() => handleUpdateCartQuantity(currentCartQuantity + 1)}
                          disabled={cartLoading || currentCartQuantity >= maxQuantity}
                          className="w-8 h-8 flex items-center justify-center bg-white border border-green-300 rounded-md hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                        <button
                          onClick={() => cartItem && removeItem(cartItem.id)}
                          disabled={cartLoading}
                          className="ml-4 text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Add more to cart */}
                  <div className="flex items-center gap-4">
                    <label htmlFor="quantity" className="text-sm font-medium text-gray-900">
                      {itemInCart ? 'Add more:' : 'Quantity:'}
                    </label>
                    <select
                      id="quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {Array.from({ length: Math.min(maxQuantity, 10) }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || cartLoading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    data-testid="add-to-cart"
                  >
                    {cartLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : product.stock === 0 ? 'Out of Stock' : 
                       !isAuthenticated ? 'Login to Add to Cart' : 
                       itemInCart ? `Add ${quantity} More` : 'Add to Cart'}
                  </button>

                  {!isAuthenticated && (
                    <p className="text-sm text-gray-600 text-center">
                      <Link href="/auth/login" className="text-green-600 hover:text-green-700">
                        Login
                      </Link>
                      {' '}or{' '}
                      <Link href="/auth/register" className="text-green-600 hover:text-green-700">
                        create an account
                      </Link>
                      {' '}to add items to cart
                    </p>
                  )}
                  
                  {/* Quick actions */}
                  {isAuthenticated && (
                    <div className="pt-4 border-t border-gray-200">
                      <Link
                        href="/cart"
                        className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5M7 13l-1.1 5m0 0h9.1M16 11V6a4 4 0 00-8 0v5" />
                        </svg>
                        View Cart {cart && cart.total_items > 0 && `(${cart.total_items})`}
                      </Link>
                    </div>
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