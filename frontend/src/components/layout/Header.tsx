'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const CartBadge = dynamic(
  () => import('@/components/CartBadge').then(m => ({ default: m.CartBadge })),
  { ssr: false }
);

const navLinks = [
  { href: '/products', label: 'Προϊόντα' },
  { href: '/orders/lookup', label: 'Παραγγελία' },
  { href: '/producers', label: 'Για Παραγωγούς' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-gray-100 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/images/logo-mark.png"
            alt="Dixis"
            width={36}
            height={36}
            className="group-hover:scale-105 transition-transform"
            priority
          />
          <span className="font-extrabold tracking-tight text-xl text-gray-900 group-hover:text-emerald-700 transition-colors">
            Dixis
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-5 text-sm">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <CartBadge />

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="sm:hidden p-2 -mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Κλείσιμο μενού' : 'Άνοιγμα μενού'}
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="sm:hidden border-t bg-white">
          <div className="max-w-6xl mx-auto px-4 py-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-3 text-base hover:bg-gray-50 -mx-4 px-4"
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
