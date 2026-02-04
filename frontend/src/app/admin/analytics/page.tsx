import { redirect } from 'next/navigation';
import { requireAdmin, AdminError } from '@/lib/auth/admin';
import AnalyticsContent from './AnalyticsContent';

export default async function AnalyticsPage() {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminError) {
      redirect('/auth/login?from=/admin/analytics');
    }
    throw e;
  }

  return <AnalyticsContent />;
}
