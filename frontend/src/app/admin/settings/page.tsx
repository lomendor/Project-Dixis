export const dynamic = 'force-dynamic';
import { requireAdmin } from '@/lib/auth/admin';
import Link from 'next/link';

// Environment config (read-only display)
const envConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  lowStockThreshold: process.env.LOW_STOCK_THRESHOLD || '3',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1',
};

export default async function AdminSettingsPage() {
  await requireAdmin?.();

  return (
    <main style={{ padding: 16, maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: 16 }}>
        <Link href="/admin" style={{ color: '#0070f3', textDecoration: 'none' }}>
          &larr; Επιστροφή στο Dashboard
        </Link>
      </div>

      <h1 style={{ marginBottom: 24 }}>Ρυθμίσεις</h1>

      {/* Environment Configuration */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
          Περιβάλλον
        </h2>
        <div style={{ display: 'grid', gap: 12 }}>
          <ConfigItem label="Mode" value={envConfig.nodeEnv} />
          <ConfigItem label="Low Stock Threshold" value={envConfig.lowStockThreshold} />
          <ConfigItem label="API Base URL" value={envConfig.apiBaseUrl} />
        </div>
      </section>

      {/* Notifications (placeholder) */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
          Ειδοποιήσεις
        </h2>
        <div style={{ padding: 16, backgroundColor: '#f9fafb', borderRadius: 8, color: '#6b7280' }}>
          Οι ρυθμίσεις ειδοποιήσεων θα προστεθούν σύντομα.
        </div>
      </section>

      {/* Shipping (placeholder) */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
          Μεταφορικά
        </h2>
        <div style={{ padding: 16, backgroundColor: '#f9fafb', borderRadius: 8, color: '#6b7280' }}>
          Οι ρυθμίσεις μεταφορικών θα προστεθούν σύντομα.
        </div>
      </section>

      {/* Payment (placeholder) */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
          Πληρωμές
        </h2>
        <div style={{ padding: 16, backgroundColor: '#f9fafb', borderRadius: 8, color: '#6b7280' }}>
          Οι ρυθμίσεις πληρωμών θα προστεθούν σύντομα.
        </div>
      </section>
    </main>
  );
}

function ConfigItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontWeight: 500, minWidth: 160 }}>{label}:</span>
      <code style={{
        backgroundColor: '#f3f4f6',
        padding: '4px 8px',
        borderRadius: 4,
        fontSize: 14,
        fontFamily: 'monospace'
      }}>
        {value}
      </code>
    </div>
  );
}
