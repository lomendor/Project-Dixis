import CheckoutFlow from '../../../components/checkout/CheckoutFlow';

export const dynamic = 'force-dynamic';

export default function CheckoutFlowPage() {
  return (
    <main style={{ maxWidth: 960, margin: '40px auto', padding: 16 }}>
      <h2 style={{ margin: 0 }}>Checkout · Flow</h2>
      <p style={{ color: '#6b7280', marginTop: 6 }}>
        Δώσε διεύθυνση → υπολόγισε μεταφορικά → πλήρωσε (stub).
      </p>
      <CheckoutFlow />
    </main>
  );
}
