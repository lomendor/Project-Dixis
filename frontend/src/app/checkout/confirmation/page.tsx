'use client';
import React from 'react';
import { Card, CardTitle } from '../../../components/ui/card';
import { formatEUR } from '../../../lib/money';
import ToastSuccess from '@/components/ToastSuccess';

export default function Confirmation() {
  const [json, setJson] = React.useState<any>(null);
  const [orderId, setOrderId] = React.useState<string>('');
  const [orderNo, setOrderNo] = React.useState<string>('');
  const [shareUrl, setShareUrl] = React.useState(''); // AG40: share URL state

  // AG57: Unified toast state (replaces copied, copiedGreek, copiedAG51)
  const [toast, setToast] = React.useState<{show:boolean,text:string}>({show:false,text:''});

  function showToast(msg:string) {
    setToast({show:true,text:msg});
    setTimeout(() => setToast({show:false,text:''}), 1200);
  }

  function getOrd() {
    try {
      return (document.querySelector('[data-testid="order-no"]') as HTMLElement)?.textContent?.trim() || '';
    } catch {
      return '';
    }
  }

  function copyOrd() {
    try {
      const v = getOrd();
      if (v) navigator.clipboard?.writeText?.(v).catch(() => {});
    } finally {
      showToast('Αντιγράφηκε');
    }
  }

  function copyLink() {
    try {
      const v = getOrd();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const url = (v && origin) ? `${origin}/orders/lookup?ordNo=${encodeURIComponent(v)}` : '';
      if (url) navigator.clipboard?.writeText?.(url).catch(() => {});
    } finally {
      showToast('Αντιγράφηκε');
    }
  }

  React.useEffect(() => {
    try {
      setJson(
        JSON.parse(localStorage.getItem('checkout_last_summary') || 'null')
      );
    } catch {}
    try {
      setOrderId(localStorage.getItem('checkout_order_id') || '');
    } catch {}
    try {
      setOrderNo(localStorage.getItem('checkout_order_no') || '');
    } catch {}
  }, []);

  // AG40: Build share URL from orderNo
  React.useEffect(() => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      if (orderNo && origin) {
        setShareUrl(`${origin}/orders/lookup?ordNo=${encodeURIComponent(orderNo)}`);
      }
    } catch {}
  }, [orderNo]);

  // AG40: Greek copy link handler (AG57: unified toast)
  async function onCopyLink() {
    try {
      if (shareUrl) {
        try {
          await navigator.clipboard.writeText(shareUrl);
        } catch {
          // Fallback for older browsers
          const ta = document.createElement('textarea');
          ta.value = shareUrl;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          ta.remove();
        }
        showToast('Αντιγράφηκε');
      }
    } catch {}
  }

  // AG48: Print/Save PDF handler
  function onPrint() {
    try {
      window.print?.();
    } catch {}
  }

  return (
    <main style={{ maxWidth: 760, margin: '40px auto', padding: 16 }}>
      <h2 style={{ margin: 0 }}>Επιβεβαίωση παραγγελίας</h2>
      <p style={{ color: '#6b7280', marginTop: 6 }}>
        Mock επιτυχία πληρωμής.
      </p>
      <Card>
        <CardTitle>Σύνοψη</CardTitle>
        {orderNo && (
          <div className="mt-1 text-sm text-neutral-800">
            Order No: <strong data-testid="order-no">{orderNo}</strong>
          </div>
        )}
        {orderId && (
          <div className="mt-1 text-xs text-neutral-600">
            Order ID: <strong data-testid="order-id">{orderId}</strong>
          </div>
        )}
        <div className="mt-3 text-sm">
          {!json ? (
            'Δεν βρέθηκαν στοιχεία.'
          ) : (
            <ul className="list-disc pl-5">
              <li>
                Τ.Κ.: <strong>{json?.address?.postalCode}</strong>
              </li>
              <li>
                Μέθοδος: <strong>{json?.method}</strong>
              </li>
              <li>
                Σύνολο:{' '}
                <strong data-testid="confirm-total">
                  {formatEUR(json?.total)}
                </strong>
              </li>
            </ul>
          )}
        </div>
        {orderNo && (
          <div className="mt-4 p-3 border rounded bg-gray-50">
            <div className="text-sm font-medium text-neutral-800 mb-2">
              Customer Link
            </div>
            <div className="text-xs text-neutral-600 break-all mb-2">
              <a
                href={`/orders/lookup?ordNo=${orderNo}`}
                className="underline"
                data-testid="customer-link"
              >
                {typeof window !== 'undefined'
                  ? `${window.location.origin}/orders/lookup?ordNo=${orderNo}`
                  : `/orders/lookup?ordNo=${orderNo}`}
              </a>
            </div>
            <button
              onClick={async () => {
                try {
                  const link =
                    typeof window !== 'undefined'
                      ? `${window.location.origin}/orders/lookup?ordNo=${orderNo}`
                      : `/orders/lookup?ordNo=${orderNo}`;
                  await navigator.clipboard.writeText(link);
                  showToast('Αντιγράφηκε');
                } catch {}
              }}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              data-testid="copy-customer-link"
            >
              Copy link
            </button>
          </div>
        )}
      </Card>

      {/* AG42 — Compact Order Summary card */}
      {orderNo && (
        <div
          data-testid="order-summary-card"
          className="mt-4 max-w-sm rounded border shadow-sm p-4 bg-white"
        >
          <div className="text-sm font-semibold mb-2">Περίληψη παραγγελίας</div>
          <div className="text-sm mb-1">
            Αρ. παραγγελίας:{' '}
            <span data-testid="order-summary-ordno" className="font-mono">
              {orderNo}
            </span>
          </div>
          <div className="text-sm">
            <a
              data-testid="order-summary-share"
              href={shareUrl || '#'}
              className="underline text-blue-600 hover:text-blue-800"
              aria-disabled={!shareUrl}
            >
              Προβολή παραγγελίας
            </a>
          </div>
        </div>
      )}

      {/* AG44 — Collapsible: Αποστολή & Σύνολα */}
      {orderNo && json && (
        <details data-testid="confirm-collapsible" className="mt-4 max-w-xl rounded border">
          <summary className="cursor-pointer select-none px-4 py-2 text-sm font-semibold bg-neutral-50 border-b hover:bg-neutral-100">
            Αποστολή &amp; Σύνολα
          </summary>
          <div className="p-4 space-y-3">
            {/* Summary section */}
            <div data-testid="confirm-collapsible-summary" className="rounded border shadow-sm p-3 bg-white">
              <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">Περίληψη παραγγελίας</div>
              <div className="text-sm mb-1">
                Αρ. παραγγελίας:{' '}
                <span data-testid="confirm-collapsible-ordno" className="font-mono">
                  {orderNo}
                </span>
              </div>
              <div className="text-sm">
                <a
                  data-testid="confirm-collapsible-share"
                  href={shareUrl || '#'}
                  className="underline text-blue-600 hover:text-blue-800"
                  aria-disabled={!shareUrl}
                >
                  Προβολή παραγγελίας
                </a>
              </div>
            </div>

            {/* AG46 — Shipping & Totals details (comprehensive) */}
            <div data-testid="confirm-collapsible-details" className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="text-neutral-500">Διεύθυνση</div>
              <div data-testid="cc-address">{json?.address?.street || '—'}</div>

              <div className="text-neutral-500">Πόλη</div>
              <div data-testid="cc-city">{json?.address?.city || '—'}</div>

              <div className="text-neutral-500">Τ.Κ.</div>
              <div data-testid="cc-zip">{json?.address?.postalCode || '—'}</div>

              <div className="text-neutral-500">Μέθοδος αποστολής</div>
              <div data-testid="cc-method">{json?.method || '—'}</div>

              {json?.weight && (
                <>
                  <div className="text-neutral-500">Βάρος</div>
                  <div data-testid="cc-weight">{json.weight}g</div>
                </>
              )}

              <div className="col-span-2 h-px bg-neutral-200 my-1"></div>

              {json?.subtotal !== undefined && (
                <>
                  <div className="text-neutral-500">Υποσύνολο</div>
                  <div data-testid="cc-subtotal">{formatEUR(json.subtotal)}</div>
                </>
              )}

              {json?.shippingCost !== undefined && (
                <>
                  <div className="text-neutral-500">Μεταφορικά</div>
                  <div data-testid="cc-shipping">{formatEUR(json.shippingCost)}</div>
                </>
              )}

              <div className="text-neutral-600 font-semibold">Σύνολο</div>
              <div data-testid="cc-total" className="font-semibold">
                {formatEUR(json?.total)}
              </div>
            </div>
          </div>
        </details>
      )}

      {/* AG40/AG57: Greek copy order link (unified toast below) */}
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          className="border px-3 py-2 rounded disabled:bg-gray-200 disabled:cursor-not-allowed"
          data-testid="copy-order-link"
          onClick={onCopyLink}
          disabled={!shareUrl}
        >
          Αντιγραφή συνδέσμου
        </button>
        <span data-testid="share-url" style={{ display: 'none' }}>
          {shareUrl}
        </span>
      </div>

      {/* AG48 — Print/Save PDF CTA */}
      <div className="mt-3 flex items-center gap-3" data-testid="print-toolbar">
        <button
          type="button"
          className="border px-3 py-2 rounded hover:bg-gray-100"
          data-testid="print-pdf"
          onClick={onPrint}
        >
          Εκτύπωση / Αποθήκευση PDF
        </button>
      </div>

      {/* AG51/AG57 — Copy actions (unified toast below) */}
      <div className="mt-2 flex items-center gap-3 flex-wrap" data-testid="confirm-copy-toolbar">
        <button
          type="button"
          className="border px-3 py-2 rounded text-sm"
          data-testid="copy-ordno"
          onClick={copyOrd}
        >
          Copy ordNo
        </button>
        <button
          type="button"
          className="border px-3 py-2 rounded text-sm"
          data-testid="copy-link"
          onClick={copyLink}
        >
          Copy link
        </button>
      </div>

      {/* AG38: Back to shop link */}
      <div className="mt-6">
        <a href="/" data-testid="back-to-shop-link" className="underline">
          Πίσω στο κατάστημα
        </a>
      </div>

      {/* AG49: print styles */}
      <style>{`
        @media print {
          /* Hide toolbars/buttons */
          [data-testid="print-toolbar"],
          button,
          [role="button"] {
            display: none !important;
          }
          /* Clean shadows/borders for clean PDF */
          .shadow, .shadow-sm, .shadow-md, .shadow-lg { box-shadow: none !important; }
          .border { border: 1px solid transparent !important; }
          body { background: #fff !important; }
          /* Avoid page-breaks in small blocks */
          [data-testid="order-summary-card"],
          [data-testid="confirm-collapsible"] {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          /* Larger margins for printing */
          @page { margin: 16mm; }
        }
      `}</style>

      {/* AG56-Ops: UI-only fast path validation marker */}
      <span data-testid="ui-fastpath-marker" style={{display:'none'}}>ok</span>

      {/* AG57: Unified success toast (replaces all old toasts) */}
      <ToastSuccess show={toast.show} text={toast.text} extraTestIds={['copy-toast', 'copied-flag']} />
    </main>
  );
}
