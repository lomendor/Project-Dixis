'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient, Product } from '@/lib/api';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { isAuthenticated } = useAuth();

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

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    try {
      await apiClient.addToCart(productId, quantity);
      alert(`${quantity} item(s) added to cart!`);
      setQuantity(1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add product to cart');
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
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
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
                
                <div className="text-xl text-green-600 font-bold mb-4">
                  €{product.price} / {product.unit}
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

                {/* Add to Cart */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label htmlFor="quantity" className="text-sm font-medium text-gray-900">
                      Quantity:
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
                    disabled={product.stock === 0}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium"
                  >
                    {product.stock === 0 ? 'Out of Stock' : 
                     !isAuthenticated ? 'Login to Add to Cart' : 'Add to Cart'}
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