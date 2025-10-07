'use client';

export function CopyTrackingLink({ orderId, phone }: { orderId: string; phone: string }) {
  const handleCopy = () => {
    const base = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
    const url = `${base}/orders/track/${orderId}?phone=${encodeURIComponent(phone)}`;
    navigator.clipboard.writeText(url);
    alert('Αντιγράφηκε: ' + url);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
    >
      Copy Tracking Link
    </button>
  );
}
