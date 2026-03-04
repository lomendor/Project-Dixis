'use client';

import { useState, useEffect } from 'react';
import { ProducerSidebar } from './ProducerSidebar';

/**
 * Producer shell layout — mirrors AdminShell pattern.
 *
 * Fixed overlay (z-50) covering public site Header/Footer.
 * Collapsible sidebar on mobile, persistent on desktop.
 * Body overflow is locked while shell is mounted to prevent double-scroll.
 */
export function ProducerShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Lock body scroll while producer shell is mounted to prevent double-scroll
  // The shell is fixed inset-0 but Header/Footer behind it can still cause body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex bg-neutral-50" data-testid="producer-shell">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-200
          transform transition-transform duration-200 ease-in-out
          lg:static lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <ProducerSidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-neutral-200 bg-white flex items-center px-4 lg:px-6 shrink-0">
          {/* Hamburger button (mobile only) */}
          <button
            type="button"
            className="lg:hidden mr-3 p-2 rounded-md text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            onClick={() => setSidebarOpen(true)}
            aria-label="Άνοιγμα μενού"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <span className="text-sm font-medium text-neutral-500">
            Dixis Παραγωγός
          </span>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
