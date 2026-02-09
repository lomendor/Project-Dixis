'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * /logout route — calls logout and redirects to homepage.
 * Fixes BUG-X01: Direct /logout URL was returning 404.
 */
export default function LogoutPage() {
  const { logout, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      logout().then(() => router.replace('/'));
    } else {
      router.replace('/');
    }
  }, [isAuthenticated, logout, router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p className="text-gray-500">Αποσύνδεση...</p>
    </div>
  );
}
