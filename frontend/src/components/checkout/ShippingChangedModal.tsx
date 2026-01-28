'use client';

import { useTranslations } from '@/contexts/LocaleContext';

/**
 * Pass ORDER-SHIPPING-SPLIT-01: Hard-block modal for shipping cost mismatch
 *
 * Shows when the server recalculates shipping and it differs from the quoted amount.
 * User must explicitly accept the new amount to continue.
 */

interface ShippingChangedModalProps {
  isOpen: boolean;
  oldAmount: number;
  newAmount: number;
  onAccept: () => void;
  onCancel: () => void;
}

export default function ShippingChangedModal({
  isOpen,
  oldAmount,
  newAmount,
  onAccept,
  onCancel,
}: ShippingChangedModalProps) {
  const t = useTranslations();
  const fmt = new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      data-testid="shipping-changed-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shipping-changed-title"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <h2
          id="shipping-changed-title"
          className="text-lg font-semibold text-gray-900 mb-2"
        >
          {t('checkoutPage.shippingChanged')}
        </h2>

        <p className="text-gray-600 mb-6">
          {t('checkoutPage.shippingChangedMessage', {
            old: fmt.format(oldAmount),
            new: fmt.format(newAmount),
          })}
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t('checkoutPage.shipping')} (quoted):</span>
            <span className="line-through text-gray-400">{fmt.format(oldAmount)}</span>
          </div>
          <div className="flex justify-between font-medium mt-1">
            <span>{t('checkoutPage.shipping')} (new):</span>
            <span className="text-emerald-600">{fmt.format(newAmount)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-11 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            data-testid="shipping-cancel-btn"
          >
            {t('checkoutPage.shippingCancel')}
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
            data-testid="shipping-accept-btn"
          >
            {t('checkoutPage.shippingAccept')}
          </button>
        </div>
      </div>
    </div>
  );
}
