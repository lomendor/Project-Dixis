import { redirect } from 'next/navigation';
import { requireAdmin, AdminError } from '@/lib/auth/admin';
import { AdminShell } from './components/AdminShell';

/**
 * FIX-ADMIN-AUTH-01: force-dynamic prevents Next.js from caching the auth
 * check result. Without this, a cached "redirect to login" response would
 * persist even after a successful OTP login, locking the admin out.
 */
export const dynamic = 'force-dynamic';

/**
 * Pass ADMIN-LAYOUT-01: Admin layout with sidebar navigation.
 *
 * - Server Component handles auth (requireAdmin)
 * - AdminShell (client) renders fixed overlay with sidebar + content area
 * - Covers root layout's Header/Footer with z-50 fixed overlay
 * - Zero changes to root layout = zero risk to public site
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminError) {
      redirect('/auth/admin-login?from=/admin');
    }
    throw e;
  }

  return <AdminShell>{children}</AdminShell>;
}
