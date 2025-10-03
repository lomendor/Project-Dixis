'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient, Product } from '@/lib/api';
import Navigation from '@/components/Navigation';
import ProductDetailSkeleton from '@/components/ProductDetailSkeleton';
import ErrorFallback from '@/components/ErrorFallback';
import ProductImageFallback from '@/components/ProductImageFallback';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { usePageAnalytics } from '@/hooks/usePageAnalytics';
import { useAnalytics } from '@/lib/analytics';
import { formatCurrency } from '@/env';
import { validateProductData, classifyApiError } from '@/utils/productValidation';

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<'not-found' | 'server-error' | 'network-error' | 'unknown' | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { trackAddToCart } = useAnalytics();

  const productId = parseInt(params.id as string);
  
  // Track page view with product name when available
  usePageAnalytics(product ? `${product.name} - Product Detail` : 'Product Detail');

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const productData = await apiClient.getProduct(productId);
      
      // Validate and sanitize product data
      const validation = validateProductData(productData);
      
      if (!validation.isValid) {
        console.error('Product validation failed:', validation.errors);
        setError('unknown');
        return;
      }
      
      // Log warnings for debugging
      if (validation.warnings.length > 0) {
        console.warn('Product validation warnings:', validation.warnings);
      }
      
      setProduct(validation.product);
      setImageErrors(new Set()); // Reset image errors on successful load
      
    } catch (err) {
      console.error('Failed to load product:', err);
      const errorType = err instanceof Error ? classifyApiError(err) : 'unknown';
      setError(errorType);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!product) {
      showToast('error', 'Οι πληροφορίες προϊόντος δεν είναι διαθέσιμες');
      return;
    }

    try {
      setAddingToCart(true);
      await apiClient.addToCart(productId, quantity);
      
      // Track successful add to cart event
      trackAddToCart(
        product.id,
        product.name,
        quantity,
        product.price,
        product.categories.length > 0 ? product.categories[0].name : undefined
      );
      
      showToast('success', `${quantity} προϊόν(τα) προστέθηκαν στο καλάθι!`);
      setQuantity(1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      const message = error instanceof Error ? error.message : 'Αποτυχία προσθήκης προϊόντος στο καλάθι';
      showToast('error', message);
    } finally {
      setAddingToCart(false);
    }
  };

  const maxQuantity = product?.stock || 10; // Fallback to 10 if no stock limit
  
  const handleImageError = (imageId: number) => {
    setImageErrors(prev => new Set([...prev, imageId]));
  };
  
  const getImageSrc = (image: any) => {
    return image.url || image.image_path || '';
  };
  
  const getPrimaryImage = () => {
    if (!product?.images || product.images.length === 0) return null;
    return product.images.find(img => img.is_primary) || product.images[0];
  };

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
            ← Πίσω στα Προϊόντα
          </Link>
        </div>

        {loading ? (
          <ProductDetailSkeleton />
        ) : error ? (
          <ErrorFallback
            error={error}
            productId={productId}
            onRetry={loadProduct}
          />
        ) : product ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                {(() => {
                  const primaryImage = getPrimaryImage();
                  const imageSrc = primaryImage ? getImageSrc(primaryImage) : null;
                  const isImageBroken = primaryImage && imageErrors.has(primaryImage.id);
                  
                  return (
                    <ProductImageFallback
                      src={!isImageBroken ? imageSrc : undefined}
                      alt={primaryImage?.alt_text || product.name}
                      productName={product.name}
                      className="w-full h-full object-cover rounded-lg"
                      priority={true}
                      onError={() => primaryImage && handleImageError(primaryImage.id)}
                    />
                  );
                })()}
              </div>
              
              {/* Additional Images */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(0, 4).map((image, index) => {
                    const isImageBroken = imageErrors.has(image.id);
                    const imageSrc = !isImageBroken ? getImageSrc(image) : undefined;
                    
                    return (
                      <div key={image.id} className="aspect-square bg-gray-200 rounded overflow-hidden">
                        <ProductImageFallback
                          src={imageSrc}
                          alt={image.alt_text || `${product.name} ${index + 1}`}
                          productName={product.name}
                          className="w-full h-full object-cover rounded"
                          onError={() => handleImageError(image.id)}
                        />
                      </div>
                    );
                  })}
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
                  {formatCurrency(parseFloat(product.price))} / {product.unit}
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
                  Πληροφορίες Παραγωγού
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">
                    {product.producer?.name || 'Άγνωστος Παραγωγός'}
                  </h4>
                  {product.producer?.business_name && (
                    <p className="text-sm text-gray-600">
                      {product.producer.business_name}
                    </p>
                  )}
                  {product.producer?.location && (
                    <p className="text-sm text-gray-600 mt-1">
                      📍 {product.producer.location}
                    </p>
                  )}
                  {product.producer?.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      {product.producer.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Categories */}
              {product.categories && product.categories.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Κατηγορίες
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.categories.map((category) => (
                      <span
                        key={category.id}
                        className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full"
                      >
                        {category.name || 'Άγνωστη Κατηγορία'}
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
                      Διαθέσιμο Απόθεμα: {product.stock} {product.unit}
                    </span>
                  </div>
                ) : (
                  <div className="mb-4">
                    <span className="text-sm text-green-600">
                      ✓ Σε Απόθεμα
                    </span>
                  </div>
                )}

                {/* Add to Cart */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label htmlFor="quantity" className="text-sm font-medium text-gray-900">
                      Ποσότητα:
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
                    disabled={product.stock === 0 || addingToCart}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    data-testid="add-to-cart-button"
                    aria-label={`Add ${product.name} to cart`}
                  >
                    {addingToCart ? 'Προσθήκη στο Καλάθι...' : 
                     product.stock === 0 ? 'Εξαντλημένο' : 
                     !isAuthenticated ? 'Σύνδεση για Προσθήκη στο Καλάθι' : 'Προσθήκη στο Καλάθι'}
                  </button>

                  {!isAuthenticated && (
                    <p className="text-sm text-gray-600 text-center">
                      <Link href="/auth/login" className="text-green-600 hover:text-green-700">
                        Σύνδεση
                      </Link>
                      {' '}ή{' '}
                      <Link href="/auth/register" className="text-green-600 hover:text-green-700">
                        δημιουργήστε λογαριασμό
                      </Link>
                      {' '}για να προσθέσετε προϊόντα στο καλάθι
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Το προϊόν δεν βρέθηκε.</p>
          </div>
        )}
      </main>
    </div>
  );
}