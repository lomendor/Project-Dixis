import ShippingBreakdown from '../../../components/checkout/ShippingBreakdown';

export const dynamic = 'force-dynamic';
export default function Page() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-2">Checkout — Shipping Breakdown (Demo)</h2>
      <p className="text-neutral-600 mb-6">
        Δοκίμασε διαφορετικό Τ.Κ., μέθοδο και βάρος. Το UI καλεί το <code className="px-1.5 py-0.5 bg-neutral-100 rounded text-sm">/api/checkout/quote</code>.
      </p>
      <ShippingBreakdown initialPostalCode="10431" />
    </main>
  );
}
