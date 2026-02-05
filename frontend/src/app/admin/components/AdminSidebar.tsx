'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/orders', label: 'Παραγγελίες', icon: '📦' },
  { href: '/admin/products', label: 'Προϊόντα', icon: '🏷️' },
  { href: '/admin/products/moderation', label: 'Moderation', icon: '🛡️' },
  { href: '/admin/producers', label: 'Παραγωγοί', icon: '🧑‍🌾' },
  { href: '/admin/producers/images', label: 'Εικόνες', icon: '🖼️' },
  { href: '/admin/categories', label: 'Κατηγορίες', icon: '📂' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { href: '/admin/customers', label: 'Πελάτες', icon: '🛒' },
  { href: '/admin/users', label: 'Διαχειριστές', icon: '👥' },
  { href: '/admin/settings', label: 'Ρυθμίσεις', icon: '⚙️' },
];

/**
 * Pass ADMIN-LAYOUT-01: Sidebar navigation for admin panel.
 *
 * - Shows all admin pages with emoji icons
 * - Active page highlighting via usePathname()
 * - Close button visible on mobile only
 */
export function AdminSidebar({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  }

  return (
    <div className="flex flex-col h-full" data-testid="admin-sidebar">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-neutral-200 shrink-0">
        <Link href="/admin" className="text-base font-bold text-neutral-900 tracking-tight">
          Dixis Admin
        </Link>
        <button
          type="button"
          className="lg:hidden p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2" aria-label="Admin navigation">
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
      <div className="border-t border-neutral-200 px-4 py-3 shrink-0">
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
