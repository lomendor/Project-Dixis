'use client';
import { useCart } from '@/components/CartProvider';
import * as C from '@/lib/cart/cart';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, refresh } = useCart();
  const router = useRouter();

  const handleQtyChange = (productId: string, qty: number) => {
    C.setQty(productId, qty);
    refresh();
  };

  const handleRemove = (productId: string) => {
    C.removeItem(productId);
    refresh();
  };

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Το καλάθι σας είναι άδειο</h1>
          <p className="text-gray-600 mb-8">Προσθέστε προϊόντα για να συνεχίσετε</p>
          <Link
            href="/products"
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Συνέχεια Αγορών
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Το Καλάθι μου</h1>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4 mb-8 lg:mb-0">
            {cart.items.map((item) => {
              const maxQty = Math.min(item.stock || 99, 99);
              return (
                <div key={item.productId} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                      <p className="text-gray-900 font-bold mb-4">
                        €{item.price.toFixed(2)}
                        {item.unit && <span className="text-sm text-gray-600">/{item.unit}</span>}
                      </p>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center border rounded-lg">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item.productId, item.qty - 1)}
                            disabled={item.qty <= 1}
                            className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Μείωση ποσότητας"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={maxQty}
                            value={item.qty}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              if (val >= 1 && val <= maxQty) {
                                handleQtyChange(item.productId, val);
                              }
                            }}
                            className="w-16 text-center border-x py-1 focus:outline-none"
                            aria-label="Ποσότητα"
                          />
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item.productId, item.qty + 1)}
                            disabled={item.qty >= maxQty}
                            className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Αύξηση ποσότητας"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemove(item.productId)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Αφαίρεση
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-lg">
                        €{(item.price * item.qty).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Σύνοψη Παραγγελίας</h2>

              <div className="space-y-2 mb-4 pb-4 border-b">
                <div className="flex justify-between">
                  <span className="text-gray-600">Υποσύνολο</span>
                  <span className="font-semibold">€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Μεταφορικά</span>
                  <span>Υπολογίζονται στο checkout</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold mb-6">
                <span>Σύνολο</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition mb-4"
              >
                Ολοκλήρωση Παραγγελίας
              </button>

              <Link
                href="/products"
                className="block text-center text-green-600 hover:text-green-700 font-medium"
              >
                Συνέχεια Αγορών
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
