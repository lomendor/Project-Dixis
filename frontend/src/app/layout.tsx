import '../styles/skeleton.css';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import ToastContainer from "@/components/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import SkipLink from "@/components/SkipLink";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CartProvider } from '@/store/cart';
import IOSGuard from './IOSGuard';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dixis.io";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Project Dixis - Local Producer Marketplace",
    template: "%s | Project Dixis"
  },
  description: "Connect with local producers and discover fresh, quality products in your area. Support local farmers and enjoy premium organic produce delivered fresh.",
  keywords: [
    "local producers",
    "fresh products", 
    "organic food",
    "Greek marketplace",
    "farm to table",
    "local farmers",
    "organic vegetables",
    "fresh fruits",
    "sustainable agriculture",
    "direct from farm"
  ],
  authors: [{ name: "Project Dixis Team", url: siteUrl }],
  creator: "Project Dixis",
  publisher: "Project Dixis",
  category: "Food & Agriculture",
  classification: "Marketplace",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'el_GR',
    url: siteUrl,
    siteName: 'Project Dixis',
    title: 'Project Dixis - Local Producer Marketplace',
    description: 'Connect with local producers and discover fresh, quality products in your area. Support local farmers and enjoy premium organic produce.',
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Project Dixis - Fresh Local Products',
      },
      {
        url: `${siteUrl}/og-image-square.jpg`,
        width: 1200,
        height: 1200,
        alt: 'Project Dixis Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@projectdixis',
    creator: '@projectdixis',
    title: 'Project Dixis - Local Producer Marketplace',
    description: 'Connect with local producers and discover fresh, quality products in your area.',
    images: [`${siteUrl}/twitter-image.jpg`],
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'el-GR': `${siteUrl}/el`,
      'en-US': `${siteUrl}/en`,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      'facebook-domain-verification': process.env.NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION || '',
    },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="el-GR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <IOSGuard />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Project Dixis',
              description: 'Local Producer Marketplace connecting farmers with consumers',
              url: siteUrl,
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${siteUrl}/?search={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
              publisher: {
                '@type': 'Organization',
                name: 'Project Dixis',
                url: siteUrl,
                logo: {
                  '@type': 'ImageObject',
                  url: `${siteUrl}/logo.png`,
                  width: 400,
                  height: 400,
                },
              },
            }),
          }}
        />
        
        {/* Organization JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Project Dixis',
              url: siteUrl,
              logo: `${siteUrl}/logo.png`,
              description: 'Local Producer Marketplace supporting sustainable agriculture',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'GR',
              },
              sameAs: [
                'https://facebook.com/projectdixis',
                'https://twitter.com/projectdixis',
                'https://instagram.com/projectdixis',
              ],
            }),
          }}
        />

        {/* Skip to main content link for screen readers */}
        <SkipLink />
        <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
          <ToastProvider>
            <AuthProvider>
              <CartProvider>
                <Header />
                <div className="max-w-6xl mx-auto px-4 py-8">
                  <main data-testid="page-root">
                    {children}
                  </main>
                </div>
                <Footer />
              </CartProvider>
              <ToastContainer />
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
