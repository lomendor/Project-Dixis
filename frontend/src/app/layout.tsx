import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import ToastContainer from "@/components/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import SkipLink from "@/components/SkipLink";
import EnvironmentError from "@/components/EnvironmentError";
import { 
  SITE_URL, 
  DEFAULT_LOCALE,
  GOOGLE_SITE_VERIFICATION,
  FACEBOOK_DOMAIN_VERIFICATION 
} from "@/env";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
  authors: [{ name: "Project Dixis Team", url: SITE_URL }],
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
    locale: DEFAULT_LOCALE,
    url: SITE_URL,
    siteName: 'Project Dixis',
    title: 'Project Dixis - Local Producer Marketplace',
    description: 'Connect with local producers and discover fresh, quality products in your area. Support local farmers and enjoy premium organic produce.',
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Project Dixis - Fresh Local Products',
      },
      {
        url: `${SITE_URL}/og-image-square.jpg`,
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
    images: [`${SITE_URL}/twitter-image.jpg`],
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'el-GR': `${SITE_URL}/el`,
      'en-US': `${SITE_URL}/en`,
    },
  },
  verification: {
    google: GOOGLE_SITE_VERIFICATION,
    other: {
      'facebook-domain-verification': FACEBOOK_DOMAIN_VERIFICATION,
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
    <html lang={DEFAULT_LOCALE}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Project Dixis',
              description: 'Local Producer Marketplace connecting farmers with consumers',
              url: SITE_URL,
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${SITE_URL}/?search={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
              publisher: {
                '@type': 'Organization',
                name: 'Project Dixis',
                url: SITE_URL,
                logo: {
                  '@type': 'ImageObject',
                  url: `${SITE_URL}/logo.png`,
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
              url: SITE_URL,
              logo: `${SITE_URL}/logo.png`,
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
        <EnvironmentError />
        <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
          <LocaleProvider>
            <ToastProvider>
              <AuthProvider>
                {children}
                <ToastContainer />
              </AuthProvider>
            </ToastProvider>
          </LocaleProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
