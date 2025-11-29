'use client';
import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/brand/Logo';
import CartIcon from '@/components/cart/CartIcon';

const navLinks = [
  { href: '/products', label: 'Προϊόντα' },
  { href: '/orders/lookup', label: 'Παραγγελία' },
  { href: '/producers', label: 'Για Παραγωγούς' },
  { href: '/legal/terms', label: 'Όροι' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-neutral-200 bg-white/95 backdrop-blur-sm supports-[backdrop-filter]:bg-white/80 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo - touch-friendly */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity touch-manipulation active:opacity-80">
          <Logo height={28} title="Dixis" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <CartIcon />

          {/* Mobile Menu Button - 44px touch target */}
          <button
            type="button"
            className="md:hidden p-2 -mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-sm text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 transition-colors touch-manipulation"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Κλείσιμο μενού' : 'Άνοιγμα μενού'}
            data-testid="mobile-menu-button"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu - generous tap targets */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-neutral-200 bg-white shadow-lg" data-testid="mobile-menu">
          <div className="max-w-6xl mx-auto px-4 py-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center min-h-[48px] py-3 text-base font-medium text-neutral-700 hover:text-primary active:bg-primary-pale -mx-4 px-4 transition-colors touch-manipulation"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
