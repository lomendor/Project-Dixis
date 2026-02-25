'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/cn';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/producer/dashboard', label: 'Πίνακας Ελέγχου', icon: '📊' },
  { href: '/producer/products', label: 'Προϊόντα', icon: '🏷️' },
  { href: '/producer/orders', label: 'Παραγγελίες', icon: '📦' },
  { href: '/producer/settlements', label: 'Πληρωμές', icon: '💰' },
  { href: '/producer/analytics', label: 'Αναλυτικά', icon: '📈' },
  { href: '/producer/settings', label: 'Ρυθμίσεις', icon: '⚙️' },
];

export function ProducerSidebar({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  function isActive(href: string): boolean {
    if (href === '/producer/dashboard') {
      return pathname === '/producer' || pathname === '/producer/dashboard';
    }
    return pathname.startsWith(href);
  }

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch {
      // Redirect anyway
    }
    window.location.href = '/auth/login';
  }, [logout]);

  return (
    <div className="flex flex-col h-full" data-testid="producer-sidebar">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-neutral-200 shrink-0">
        <Link href="/producer/dashboard" className="text-base font-bold text-neutral-900 tracking-tight">
          Dixis Παραγωγός
        </Link>
        <button
          type="button"
          className="lg:hidden p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
          onClick={onClose}
          aria-label="Κλείσιμο μενού"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Producer name */}
      {user?.name && (
        <div className="px-4 py-3 border-b border-neutral-100">
          <p className="text-sm font-medium text-neutral-900 truncate">{user.name}</p>
          <p className="text-xs text-neutral-500">Παραγωγός</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2" aria-label="Πλοήγηση παραγωγού">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                )}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                <span className="text-base leading-none" aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-neutral-200 px-4 py-3 shrink-0 space-y-2">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-red-400 hover:text-red-600 transition-colors w-full"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          Αποσύνδεση
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Επιστροφή στο site
        </Link>
      </div>
    </div>
  );
}
