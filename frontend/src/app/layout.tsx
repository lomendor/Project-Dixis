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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dixis.gr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Dixis - Τοπικά Προϊόντα από Έλληνες Παραγωγούς",
    template: "%s | Dixis"
  },
  description: "Ανακαλύψτε φρέσκα τοπικά προϊόντα από Έλληνες παραγωγούς. Υποστηρίξτε τους τοπικούς αγρότες και απολαύστε ποιοτικά βιολογικά προϊόντα.",
  icons: {
    icon: [
      { url: '/logo-mark-64.png', sizes: '64x64', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
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
    siteName: 'Dixis',
    title: 'Dixis - Τοπικά Προϊόντα από Έλληνες Παραγωγούς',
    description: 'Ανακαλύψτε φρέσκα τοπικά προϊόντα από Έλληνες παραγωγούς. Υποστηρίξτε τους τοπικούς αγρότες.',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Dixis - Τοπικά Προϊόντα',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@dixis_gr',
    creator: '@dixis_gr',
    title: 'Dixis - Τοπικά Προϊόντα από Έλληνες Παραγωγούς',
    description: 'Ανακαλύψτε φρέσκα τοπικά προϊόντα από Έλληνες παραγωγούς.',
    images: [`${siteUrl}/og-image.png`],
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
              name: 'Dixis',
              description: 'Τοπική αγορά που συνδέει Έλληνες παραγωγούς με καταναλωτές',
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
                name: 'Dixis',
                url: siteUrl,
                logo: {
                  '@type': 'ImageObject',
                  url: `${siteUrl}/images/logo.png`,
                  width: 512,
                  height: 512,
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
              name: 'Dixis',
              url: siteUrl,
              logo: `${siteUrl}/images/logo.png`,
              description: 'Τοπική αγορά που συνδέει Έλληνες παραγωγούς με καταναλωτές',
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
