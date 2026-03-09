'use client';

import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const NAV = [
  { href: '/business/dashboard', label: 'Πίνακας Ελέγχου' },
  { href: '/business/subscription', label: 'Συνδρομή' },
];

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Pending businesses see a waiting message instead of full dashboard
  if (user?.business_status === 'pending') {
    return (
      <AuthGuard requireAuth requireRole="business">
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
          <div className="max-w-md text-center space-y-4">
            <div className="text-5xl">⏳</div>
            <h1 className="text-xl font-bold text-neutral-800">Η αίτησή σας εξετάζεται</h1>
            <p className="text-neutral-600">
              Ο λογαριασμός επιχείρησης σας βρίσκεται σε αναμονή έγκρισης.
              Θα ενημερωθείτε μόλις εγκριθεί.
            </p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth requireRole="business">
      <div className="min-h-screen bg-neutral-50">
        <nav className="bg-white border-b border-neutral-200">
          <div className="max-w-5xl mx-auto px-4 flex items-center gap-6 h-14">
            <span className="font-bold text-blue-700 text-sm">B2B</span>
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`text-sm font-medium px-1 py-4 border-b-2 transition-colors ${
                  pathname === n.href
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </div>
    </AuthGuard>
  );
}
