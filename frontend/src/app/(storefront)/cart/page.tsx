import { Suspense } from 'react';
import CartClient from './CartClient';

export const dynamic = 'force-dynamic';

export default function CartPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Φόρτωση...</div>}>
      <CartClient />
    </Suspense>
  );
}
