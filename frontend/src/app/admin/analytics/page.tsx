import { requireAdmin } from '@/lib/auth/admin';
import AnalyticsContent from './AnalyticsContent';

export default async function AnalyticsPage() {
  await requireAdmin?.();

  return <AnalyticsContent />;
}
