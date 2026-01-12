'use client';

interface ProducerConflictModalProps {
  currentProducerName: string;
  onCheckout: () => void;
  onReplace: () => void;
  onCancel: () => void;
}

/**
 * Modal shown when user tries to add a product from a different producer.
 * Option A (MVP): One producer per order - users must choose to complete
 * current order or clear cart before adding from new producer.
 */
export default function ProducerConflictModal({
  currentProducerName,
  onCheckout,
  onReplace,
  onCancel,
}: ProducerConflictModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="conflict-title"
      data-testid="producer-conflict-modal"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <h2
          id="conflict-title"
          className="text-lg font-bold text-neutral-900 mb-3"
        >
          Διαφορετικός Παραγωγός
        </h2>
        <p className="text-neutral-700 mb-6">
          Το καλάθι σου έχει προϊόντα από τον{' '}
          <strong className="text-neutral-900">{currentProducerName}</strong>.
          Μπορείς να ολοκληρώσεις την παραγγελία σου ή να αδειάσεις το καλάθι
          για να προσθέσεις προϊόντα από άλλο παραγωγό.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onCheckout}
            className="w-full h-12 bg-brand text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
            data-testid="conflict-checkout"
          >
            Ολοκλήρωσε την παραγγελία σου
          </button>
          <button
            onClick={onReplace}
            className="w-full h-12 bg-neutral-100 text-neutral-900 font-semibold rounded-lg hover:bg-neutral-200 transition-colors"
            data-testid="conflict-replace"
          >
            Άδειασε το καλάθι
          </button>
          <button
            onClick={onCancel}
            className="w-full h-10 text-neutral-600 hover:text-neutral-900 transition-colors"
            data-testid="conflict-cancel"
          >
            Ακύρωση
          </button>
        </div>
      </div>
    </div>
  );
}
