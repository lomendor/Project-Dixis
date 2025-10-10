'use client';

export function PrintButton() {
  return (
    <button
      onClick={() => typeof window !== 'undefined' && window.print()}
      className="no-print px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-100 text-sm font-medium"
      data-testid="print-button"
      type="button"
    >
      Εκτύπωση
    </button>
  );
}

export default PrintButton;
