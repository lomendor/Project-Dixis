'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import CartIcon from '@/components/cart/CartIcon';

export default function Navigation() {
  const { user, logout, isAuthenticated, isProducer } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Logout errors handled by AuthContext
    }
  };

  // Handle mobile menu toggle with accessibility
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  // Handle escape key to close mobile menu
  useEffect(() => {
    // SSR guard: document only available in browser
    if (typeof window === 'undefined') return undefined;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        mobileMenuButtonRef.current?.focus();
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      // Focus the first focusable element in mobile menu
      const firstFocusable = mobileMenuRef.current?.querySelector(
        'a, button, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      firstFocusable?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [mobileMenuOpen]);

  // Handle click outside to close mobile menu
  useEffect(() => {
    // SSR guard: document only available in browser
    if (typeof window === 'undefined') return undefined;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !mobileMenuButtonRef.current?.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="bg-white shadow-sm border-b" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary">
              Project Dixis
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/"
                className="text-neutral-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                data-testid="nav-products"
              >
                Products
              </Link>

              <Link
                href="/contact"
                className="text-neutral-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                data-testid="nav-contact"
              >
                Επικοινωνία
              </Link>

              <CartIcon />
              
              {isAuthenticated && isProducer && (
                <Link
                  href="/producer/dashboard"
                  className="text-neutral-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                  data-testid="nav-dashboard"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div data-testid="user-menu" className="flex items-center space-x-4">
                <span className="text-sm text-neutral-700">
                  Hello, {user?.name}
                </span>
                <button
                  data-testid="logout-btn"
                  onClick={handleLogout}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="text-neutral-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                  data-testid="nav-login"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-primary hover:bg-primary-light text-white px-3 py-2 rounded-md text-sm font-medium"
                  data-testid="nav-register"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              ref={mobileMenuButtonRef}
              data-testid="mobile-menu-button"
              onClick={toggleMobileMenu}
              className="bg-neutral-50 p-2 rounded-md text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? 'Close main menu' : 'Open main menu'}
            >
              <span className="sr-only">{mobileMenuOpen ? 'Close' : 'Open'} main menu</span>
              {mobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div 
            ref={mobileMenuRef}
            className="md:hidden" 
            data-testid="mobile-menu"
            data-state={mobileMenuOpen ? 'open' : 'closed'}
            id="mobile-menu"
            role="menu"
            aria-labelledby="mobile-menu-button"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="/"
                className="text-neutral-700 hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
                data-testid="mobile-nav-products"
              >
                Products
              </Link>

              <Link
                href="/contact"
                className="text-neutral-700 hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
                data-testid="mobile-nav-contact"
              >
                Επικοινωνία
              </Link>

              <CartIcon
                className="block text-base font-medium"
                isMobile={true}
              />
              
              {isAuthenticated && isProducer && (
                <Link
                  href="/producer/dashboard"
                  className="text-neutral-700 hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
                  data-testid="mobile-nav-dashboard"
                  >
                  Dashboard
                </Link>
              )}
            </div>
            
            {/* Mobile Auth Section */}
            <div className="pt-4 pb-3 border-t border-neutral-200">
              {isAuthenticated ? (
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-primary-pale rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-neutral-800">
                      {user?.name}
                    </div>
                    <div className="text-sm font-medium text-neutral-500">
                      {user?.role === 'producer' ? 'Producer' : 'Consumer'}
                    </div>
                  </div>
                  <button
                    data-testid="mobile-logout-btn"
                    onClick={handleLogout}
                    className="ml-auto bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="px-2 space-y-1">
                  <Link
                    href="/auth/login"
                    className="text-neutral-700 hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
                    data-testid="mobile-nav-login"
                      >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-primary hover:bg-primary-light text-white block px-3 py-2 rounded-md text-base font-medium"
                    data-testid="mobile-nav-register"
                      >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}