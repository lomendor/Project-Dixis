'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ShippingAddress {
  name: string;
  line1: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

interface ShippingQuote {
  costCents: number;
  label: string;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  weightGrams: number;
}

type CheckoutStep = 'shipping' | 'review' | 'payment';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: '',
    line1: '',
    city: '',
    postalCode: '',
    country: 'GR',
    phone: '',
  });
  const [shippingQuote, setShippingQuote] = useState<ShippingQuote | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Mock cart data for development
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Mock cart items
    setCartItems([
      {
        id: 1,
        name: 'Βιολογικές Ντομάτες Κρήτης',
        price: 3.50,
        quantity: 2,
        weightGrams: 2000,
      },
      {
        id: 2,
        name: 'Εξαιρετικό Παρθένο Ελαιόλαδο',
        price: 12.80,
        quantity: 1,
        weightGrams: 500,
      },
    ]);
  }, [isAuthenticated, router]);

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotalWeight = () => {
    return cartItems.reduce((sum, item) => sum + (item.weightGrams * item.quantity), 0);
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get shipping quote
      const totalWeight = calculateTotalWeight();
      const quote = await getShippingQuote(totalWeight, shippingAddress.postalCode);
      setShippingQuote(quote);
      setStep('review');
    } catch (err) {
      setError('Σφάλμα κατά τον υπολογισμό των εξόδων αποστολής');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Process payment with FakePaymentProvider
      const orderId = await processPayment();
      router.push(`/order/confirmation/${orderId}`);
    } catch (err) {
      setError('Σφάλμα κατά την επεξεργασία της πληρωμής');
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ολοκλήρωση Παραγγελίας</h1>

          {/* Step Indicator */}
          <div className="flex items-center space-x-4 mt-6">
            {[
              { key: 'shipping', label: 'Διεύθυνση Αποστολής' },
              { key: 'review', label: 'Επιβεβαίωση' },
              { key: 'payment', label: 'Πληρωμή' },
            ].map((stepInfo, index) => (
              <div key={stepInfo.key} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === stepInfo.key
                      ? 'bg-green-600 text-white'
                      : index < ['shipping', 'review', 'payment'].indexOf(step)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">
                  {stepInfo.label}
                </span>
                {index < 2 && (
                  <div className="ml-4 w-8 h-px bg-gray-300"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {step === 'shipping' && (
              <ShippingAddressForm
                address={shippingAddress}
                onChange={setShippingAddress}
                onSubmit={handleShippingSubmit}
                loading={loading}
              />
            )}

            {step === 'review' && (
              <ReviewStep
                shippingAddress={shippingAddress}
                shippingQuote={shippingQuote}
                onEditShipping={() => setStep('shipping')}
                onProceedToPayment={() => setStep('payment')}
              />
            )}

            {step === 'payment' && (
              <PaymentStep
                onProcessPayment={handlePayment}
                loading={loading}
              />
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              items={cartItems}
              subtotal={calculateSubtotal()}
              shippingQuote={shippingQuote}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions (will be moved to API later)
async function getShippingQuote(totalWeightGrams: number, postalCode: string): Promise<ShippingQuote> {
  // Mock shipping estimator
  const response = await fetch('/api/checkout/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ totalWeightGrams, postalCode }),
  });

  if (!response.ok) {
    throw new Error('Failed to get shipping quote');
  }

  return response.json();
}

async function processPayment(): Promise<string> {
  // Mock payment processing
  const response = await fetch('/api/checkout/pay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentMethod: 'fake' }),
  });

  if (!response.ok) {
    throw new Error('Payment failed');
  }

  const result = await response.json();
  return result.orderId;
}

// Component definitions (will be extracted to separate files if needed)
function ShippingAddressForm({
  address,
  onChange,
  onSubmit,
  loading,
}: {
  address: ShippingAddress;
  onChange: (address: ShippingAddress) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}) {
  const handleChange = (field: keyof ShippingAddress) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange({ ...address, [field]: e.target.value });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Διεύθυνση Αποστολής</h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Πλήρες Όνομα *
          </label>
          <input
            type="text"
            id="name"
            value={address.name}
            onChange={handleChange('name')}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            data-testid="shipping-name-input"
          />
        </div>

        <div>
          <label htmlFor="line1" className="block text-sm font-medium text-gray-700 mb-1">
            Διεύθυνση *
          </label>
          <input
            type="text"
            id="line1"
            value={address.line1}
            onChange={handleChange('line1')}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            data-testid="shipping-address-input"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              Πόλη *
            </label>
            <input
              type="text"
              id="city"
              value={address.city}
              onChange={handleChange('city')}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              data-testid="shipping-city-input"
            />
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
              Ταχυδρομικός Κώδικας *
            </label>
            <input
              type="text"
              id="postalCode"
              value={address.postalCode}
              onChange={handleChange('postalCode')}
              required
              pattern="[0-9]{5}"
              placeholder="12345"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              data-testid="shipping-postal-code-input"
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Τηλέφωνο (προαιρετικό)
          </label>
          <input
            type="tel"
            id="phone"
            value={address.phone}
            onChange={handleChange('phone')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            data-testid="shipping-phone-input"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-400 font-medium"
            data-testid="continue-to-review-btn"
          >
            {loading ? 'Υπολογισμός...' : 'Συνέχεια στην Επιβεβαίωση'}
          </button>
        </div>
      </form>
    </div>
  );
}

function ReviewStep({
  shippingAddress,
  shippingQuote,
  onEditShipping,
  onProceedToPayment,
}: {
  shippingAddress: ShippingAddress;
  shippingQuote: ShippingQuote | null;
  onEditShipping: () => void;
  onProceedToPayment: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Shipping Address Review */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Διεύθυνση Αποστολής</h2>
          <button
            onClick={onEditShipping}
            className="text-green-600 hover:text-green-700 text-sm font-medium"
            data-testid="edit-shipping-btn"
          >
            Επεξεργασία
          </button>
        </div>

        <div className="text-gray-600">
          <p className="font-medium">{shippingAddress.name}</p>
          <p>{shippingAddress.line1}</p>
          <p>{shippingAddress.city}, {shippingAddress.postalCode}</p>
          <p>Ελλάδα</p>
          {shippingAddress.phone && <p>Τηλ: {shippingAddress.phone}</p>}
        </div>
      </div>

      {/* Shipping Method */}
      {shippingQuote && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Μέθοδος Αποστολής</h2>
          <div className="flex items-center justify-between p-4 border border-green-200 rounded-lg bg-green-50">
            <div>
              <p className="font-medium text-gray-900">{shippingQuote.label}</p>
              <p className="text-sm text-gray-600">Παράδοση σε 2-3 εργάσιμες ημέρες</p>
            </div>
            <p className="font-medium text-gray-900">
              €{(shippingQuote.costCents / 100).toFixed(2)}
            </p>
          </div>
        </div>
      )}

      <div className="pt-4">
        <button
          onClick={onProceedToPayment}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium"
          data-testid="proceed-to-payment-btn"
        >
          Συνέχεια στην Πληρωμή
        </button>
      </div>
    </div>
  );
}

function PaymentStep({
  onProcessPayment,
  loading,
}: {
  onProcessPayment: () => void;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Πληρωμή</h2>

      <div className="mb-6">
        <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
          <h3 className="font-medium text-gray-900 mb-2">Demo Payment Provider</h3>
          <p className="text-sm text-gray-600">
            Αυτή είναι μια προσομοίωση πληρωμής για τους σκοπούς της ανάπτυξης.
            Η πληρωμή θα είναι πάντα επιτυχής.
          </p>
        </div>
      </div>

      <button
        onClick={onProcessPayment}
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-400 font-medium"
        data-testid="process-payment-btn"
      >
        {loading ? 'Επεξεργασία Πληρωμής...' : 'Ολοκλήρωση Παραγγελίας'}
      </button>
    </div>
  );
}

function OrderSummary({
  items,
  subtotal,
  shippingQuote,
}: {
  items: CartItem[];
  subtotal: number;
  shippingQuote: ShippingQuote | null;
}) {
  const total = subtotal + (shippingQuote ? shippingQuote.costCents / 100 : 0);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Σύνοψη Παραγγελίας</h2>

      {/* Items */}
      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{item.name}</p>
              <p className="text-sm text-gray-600">Ποσότητα: {item.quantity}</p>
            </div>
            <p className="text-sm font-medium text-gray-900">
              €{(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-2">
        {/* Subtotal */}
        <div className="flex justify-between">
          <p className="text-sm text-gray-600">Υποσύνολο</p>
          <p className="text-sm text-gray-900">€{subtotal.toFixed(2)}</p>
        </div>

        {/* Shipping */}
        <div className="flex justify-between">
          <p className="text-sm text-gray-600">Αποστολή</p>
          <p className="text-sm text-gray-900">
            {shippingQuote ? `€${(shippingQuote.costCents / 100).toFixed(2)}` : 'Υπολογισμός...'}
          </p>
        </div>

        {/* Total */}
        <div className="flex justify-between pt-2 border-t border-gray-200">
          <p className="font-medium text-gray-900">Σύνολο</p>
          <p className="font-medium text-gray-900" data-testid="order-total">
            €{total.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}