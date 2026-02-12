import ShippingBreakdown from '../../../components/checkout/ShippingBreakdown';
import { Card, CardTitle } from '../../../components/ui/card';

export const dynamic = 'force-dynamic';

export default function AdminShippingTestPage() {
  // SECURITY: Block in production unless BASIC_AUTH override
  const isProd = process.env.DIXIS_ENV === 'production' || process.env.NODE_ENV === 'production';
  const prodGuard = isProd && process.env.BASIC_AUTH !== '1';
  return (
    <main className="max-w-[880px] mx-auto mt-10 p-4">
      <div className="mb-4">
        <h2 className="m-0">Admin · Shipping Test</h2>
        <p className="text-gray-500 mt-1.5">Δοκίμασε Τ.Κ., βάρος και μέθοδο — φαίνεται breakdown & "Γιατί;".</p>
      </div>

      {prodGuard ? (
        <Card><CardTitle>Μη διαθέσιμο σε production χωρίς BASIC_AUTH</CardTitle></Card>
      ) : (
        <ShippingBreakdown initialPostalCode="10431" />
      )}
    </main>
  );
}
