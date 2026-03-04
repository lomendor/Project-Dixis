'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MultiImageUpload from '@/components/MultiImageUpload.client';
import PriceBreakdown from '@/components/producer/PriceBreakdown';
import { apiClient } from '@/lib/api';
import { greekToSlug } from '@/lib/slugify';

type Category = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
};

/**
 * Route cleanup: moved from /my/products/[id]/edit to /producer/products/[id]/edit
 * AuthGuard removed — handled by producer/layout.tsx
 */
export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Dynamic categories from API
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Units
  const units = ['kg', 'g', 'L', 'ml', 'τεμ'];

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [showSlug, setShowSlug] = useState(false);
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [discountPrice, setDiscountPrice] = useState('');
  const [weightPerUnit, setWeightPerUnit] = useState('');
  const [isSeasonal, setIsSeasonal] = useState(false);
  const [origin, setOrigin] = useState('');
  const [cultivationType, setCultivationType] = useState('');
  const [cultivationDescription, setCultivationDescription] = useState('');
  const [allergens, setAllergens] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState('');
  const [storageInstructions, setStorageInstructions] = useState('');
  const [shelfLife, setShelfLife] = useState('');

  // EU 1169/2011 — 14 allergens
  const EU_ALLERGENS = [
    { value: 'gluten', label: 'Γλουτένη' },
    { value: 'crustaceans', label: 'Καρκινοειδή' },
    { value: 'eggs', label: 'Αβγά' },
    { value: 'fish', label: 'Ψάρια' },
    { value: 'peanuts', label: 'Αράπικα φιστίκια' },
    { value: 'soybeans', label: 'Σόγια' },
    { value: 'milk', label: 'Γάλα' },
    { value: 'tree_nuts', label: 'Ξηροί καρποί' },
    { value: 'celery', label: 'Σέλινο' },
    { value: 'mustard', label: 'Μουστάρδα' },
    { value: 'sesame', label: 'Σουσάμι' },
    { value: 'sulphites', label: 'Θειώδη' },
    { value: 'lupin', label: 'Λούπινα' },
    { value: 'molluscs', label: 'Μαλάκια' },
  ];

  useEffect(() => {
    fetch('/api/public/categories')
      .then((r) => r.json())
      .then((data) => {
        setCategories(data.categories || []);
        setCategoriesLoading(false);
      })
      .catch(() => setCategoriesLoading(false));
  }, []);

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  async function loadProduct() {
    try {
      setLoading(true);
      const response = await apiClient.getProducerProduct(productId);
      const product = response.data;

      setTitle(product.name || '');
      setSlug(product.slug || '');
      setCategory(product.category || '');
      setUnit(product.unit || '');
      setDescription(product.description || '');
      setPrice(product.price?.toString() || '');
      setStock(product.stock?.toString() || '');
      // Load images: prefer images array, fallback to single image_url
      const imgs = (product.images || [])
        .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((img: any) => img.url);
      setImageUrls(imgs.length > 0 ? imgs : product.image_url ? [product.image_url] : []);
      setIsActive(product.is_active ?? true);
      setDiscountPrice(product.discount_price ? String(product.discount_price) : '');
      setWeightPerUnit(product.weight_per_unit ? String(product.weight_per_unit) : '');
      setIsSeasonal(!!product.is_seasonal);
      setOrigin(product.origin || '');
      setCultivationType(product.cultivation_type || '');
      setCultivationDescription(product.cultivation_description || '');
      setAllergens(Array.isArray(product.allergens) ? product.allergens : []);
      setIngredients(product.ingredients || '');
      setStorageInstructions(product.storage_instructions || '');
      setShelfLife(product.shelf_life || '');
    } catch (err: any) {
      setError(err.message || 'Σφάλμα φόρτωσης προϊόντος');
    } finally {
      setLoading(false);
    }
  }

  const discountTooHigh = discountPrice !== '' && price !== '' && parseFloat(discountPrice) >= parseFloat(price);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (discountTooHigh) { setError('Η τιμή προσφοράς πρέπει να είναι μικρότερη από την αρχική τιμή'); return; }
    setError('');
    setBusy(true);

    try {
      await apiClient.updateProducerProduct(productId, {
        name: title,
        slug,
        category,
        price: parseFloat(price),
        discount_price: discountPrice ? parseFloat(discountPrice) : null,
        unit,
        stock: parseInt(stock),
        description: description || undefined,
        image_url: imageUrls[0] || null,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        is_active: isActive,
        weight_per_unit: weightPerUnit ? parseFloat(weightPerUnit) : null,
        is_seasonal: isSeasonal,
        origin: origin || undefined,
        cultivation_type: cultivationType || undefined,
        cultivation_description: cultivationDescription || undefined,
        allergens: allergens.length > 0 ? allergens : [],
        ingredients: ingredients || undefined,
        storage_instructions: storageInstructions || undefined,
        shelf_life: shelfLife || undefined,
      });

      router.push('/producer/products');
    } catch (err: any) {
      setError(err.message || 'Σφάλμα ενημέρωσης προϊόντος');
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
              <div className="h-10 bg-neutral-200 rounded"></div>
              <div className="h-10 bg-neutral-200 rounded"></div>
              <div className="h-32 bg-neutral-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <div className="max-w-3xl mx-auto">
        {/* Page header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-neutral-500 hover:text-neutral-700 mb-2 inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Πίσω στα προϊόντα
          </button>
          <h1 className="text-2xl font-bold text-neutral-900" data-testid="page-title">
            Επεξεργασία Προϊόντος
          </h1>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" data-testid="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ─── Section 1: Basic Info ─── */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5 space-y-4">
            <h2 className="text-base font-semibold text-neutral-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Βασικά Στοιχεία
            </h2>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">
                Τίτλος Προϊόντος *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="π.χ. Βιολογικές Ντομάτες Κρήτης"
                data-testid="title-input"
              />
              {slug && (
                <p className="mt-1 text-sm text-neutral-500">
                  URL: /products/<span className="font-mono text-neutral-700">{slug}</span>
                  {' '}
                  <button
                    type="button"
                    onClick={() => setShowSlug(!showSlug)}
                    className="text-primary hover:text-primary-light underline"
                  >
                    {showSlug ? 'Απόκρυψη' : 'Επεξεργασία'}
                  </button>
                </p>
              )}
            </div>

            {showSlug && (
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-neutral-700 mb-1">
                  URL Προϊόντος (slug)
                </label>
                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    const normalized = e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/[^a-z0-9-]/g, '');
                    setSlug(normalized);
                  }}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="π.χ. biologikes-tomates"
                  data-testid="slug-input"
                />
                <p className="mt-1 text-sm text-neutral-500">
                  Χρησιμοποιείται στο URL (μόνο λατινικά, παύλες)
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-1">
                  Κατηγορία *
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  disabled={categoriesLoading}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-neutral-100"
                  data-testid="category-select"
                >
                  <option value="">
                    {categoriesLoading ? 'Φόρτωση...' : 'Επιλέξτε κατηγορία'}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.icon ? `${cat.icon} ${cat.name}` : cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-neutral-700 mb-1">
                  Μονάδα Μέτρησης *
                </label>
                <select
                  id="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  data-testid="unit-select"
                >
                  <option value="">Επιλέξτε μονάδα</option>
                  {units.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
                Περιγραφή
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Περιγραφή προϊόντος..."
                data-testid="description-textarea"
              />
            </div>
          </div>

          {/* ─── Section 2: Pricing & Stock ─── */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5 space-y-4">
            <h2 className="text-base font-semibold text-neutral-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>
              Τιμολόγηση & Απόθεμα
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-neutral-700 mb-1">
                  Τιμή (€) *
                </label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="π.χ. 3.50"
                  data-testid="price-input"
                />
              </div>

              <div>
                <label htmlFor="discount_price" className="block text-sm font-medium text-neutral-700 mb-1">
                  Τιμή Προσφοράς (€)
                </label>
                <input
                  id="discount_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="π.χ. 2.90"
                  data-testid="discount-price-input"
                />
                {discountTooHigh
                  ? <p className="mt-1 text-xs text-red-600 font-medium">Η τιμή προσφοράς πρέπει να είναι μικρότερη από την αρχική</p>
                  : <p className="mt-1 text-xs text-neutral-500">Αφήστε κενό αν δεν υπάρχει έκπτωση</p>}
              </div>
            </div>

            {/* Price Breakdown — PRICE-TRANSPARENCY-01 */}
            <PriceBreakdown price={price} discountPrice={discountPrice} onPriceChange={discountPrice ? setDiscountPrice : setPrice} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-neutral-700 mb-1">
                  Απόθεμα *
                </label>
                <input
                  id="stock"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min="0"
                  step="1"
                  value={stock}
                  onChange={(e) => setStock(e.target.value.replace(/[^0-9]/g, ''))}
                  onKeyDown={(e) => { if (['e', 'E', '+', '-', '.', ','].includes(e.key)) e.preventDefault(); }}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="π.χ. 25"
                  data-testid="stock-input"
                />
                <p className="mt-1 text-xs text-neutral-500">Αριθμός τεμαχίων (βάζα, μπουκάλια, σακουλάκια κλπ.)</p>
              </div>

              <div>
                <label htmlFor="weight_per_unit" className="block text-sm font-medium text-neutral-700 mb-1">
                  Βάρος/Όγκος ανά μονάδα
                </label>
                <input
                  id="weight_per_unit"
                  type="number"
                  step="0.001"
                  min="0"
                  value={weightPerUnit}
                  onChange={(e) => setWeightPerUnit(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="π.χ. 500 (σε γραμμάρια)"
                  data-testid="weight-input"
                />
                <p className="mt-1 text-xs text-neutral-500">Καθαρό βάρος σε γραμμάρια ή ml</p>
              </div>
            </div>
          </div>

          {/* ─── Section 3: Images ─── */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5 space-y-4">
            <h2 className="text-base font-semibold text-neutral-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Φωτογραφίες
            </h2>
            <MultiImageUpload
              value={imageUrls}
              onChange={setImageUrls}
              max={5}
              maxMB={5}
              label="Εικόνες Προϊόντος"
            />
          </div>

          {/* ─── Section 4: Origin & Cultivation ─── */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5 space-y-4">
            <h2 className="text-base font-semibold text-neutral-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Προέλευση & Καλλιέργεια
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="origin" className="block text-sm font-medium text-neutral-700 mb-1">
                  Τόπος Προέλευσης
                </label>
                <input
                  id="origin"
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="π.χ. Κρήτη, Μεσσηνία"
                  data-testid="origin-input"
                />
              </div>

              <div>
                <label htmlFor="cultivation_type" className="block text-sm font-medium text-neutral-700 mb-1">
                  Τρόπος Καλλιέργειας
                </label>
                <select
                  id="cultivation_type"
                  value={cultivationType}
                  onChange={(e) => setCultivationType(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  data-testid="cultivation-type-select"
                >
                  <option value="">Επιλέξτε...</option>
                  <option value="conventional">Συμβατική</option>
                  <option value="organic_certified">Βιολογική (Πιστοποιημένη)</option>
                  <option value="organic_transitional">Βιολογική (Μεταβατική)</option>
                  <option value="biodynamic">Βιοδυναμική</option>
                  <option value="traditional_natural">Παραδοσιακή / Φυσική</option>
                  <option value="other">Άλλο</option>
                </select>
              </div>
            </div>

            {cultivationType && (
              <div>
                <label htmlFor="cultivation_description" className="block text-sm font-medium text-neutral-700 mb-1">
                  Περιγραφή Καλλιέργειας
                </label>
                <textarea
                  id="cultivation_description"
                  rows={2}
                  value={cultivationDescription}
                  onChange={(e) => setCultivationDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="π.χ. Βιολογική καλλιέργεια χωρίς φυτοφάρμακα, πιστοποιημένη από ΔΗΩ..."
                  data-testid="cultivation-description-textarea"
                />
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isSeasonal}
                onChange={(e) => setIsSeasonal(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                data-testid="seasonal-checkbox"
              />
              <span className="text-sm text-neutral-700">Εποχιακό προϊόν</span>
            </label>
          </div>

          {/* ─── Section 5: Compliance (EU 1169/2011) ─── */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5 space-y-4">
            <h2 className="text-base font-semibold text-neutral-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Συστατικά & Αλλεργιογόνα
            </h2>

            <div>
              <label htmlFor="ingredients" className="block text-sm font-medium text-neutral-700 mb-1">
                Συστατικά
              </label>
              <textarea
                id="ingredients"
                rows={3}
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                maxLength={2000}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="π.χ. Ελαιόλαδο εξαιρετικό παρθένο, θυμάρι, ρίγανη..."
                data-testid="ingredients-textarea"
              />
              <p className="mt-1 text-xs text-neutral-500">
                {ingredients.length}/2000 χαρακτήρες
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Αλλεργιογόνα (EU 1169/2011)
              </label>
              <p className="text-xs text-neutral-500 mb-2">
                Επιλέξτε τα αλλεργιογόνα που περιέχει. Αφήστε κενό αν δεν περιέχει.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" data-testid="allergens-grid">
                {EU_ALLERGENS.map((a) => (
                  <label key={a.value} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allergens.includes(a.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAllergens([...allergens, a.value]);
                        } else {
                          setAllergens(allergens.filter((v) => v !== a.value));
                        }
                      }}
                      className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                    />
                    <span className="text-neutral-700">{a.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="storage_instructions" className="block text-sm font-medium text-neutral-700 mb-1">
                  Οδηγίες Αποθήκευσης
                </label>
                <input
                  id="storage_instructions"
                  type="text"
                  value={storageInstructions}
                  onChange={(e) => setStorageInstructions(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="π.χ. Σε σκιερό, δροσερό μέρος"
                  data-testid="storage-input"
                />
              </div>

              <div>
                <label htmlFor="shelf_life" className="block text-sm font-medium text-neutral-700 mb-1">
                  Διάρκεια Ζωής
                </label>
                <input
                  id="shelf_life"
                  type="text"
                  value={shelfLife}
                  onChange={(e) => setShelfLife(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="π.χ. 18 μήνες"
                  data-testid="shelf-life-input"
                />
              </div>
            </div>
          </div>

          {/* ─── Visibility Toggle ─── */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                id="is_active"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-5 w-5 text-primary focus:ring-primary border-neutral-300 rounded"
                data-testid="active-checkbox"
              />
              <div>
                <span className="text-sm font-medium text-neutral-800">Ενεργό προϊόν</span>
                <p className="text-xs text-neutral-500">Ορατό στους πελάτες στο κατάστημα</p>
              </div>
            </label>
          </div>

          {/* ─── Submit Actions ─── */}
          <div className="flex gap-3 sticky bottom-0 bg-neutral-50 pt-3 pb-2 -mx-4 px-4 lg:-mx-6 lg:px-6 border-t border-neutral-200">
            <button
              type="submit"
              disabled={busy}
              className="flex-1 bg-primary text-white py-2.5 px-4 rounded-lg hover:bg-primary-light disabled:bg-neutral-400 disabled:cursor-not-allowed transition-colors font-medium"
              data-testid="submit-btn"
            >
              {busy ? 'Ενημέρωση...' : 'Ενημέρωση Προϊόντος'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={busy}
              className="bg-neutral-100 text-neutral-700 py-2.5 px-6 rounded-lg hover:bg-neutral-200 disabled:bg-neutral-50 disabled:cursor-not-allowed transition-colors font-medium"
              data-testid="cancel-btn"
            >
              Ακύρωση
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
