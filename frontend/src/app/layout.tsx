import type { Metadata } from "next";
import { Inter, Geist_Mono, Noto_Serif_Display, Nunito } from "next/font/google";
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

// T3-03: Inter has full Greek subset support (Geist only has latin)
const inter = Inter({
  variable: "--font-geist-sans",  // Keep same CSS var for zero Tailwind breakage
  subsets: ["latin", "greek", "greek-ext"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Premium serif display font — for hero H1s and section headings
// Full Greek character support for Greek marketplace
const notoSerifDisplay = Noto_Serif_Display({
  variable: "--font-display",
  subsets: ["latin", "greek"],
  weight: ["400", "600", "700"],
  display: "swap",
});

// Rounded geometric sans — matches Dixis logo wordmark
const nunito = Nunito({
  variable: "--font-logo",
  subsets: ["latin", "greek"],
  weight: ["900"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dixis.gr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Dixis | Αυθεντικά Ελληνικά Προϊόντα απευθείας από παραγωγούς",
    template: "%s | Dixis"
  },
  description: "Ανακαλύψτε αυθεντικά ελληνικά προϊόντα απευθείας από Έλληνες παραγωγούς. Ελαιόλαδο, μέλι, βότανα, όσπρια και χειροποίητα προϊόντα — από τον παραγωγό στην πόρτα σας.",
  keywords: [
    "τοπικοί παραγωγοί",
    "αυθεντικά ελληνικά προϊόντα",
    "ελαιόλαδο, μέλι",
    "ελληνικά προϊόντα",
    "ελληνικό μέλι",
    "ελαιόλαδο",
    "αγορά παραγωγών",
    "από τον παραγωγό στην πόρτα σας",
    "local producers Greece",
    "Greek artisan products"
  ],
  authors: [{ name: "Dixis", url: siteUrl }],
  creator: "Dixis",
  publisher: "Dixis",
  category: "Food & Artisan Products",
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
    title: 'Dixis | Αυθεντικά Ελληνικά Προϊόντα απευθείας από παραγωγούς',
    description: 'Ανακαλύψτε αυθεντικά ελληνικά προϊόντα απευθείας από Έλληνες παραγωγούς. Από τον παραγωγό στην πόρτα σας.',
    images: [{
      url: `${siteUrl}/og-image.jpg`,
      width: 1200,
      height: 630,
      alt: 'Dixis — Φρέσκα τοπικά προϊόντα από Έλληνες παραγωγούς',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dixis | Αυθεντικά Ελληνικά Προϊόντα απευθείας από παραγωγούς',
    description: 'Ανακαλύψτε αυθεντικά ελληνικά προϊόντα απευθείας από Έλληνες παραγωγούς.',
    images: [`${siteUrl}/og-image.jpg`],
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
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
        className={`${inter.variable} ${geistMono.variable} ${notoSerifDisplay.variable} ${nunito.variable} antialiased`}
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
              name: 'Dixis',
              url: siteUrl,
              logo: `${siteUrl}/logo.png`,
              description: 'Ηλεκτρονική αγορά αυθεντικών ελληνικών προϊόντων — απευθείας από Έλληνες παραγωγούς στην πόρτα σας',
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
                <main id="main-content" data-testid="page-root">
                  {children}
                </main>
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
