'use client';
import { useState } from 'react';
import { useCart } from '@/components/CartProvider';
import * as C from '@/lib/cart/cart';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { cart, refresh } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    phone: '',
    line1: '',
    city: '',
    postal: '',
    email: ''
  });

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items.map((it) => ({
            productId: it.productId,
            qty: it.qty
          })),
          shipping: {
            name: form.name,
            phone: form.phone,
            line1: form.line1,
            city: form.city,
            postal: form.postal,
            email: form.email || undefined
          },
          paymentMethod: 'COD'
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Αποτυχία ολοκλήρωσης παραγγελίας');
      }

      // Clear cart and redirect to confirmation
      C.clearCart();
      refresh();
      router.push(`/checkout/confirmation?orderId=${data.orderId || data.order?.orderId || data.id}`);
    } catch (err: any) {
      setError(err.message || 'Παρουσιάστηκε σφάλμα');
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Το καλάθι σας είναι άδειο</h1>
          <p className="text-gray-600 mb-8">Προσθέστε προϊόντα για να συνεχίσετε</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Συνέχεια Αγορών
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Ολοκλήρωση Παραγγελίας</h1>

        <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Shipping form */}
          <div className="lg:col-span-2 mb-8 lg:mb-0">
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-xl font-semibold mb-4">Στοιχεία Αποστολής</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Ονοματεπώνυμο *
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Τηλέφωνο *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+30 6900000000"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label htmlFor="line1" className="block text-sm font-medium text-gray-700 mb-1">
                    Διεύθυνση *
                  </label>
                  <input
                    id="line1"
                    type="text"
                    required
                    value={form.line1}
                    onChange={(e) => setForm({ ...form, line1: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      Πόλη *
                    </label>
                    <input
                      id="city"
                      type="text"
                      required
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="postal" className="block text-sm font-medium text-gray-700 mb-1">
                      Τ.Κ. *
                    </label>
                    <input
                      id="postal"
                      type="text"
                      required
                      value={form.postal}
                      onChange={(e) => setForm({ ...form, postal: e.target.value })}
                      placeholder="12345"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email (προαιρετικό)
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Τρόπος Πληρωμής</h2>
              <div className="flex items-center gap-3 p-4 border-2 border-green-600 rounded-lg bg-green-50">
                <input
                  type="radio"
                  id="cod"
                  name="payment"
                  value="COD"
                  checked
                  readOnly
                  className="w-4 h-4"
                />
                <label htmlFor="cod" className="flex-1 cursor-pointer">
                  <span className="font-semibold">Αντικαταβολή (COD)</span>
                  <p className="text-sm text-gray-600 mt-1">
                    Πληρώστε κατά την παράδοση
                  </p>
                </label>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Σύνοψη Παραγγελίας</h2>

              <div className="space-y-3 mb-4 pb-4 border-b">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.title} x {item.qty}
                    </span>
                    <span className="font-medium">€{(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-4 pb-4 border-b">
                <div className="flex justify-between">
                  <span className="text-gray-600">Υποσύνολο</span>
                  <span className="font-semibold">€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Μεταφορικά</span>
                  <span>Υπολογίζονται από το σύστημα</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold mb-6">
                <span>Εκτιμώμενο Σύνολο</span>
                <span>€{subtotal.toFixed(2)}+</span>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Επεξεργασία...' : 'Ολοκλήρωση Παραγγελίας'}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Πατώντας "Ολοκλήρωση Παραγγελίας" αποδέχεστε τους όρους χρήσης
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
