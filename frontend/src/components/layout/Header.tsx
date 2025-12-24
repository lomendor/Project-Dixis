'use client';
import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/brand/Logo';
import CartIcon from '@/components/cart/CartIcon';
import { useAuth } from '@/hooks/useAuth';

const navLinks = [
  { href: '/products', label: 'Προϊόντα' },
  { href: '/orders/lookup', label: 'Παραγγελία' },
  { href: '/producers', label: 'Για Παραγωγούς' },
  { href: '/legal/terms', label: 'Όροι' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated, isProducer, isAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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

          {/* Desktop Auth Section */}
          {isAuthenticated ? (
            <>
              {/* Consumer: Show "Οι Παραγγελίες Μου" */}
              {!isProducer && !isAdmin && (
                <Link
                  href="/account/orders"
                  className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors"
                  data-testid="nav-my-orders"
                >
                  Οι Παραγγελίες Μου
                </Link>
              )}
              {isProducer && (
                <Link
                  href="/producer/dashboard"
                  className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors"
                  data-testid="nav-producer-dashboard"
                >
                  Πίνακας Παραγωγού
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors"
                  data-testid="nav-admin"
                >
                  Admin
                </Link>
              )}
              <span className="text-sm text-neutral-500">
                {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors"
                data-testid="logout-btn"
              >
                Αποσύνδεση
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors"
                data-testid="nav-login"
              >
                Σύνδεση
              </Link>
              <Link
                href="/auth/register"
                className="text-sm font-medium bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-md transition-colors"
                data-testid="nav-register"
              >
                Εγγραφή
              </Link>
            </>
          )}
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

            {/* Mobile Auth Section */}
            <div className="border-t border-neutral-200 mt-2 pt-2">
              {isAuthenticated ? (
                <>
                  {/* Consumer: Show "Οι Παραγγελίες Μου" */}
                  {!isProducer && !isAdmin && (
                    <Link
                      href="/account/orders"
                      className="flex items-center min-h-[48px] py-3 text-base font-medium text-neutral-700 hover:text-primary active:bg-primary-pale -mx-4 px-4 transition-colors touch-manipulation"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-nav-my-orders"
                    >
                      Οι Παραγγελίες Μου
                    </Link>
                  )}
                  {isProducer && (
                    <Link
                      href="/producer/dashboard"
                      className="flex items-center min-h-[48px] py-3 text-base font-medium text-neutral-700 hover:text-primary active:bg-primary-pale -mx-4 px-4 transition-colors touch-manipulation"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-nav-producer-dashboard"
                    >
                      Πίνακας Παραγωγού
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center min-h-[48px] py-3 text-base font-medium text-neutral-700 hover:text-primary active:bg-primary-pale -mx-4 px-4 transition-colors touch-manipulation"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-nav-admin"
                    >
                      Admin
                    </Link>
                  )}
                  <div className="flex items-center justify-between min-h-[48px] py-3 -mx-4 px-4">
                    <span className="text-base text-neutral-500">{user?.name}</span>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="text-base font-medium text-neutral-700 hover:text-primary transition-colors"
                      data-testid="mobile-logout-btn"
                    >
                      Αποσύνδεση
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="flex items-center min-h-[48px] py-3 text-base font-medium text-neutral-700 hover:text-primary active:bg-primary-pale -mx-4 px-4 transition-colors touch-manipulation"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="mobile-nav-login"
                  >
                    Σύνδεση
                  </Link>
                  <Link
                    href="/auth/register"
                    className="flex items-center justify-center min-h-[48px] py-3 text-base font-medium bg-primary hover:bg-primary-light text-white rounded-md mx-0 my-2 transition-colors touch-manipulation"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="mobile-nav-register"
                  >
                    Εγγραφή
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
