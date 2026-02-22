'use client';

import { useState, useEffect } from 'react';

/**
 * Pass COMM-ENGINE-TOGGLE-01: Client-side toggle for the commission engine feature flag.
 * Reads current state from Laravel Pennant and toggles via admin API.
 */
export default function CommissionToggle() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings/commission-engine')
      .then((r) => r.json())
      .then((d) => setEnabled(d.enabled ?? false))
      .catch(() => setEnabled(false));
  }, []);

  const toggle = async () => {
    if (enabled === null) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings/commission-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled }),
      });
      const data = await res.json();
      if (data.success) setEnabled(data.enabled);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  if (enabled === null) {
    return <span className="text-xs text-neutral-400">Φόρτωση...</span>;
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-neutral-500 w-40 shrink-0">Μηχανή Προμηθειών</span>
      <button
        onClick={toggle}
        disabled={loading}
        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
          enabled
            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
            : 'bg-red-100 text-red-600 hover:bg-red-200'
        } ${loading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
      >
        {loading ? '...' : enabled ? 'Ενεργό' : 'Ανενεργό'}
      </button>
    </div>
  );
}
