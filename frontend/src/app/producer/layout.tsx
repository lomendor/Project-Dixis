'use client';

import { usePathname } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { ProducerShell } from './components/ProducerShell';

/**
 * Producer layout with sidebar navigation.
 *
 * - Client Component: producer auth is client-side (Sanctum + useAuth)
 * - AuthGuard enforces role=producer
 * - ProducerShell renders fixed overlay with sidebar + content area
 * - Onboarding page is excluded from shell (no sidebar during onboarding)
 */
export default function ProducerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Onboarding page gets no sidebar — producer hasn't completed setup yet
  const isOnboarding = pathname.startsWith('/producer/onboarding');

  return (
    <AuthGuard requireAuth={true} requireRole="producer">
      {isOnboarding ? children : <ProducerShell>{children}</ProducerShell>}
    </AuthGuard>
  );
}
