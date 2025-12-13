import ShippingBreakdown from '../../../components/checkout/ShippingBreakdown';
import { Card, CardTitle } from '../../../components/ui/card';

export const dynamic = 'force-dynamic';

export default function AdminShippingTestPage() {
  // SECURITY: Block in production unless BASIC_AUTH override
  const isProd = process.env.DIXIS_ENV === 'production' || process.env.NODE_ENV === 'production';
  const prodGuard = isProd && process.env.BASIC_AUTH !== '1';
  return (
    <main style={{maxWidth:880, margin:'40px auto', padding:16}}>
      <div style={{marginBottom:16}}>
        <h2 style={{margin:0}}>Admin · Shipping Test</h2>
        <p style={{color:'#6b7280', margin:'6px 0 0'}}>Δοκίμασε Τ.Κ., βάρος και μέθοδο — φαίνεται breakdown & "Γιατί;".</p>
      </div>

      {prodGuard ? (
        <Card><CardTitle>Μη διαθέσιμο σε production χωρίς BASIC_AUTH</CardTitle></Card>
      ) : (
        <ShippingBreakdown initialPostalCode="10431" />
      )}
    </main>
  );
}
