import ShippingBreakdown from '../../../components/checkout/ShippingBreakdown';

export const dynamic = 'force-dynamic';
export default function Page() {
  return (
    <main style={{maxWidth:720, margin:'40px auto', padding:16}}>
      <h2>Checkout — Shipping Breakdown (Demo)</h2>
      <p>Δοκίμασε διαφορετικό Τ.Κ., μέθοδο και βάρος. Το UI καλεί το <code>/api/checkout/quote</code>.</p>
      <ShippingBreakdown initialPostalCode="10431" />
    </main>
  );
}
