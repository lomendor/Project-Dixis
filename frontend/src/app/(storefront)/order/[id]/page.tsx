import { getTranslations } from '@/lib/i18n/t';
import Link from 'next/link';

export default async function OrderConfirmation({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations();
  const { id } = await params;

  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-6">
          <svg className="mx-auto w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold mb-4" data-testid="order-success-title">
          {t('order.success.title')}
        </h1>
        
        <p className="text-neutral-600 mb-6">
          {t('order.success.body', { id })}
        </p>
        
        <p className="text-sm text-neutral-500 mb-8" data-testid="order-id">
          {t('checkout.orderId')}: <span className="font-mono font-medium">{id}</span>
        </p>
        
        <div className="space-y-3">
          <Link
            href="/products"
            className="block bg-primary hover:bg-primary-light text-white font-medium py-3 px-6 rounded-lg transition"
          >
            {t('cart.continue')}
          </Link>
          <Link
            href="/"
            className="block text-primary hover:underline"
          >
            {t('nav.home')}
          </Link>
        </div>
      </div>
    </main>
  );
}
