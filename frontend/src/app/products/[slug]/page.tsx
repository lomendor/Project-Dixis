'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

interface Product {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  price_cents: number;
  currency: string;
  unit: string;
  stock: number;
  weight_grams?: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  is_organic: boolean;
  is_seasonal: boolean;
  producer: {
    id: number;
    name: string;
    business_name: string;
    description?: string;
    location: string;
    phone?: string;
    website?: string;
    verified: boolean;
  };
  images: Array<{
    id: number;
    url: string;
    alt_text: string;
    is_primary: boolean;
  }>;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (slug) {
      loadProduct();
    }
  }, [slug]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/products/${slug}`);

      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
      } else if (response.status === 404) {
        setError('Το προϊόν δεν βρέθηκε ή δεν είναι διαθέσιμο');
      } else {
        setError('Αποτυχία φόρτωσης προϊόντος');
      }
    } catch (err) {
      setError('Σφάλμα δικτύου κατά τη φόρτωση');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      // Redirect to login
      router.push('/auth/login');
      return;
    }

    setAddingToCart(true);

    try {
      // Mock add to cart API call
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock_token',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity,
        }),
      });

      if (response.ok) {
        alert('Το προϊόν προστέθηκε στο καλάθι!'); // Simple success feedback
      } else {
        alert('Σφάλμα κατά την προσθήκη στο καλάθι');
      }
    } catch (err) {
      alert('Σφάλμα δικτύου');
    } finally {
      setAddingToCart(false);
    }
  };

  const formatPrice = (price: number, currency: string): string => {
    return `€${price.toFixed(2)}`;
  };

  const getMainImage = (): string => {
    if (!product || !product.images.length) {
      return '/images/product-placeholder.jpg';
    }
    return product.images[selectedImageIndex]?.url || product.images[0].url;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">❌</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4" data-testid="error-title">
              Σφάλμα
            </h1>
            <p className="text-gray-600 mb-6" data-testid="error-message">
              {error}
            </p>
            <Link
              href="/products"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              data-testid="back-to-catalog-btn"
            >
              Επιστροφή στον Κατάλογο
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm" data-testid="breadcrumbs">
            <Link href="/" className="text-gray-500 hover:text-gray-700">Αρχική</Link>
            <span className="text-gray-400">/</span>
            <Link href="/products" className="text-gray-500 hover:text-gray-700">Προϊόντα</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">{product.title}</span>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img
                  src={getMainImage()}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  data-testid="main-product-image"
                />
              </div>

              {/* Image Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex space-x-2" data-testid="image-thumbnails">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        index === selectedImageIndex ? 'border-green-500' : 'border-gray-200'
                      }`}
                      data-testid={`thumbnail-${index}`}
                    >
                      <img
                        src={image.url}
                        alt={image.alt_text}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Title and Price */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="product-title">
                  {product.title}
                </h1>

                <div className="flex items-center space-x-3 mb-4">
                  {product.is_organic && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      Βιολογικό
                    </span>
                  )}
                  {product.is_seasonal && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                      Εποχιακό
                    </span>
                  )}
                </div>

                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-green-600" data-testid="product-price">
                    {formatPrice(product.price, product.currency)}
                  </span>
                  <span className="text-gray-500">/ {product.unit}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Περιγραφή</h3>
                <p className="text-gray-600 leading-relaxed" data-testid="product-description">
                  {product.description}
                </p>
              </div>

              {/* Producer Info */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Παραγωγός</h3>
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900" data-testid="producer-name">
                      {product.producer.business_name}
                    </h4>
                    <p className="text-sm text-gray-600" data-testid="producer-location">
                      📍 {product.producer.location}
                    </p>
                    {product.producer.description && (
                      <p className="text-sm text-gray-600 mt-2">
                        {product.producer.description}
                      </p>
                    )}
                    {product.producer.verified && (
                      <div className="flex items-center mt-2">
                        <span className="text-sm text-green-600">✓ Επιβεβαιωμένος παραγωγός</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Categories */}
              {product.categories.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Κατηγορίες</h3>
                  <div className="flex flex-wrap gap-2" data-testid="product-categories">
                    {product.categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/products?category=${category.slug}`}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart */}
              <div className="border-t pt-6">
                <div className="flex items-center space-x-4 mb-4">
                  <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                    Ποσότητα:
                  </label>
                  <select
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    data-testid="quantity-select"
                    disabled={product.stock === 0}
                  >
                    {[...Array(Math.min(product.stock, 10))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">
                    {product.stock > 0 ? `${product.stock} διαθέσιμα` : 'Εξαντλημένο'}
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    Σύνολο: {formatPrice(product.price * quantity, product.currency)}
                  </span>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.stock === 0}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    product.stock === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400'
                  }`}
                  data-testid="add-to-cart-btn"
                >
                  {addingToCart
                    ? 'Προσθήκη...'
                    : product.stock === 0
                    ? 'Μη Διαθέσιμο'
                    : 'Προσθήκη στο Καλάθι'
                  }
                </button>
              </div>
            </div>
          </div>

          {/* Additional Product Details */}
          {(product.weight_grams || product.length_cm || product.width_cm || product.height_cm) && (
            <div className="border-t p-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Τεχνικά Χαρακτηριστικά</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {product.weight_grams && (
                  <div>
                    <span className="text-gray-500">Βάρος:</span>
                    <span className="ml-2 font-medium">{product.weight_grams}γρ</span>
                  </div>
                )}
                {product.length_cm && (
                  <div>
                    <span className="text-gray-500">Μήκος:</span>
                    <span className="ml-2 font-medium">{product.length_cm}εκ</span>
                  </div>
                )}
                {product.width_cm && (
                  <div>
                    <span className="text-gray-500">Πλάτος:</span>
                    <span className="ml-2 font-medium">{product.width_cm}εκ</span>
                  </div>
                )}
                {product.height_cm && (
                  <div>
                    <span className="text-gray-500">Ύψος:</span>
                    <span className="ml-2 font-medium">{product.height_cm}εκ</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}