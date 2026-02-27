'use client';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/brand/Logo';
import CartIcon from '@/components/cart/CartIcon';
import HeaderSearch from '@/components/layout/HeaderSearch';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from '@/contexts/LocaleContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, logout, isAuthenticated, isProducer, isAdmin, isHydrated, loading } = useAuth();
  const t = useTranslations();
  const pathname = usePathname();

  // Light background hero — solid header everywhere
  const isHome = pathname === '/';
  const isTransparent = false; // Solid header — light hero, no transparency needed

  useEffect(() => {
    if (!isHome) {
      setScrolled(false);
      return undefined;
    }
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll(); // check initial position
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  // Pass FIX-HOMEPAGE-HYDRATION-01: Don't render auth-dependent UI until hydration is complete.
  // This prevents hydration mismatch where server renders "guest" but client tries to render "authenticated".
  const showAuthUI = isHydrated && !loading;

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { href: '/products', label: t('nav.products') },
    { href: '/producers', label: t('producers.title') },
  ];

  const handleLogout = async () => {
    try {
      setUserMenuOpen(false);
      setMobileMenuOpen(false);
      await logout();
    } catch {
      // Logout errors handled by AuthContext
    }
  };

  // Cart visible for all roles (producers can also shop as customers)

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${
      isTransparent
        ? 'bg-white/15 backdrop-blur-md border-b border-white/20'
        : 'bg-white/95 backdrop-blur-sm supports-[backdrop-filter]:bg-white/80 border-b border-neutral-200/60'
    }`}>
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 h-[72px] flex items-center justify-between">
        {/* Logo — icon + serif wordmark on desktop */}
        <Link
          href="/"
          className="flex-shrink-0 flex items-center hover:opacity-90 transition-opacity touch-manipulation active:opacity-80"
          data-testid="header-logo"
        >
          {/* Desktop: icon + DIXIS wordmark */}
          <span className="hidden md:block">
            <Logo height={40} title="Dixis" showWordmark light={isTransparent} />
          </span>
          {/* Mobile: icon only */}
          <span className="block md:hidden">
            <Logo height={34} title="Dixis" />
          </span>
        </Link>

        {/* Desktop Primary Navigation — wider spacing, warmer hover */}
        <nav className="hidden md:flex items-center justify-center flex-1 gap-10" data-testid="header-primary-nav">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[13px] font-medium tracking-wide uppercase transition-colors duration-200 ${
                isTransparent
                  ? 'text-white/80 hover:text-white'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Right Side: Search + Cart + Auth */}
        <div className="hidden md:flex items-center gap-2">
          {/* Search - Pass HEADER-SEARCH-01 */}
          <HeaderSearch light={isTransparent} />

          {/* Cart - visible for all roles */}
          <CartIcon data-testid="header-cart" light={isTransparent} />

          {/* Auth Section - Pass FIX-HOMEPAGE-HYDRATION-01: Gate until hydrated */}
          {!showAuthUI ? (
            /* Loading placeholder - same width as auth buttons to prevent layout shift */
            <div className="w-[140px] h-10 bg-neutral-100 rounded-md animate-pulse" aria-hidden="true" />
          ) : isAuthenticated ? (
            /* User Dropdown */
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors px-3 py-2 rounded-md ${
                  isTransparent
                    ? 'text-white/90 hover:text-white hover:bg-white/10'
                    : 'text-neutral-600 hover:text-primary hover:bg-neutral-50'
                }`}
                data-testid="header-user-menu"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <span className="max-w-[120px] truncate">{user?.name || t('nav.account')}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50">
                  {/* User Name Display */}
                  <div className="px-4 py-2 border-b border-neutral-100">
                    <p className="text-sm font-medium text-neutral-900 truncate" data-testid="user-menu-name">
                      {user?.name}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">
                      {user?.email}
                    </p>
                  </div>

                  {/* Consumer: My Orders */}
                  {!isProducer && !isAdmin && (
                    <Link
                      href="/account/orders"
                      className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                      data-testid="user-menu-orders"
                    >
                      {t('nav.myOrders')}
                    </Link>
                  )}

                  {/* Producer: Dashboard + Orders */}
                  {isProducer && (
                    <>
                      <Link
                        href="/producer/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                        data-testid="user-menu-dashboard"
                      >
                        {t('producer.dashboard')}
                      </Link>
                      <Link
                        href="/producer/orders"
                        className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                        data-testid="user-menu-producer-orders"
                      >
                        {t('producer.orders')}
                      </Link>
                    </>
                  )}

                  {/* Admin: Admin Panel */}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                      data-testid="user-menu-admin"
                    >
                      {t('admin.dashboard')}
                    </Link>
                  )}

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors border-t border-neutral-100 mt-1"
                    data-testid="user-menu-logout"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Guest: Login + Register */
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className={`text-[13px] font-medium transition-colors px-3 py-2 ${
                  isTransparent
                    ? 'text-white/80 hover:text-white'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
                data-testid="nav-login"
              >
                {t('nav.login')}
              </Link>
              <Link
                href="/auth/register"
                className={`text-[13px] font-semibold px-5 py-2.5 rounded-full transition-colors ${
                  isTransparent
                    ? 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                }`}
                data-testid="nav-register"
              >
                {t('nav.signup')}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Right Side: Utilities + Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          {/* Cart - visible for all roles */}
          <CartIcon isMobile />

          {/* Mobile Menu Button */}
          <button
            type="button"
            className={`p-2 -mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-sm transition-colors touch-manipulation ${
              isTransparent
                ? 'text-white hover:bg-white/10'
                : 'text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200'
            }`}
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-neutral-200/60 bg-white shadow-lg" data-testid="mobile-menu">
          <div className="max-w-6xl mx-auto px-4 py-2">
            {/* Mobile Search - Pass HEADER-SEARCH-01 */}
            <div className="py-2">
              <HeaderSearch isMobile />
            </div>

            {/* Primary Navigation */}
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

            {/* Auth Section - Pass FIX-HOMEPAGE-HYDRATION-01: Gate until hydrated */}
            <div className="border-t border-neutral-200 mt-2 pt-2">
              {!showAuthUI ? (
                /* Loading placeholder for mobile */
                <div className="flex items-center justify-center min-h-[48px] py-3">
                  <div className="w-24 h-6 bg-neutral-100 rounded animate-pulse" aria-hidden="true" />
                </div>
              ) : isAuthenticated ? (
                <>
                  {/* Role-specific links */}
                  {!isProducer && !isAdmin && (
                    <Link
                      href="/account/orders"
                      className="flex items-center min-h-[48px] py-3 text-base font-medium text-neutral-700 hover:text-primary active:bg-primary-pale -mx-4 px-4 transition-colors touch-manipulation"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-nav-orders"
                    >
                      {t('nav.myOrders')}
                    </Link>
                  )}
                  {isProducer && (
                    <>
                      <Link
                        href="/producer/dashboard"
                        className="flex items-center min-h-[48px] py-3 text-base font-medium text-neutral-700 hover:text-primary active:bg-primary-pale -mx-4 px-4 transition-colors touch-manipulation"
                        onClick={() => setMobileMenuOpen(false)}
                        data-testid="mobile-nav-dashboard"
                      >
                        {t('producer.dashboard')}
                      </Link>
                      <Link
                        href="/producer/orders"
                        className="flex items-center min-h-[48px] py-3 text-base font-medium text-neutral-700 hover:text-primary active:bg-primary-pale -mx-4 px-4 transition-colors touch-manipulation"
                        onClick={() => setMobileMenuOpen(false)}
                        data-testid="mobile-nav-producer-orders"
                      >
                        {t('producer.orders')}
                      </Link>
                    </>
                  )}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center min-h-[48px] py-3 text-base font-medium text-neutral-700 hover:text-primary active:bg-primary-pale -mx-4 px-4 transition-colors touch-manipulation"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-nav-admin"
                    >
                      {t('admin.dashboard')}
                    </Link>
                  )}

                  {/* User Section */}
                  <div
                    className="flex items-center justify-between min-h-[48px] py-3 -mx-4 px-4 border-t border-neutral-100 mt-2"
                    data-testid="mobile-user-section"
                  >
                    <span className="text-base text-neutral-500">{user?.name}</span>
                    <button
                      onClick={handleLogout}
                      className="text-base font-medium text-neutral-700 hover:text-primary transition-colors"
                      data-testid="mobile-logout-btn"
                    >
                      {t('nav.logout')}
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
                    {t('nav.login')}
                  </Link>
                  <Link
                    href="/auth/register"
                    className="flex items-center justify-center min-h-[48px] py-3 text-base font-medium bg-primary hover:bg-primary-light text-white rounded-md mx-0 my-2 transition-colors touch-manipulation"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="mobile-nav-register"
                  >
                    {t('nav.signup')}
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
