import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import ToastContainer from "@/components/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import SkipLink from "@/components/SkipLink";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import IOSGuard from './IOSGuard';
import Analytics from '@/components/Analytics';

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
    default: "Dixis | Φρέσκα τοπικά προϊόντα από Έλληνες παραγωγούς",
    template: "%s | Dixis"
  },
  description: "Ανακαλύψτε φρέσκα τοπικά προϊόντα απευθείας από Έλληνες παραγωγούς. Βιολογικά λαχανικά, μέλι, ελαιόλαδο, τυριά και πολλά ακόμα — από το χωράφι στο τραπέζι σας.",
  keywords: [
    "τοπικοί παραγωγοί",
    "φρέσκα προϊόντα",
    "βιολογικά τρόφιμα",
    "ελληνικά προϊόντα",
    "ελληνικό μέλι",
    "ελαιόλαδο",
    "αγορά παραγωγών",
    "από το χωράφι στο τραπέζι",
    "local producers Greece",
    "Greek organic food"
  ],
  authors: [{ name: "Dixis", url: siteUrl }],
  creator: "Dixis",
  publisher: "Dixis",
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
    title: 'Dixis | Φρέσκα τοπικά προϊόντα από Έλληνες παραγωγούς',
    description: 'Ανακαλύψτε φρέσκα τοπικά προϊόντα απευθείας από Έλληνες παραγωγούς. Από το χωράφι στο τραπέζι σας.',
    images: [
      {
        url: `${siteUrl}/hero-lcp.png`,
        width: 1200,
        height: 630,
        alt: 'Dixis - Φρέσκα τοπικά προϊόντα από Έλληνες παραγωγούς',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dixis | Φρέσκα τοπικά προϊόντα από Έλληνες παραγωγούς',
    description: 'Ανακαλύψτε φρέσκα τοπικά προϊόντα απευθείας από Έλληνες παραγωγούς.',
    images: [`${siteUrl}/hero-lcp.png`],
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
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
        {/* Privacy-friendly analytics (only loads if NEXT_PUBLIC_ANALYTICS_PROVIDER is set) */}
        <Analytics />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Dixis',
              description: 'Ηλεκτρονική αγορά τοπικών Ελλήνων παραγωγών',
              url: siteUrl,
              inLanguage: 'el',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${siteUrl}/products?search={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
              publisher: {
                '@type': 'Organization',
                name: 'Dixis',
                url: siteUrl,
                logo: {
                  '@type': 'ImageObject',
                  url: `${siteUrl}/logo.svg`,
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
              name: 'Dixis',
              url: siteUrl,
              logo: `${siteUrl}/logo.svg`,
              description: 'Ηλεκτρονική αγορά τοπικών Ελλήνων παραγωγών — φρέσκα προϊόντα από το χωράφι στο τραπέζι σας',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'GR',
              },
            }),
          }}
        />

        {/* Skip to main content link for screen readers */}
        <SkipLink />
        <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
          <LocaleProvider>
            <ToastProvider>
              <AuthProvider>
                <Header />
                <div className="max-w-6xl mx-auto px-4 py-8">
                  <main data-testid="page-root">
                    {children}
                  </main>
                </div>
                <Footer />
                <ToastContainer />
              </AuthProvider>
            </ToastProvider>
          </LocaleProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
