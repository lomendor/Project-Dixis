export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { requireAdmin, AdminError } from '@/lib/auth/admin';
import { prisma } from '@/lib/db/client';
import { fetchProductCounts } from '@/lib/laravel/counts';

/**
 * Pass ADMIN-SETTINGS-01: Settings page with real system info.
 *
 * Replaces placeholder sections with actual Stripe, Resend, shipping,
 * and system information. Read-only — no mutations.
 */
export default async function AdminSettingsPage() {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminError) {
      redirect('/auth/admin-login?from=/admin/settings');
    }
    throw e;
  }

  // Collect system info (read-only, no secrets exposed)
  const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;
  const stripePk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const resendConfigured = !!process.env.RESEND_API_KEY;
  const nodeEnv = process.env.NODE_ENV || 'development';
  const dixisEnv = process.env.DIXIS_ENV || '(not set)';
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
  const lowStockThreshold = process.env.LOW_STOCK_THRESHOLD || '3';

  // DB check (orders stay in Prisma; products from Laravel SSOT)
  let dbStatus = 'unknown';
  let orderCount = 0;
  let productCount = 0;
  try {
    const [oc, pc] = await Promise.all([
      prisma.order.count(),
      fetchProductCounts(),
    ]);
    orderCount = oc;
    productCount = pc.total;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'error';
  }

  return (
    <div className="space-y-8" data-testid="admin-settings-page">
      <h1 className="text-2xl font-bold text-neutral-900">Ρυθμίσεις</h1>

      {/* Environment */}
      <SettingsSection title="Περιβάλλον">
        <ConfigRow label="NODE_ENV" value={nodeEnv} />
        <ConfigRow label="DIXIS_ENV" value={dixisEnv} />
        <ConfigRow label="API Base URL" value={apiBaseUrl} />
        <ConfigRow label="Low Stock Threshold" value={lowStockThreshold} />
      </SettingsSection>

      {/* Payments */}
      <SettingsSection title="Πληρωμές">
        <StatusRow label="Stripe" configured={stripeConfigured} />
        {stripePk && (
          <ConfigRow label="Publishable Key" value={`${stripePk.slice(0, 12)}...`} />
        )}
        <ConfigRow label="Μέθοδοι" value={stripeConfigured ? 'Κάρτα, Cash on Delivery' : 'Cash on Delivery μόνο'} />
      </SettingsSection>

      {/* Email Notifications */}
      <SettingsSection title="Ειδοποιήσεις (Email)">
        <StatusRow label="Resend" configured={resendConfigured} />
        <ConfigRow label="Λειτουργία" value={resendConfigured ? 'Αποστολή email ενεργή' : 'Email απενεργοποιημένα'} />
      </SettingsSection>

      {/* Shipping */}
      <SettingsSection title="Μεταφορικά">
        <ConfigRow label="Δωρεάν αποστολή" value="Εξαρτάται ανά παραγωγό" />
        <ConfigRow label="Ζώνες" value="Ηπειρωτική, Νησιά, Παραλαβή" />
        <ConfigRow label="Προεπιλογή" value="Courier (ηπειρωτική)" />
      </SettingsSection>

      {/* System */}
      <SettingsSection title="Σύστημα">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-neutral-500 w-40">Database</span>
          <StatusDot ok={dbStatus === 'connected'} />
          <span className="text-sm text-neutral-700">{dbStatus}</span>
        </div>
        <ConfigRow label="Παραγγελίες (DB)" value={String(orderCount)} />
        <ConfigRow label="Προϊόντα (DB)" value={String(productCount)} />
        <ConfigRow label="Node.js" value={process.version} />
        <ConfigRow label="Next.js" value="15.5.0" />
      </SettingsSection>
    </div>
  );
}

/* --- Sub-components --- */

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-neutral-900 mb-3 pb-2 border-b border-neutral-200">
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-neutral-500 w-40 shrink-0">{label}</span>
      <code className="text-sm bg-neutral-100 px-2 py-0.5 rounded text-neutral-800">{value}</code>
    </div>
  );
}

function StatusRow({ label, configured }: { label: string; configured: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-1">
      <span className="text-xs font-medium text-neutral-500 w-40 shrink-0">{label}</span>
      <StatusDot ok={configured} />
      <span className="text-sm text-neutral-700">{configured ? 'Ενεργό' : 'Δεν έχει ρυθμιστεί'}</span>
    </div>
  );
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full shrink-0 ${ok ? 'bg-emerald-500' : 'bg-red-400'}`}
      aria-label={ok ? 'Active' : 'Inactive'}
    />
  );
}
