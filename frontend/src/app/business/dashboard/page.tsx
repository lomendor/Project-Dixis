'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function BusinessDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">
          Καλώς ήρθατε, {user?.name}
        </h1>
        <p className="text-neutral-500 mt-1">Πίνακας ελέγχου επιχείρησης</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Subscription card */}
        <Link
          href="/business/subscription"
          className="block bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow"
        >
          <h2 className="font-semibold text-neutral-800">Συνδρομή</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Διαχειριστείτε τη συνδρομή σας και δείτε τα οφέλη
          </p>
        </Link>

        {/* Products catalog link */}
        <Link
          href="/products"
          className="block bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow"
        >
          <h2 className="font-semibold text-neutral-800">Κατάλογος Προϊόντων</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Περιηγηθείτε στα προϊόντα χονδρικής
          </p>
        </Link>
      </div>
    </div>
  );
}
