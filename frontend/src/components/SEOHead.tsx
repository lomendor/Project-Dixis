'use client';

import Head from 'next/head';
import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  jsonLd?: Record<string, any>;
  noIndex?: boolean;
}

export default function SEOHead({
  title,
  description,
  keywords = [],
  ogImage,
  ogType = 'website',
  canonicalUrl,
  jsonLd,
  noIndex = false,
}: SEOHeadProps): null {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dixis.gr';
  
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = `${title} | Project Dixis`;
    }
    
    // Update meta description
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }
    
    // Update keywords
    if (keywords.length > 0) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', keywords.join(', '));
    }
    
    // Update canonical URL
    if (canonicalUrl) {
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonicalUrl);
    }
    
    // Add robots meta if noIndex
    if (noIndex) {
      let robotsMeta = document.querySelector('meta[name="robots"]');
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.setAttribute('name', 'robots');
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute('content', 'noindex, nofollow');
    }
    
    // OpenGraph tags
    if (title) {
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', title);
    }
    
    if (description) {
      let ogDescription = document.querySelector('meta[property="og:description"]');
      if (!ogDescription) {
        ogDescription = document.createElement('meta');
        ogDescription.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescription);
      }
      ogDescription.setAttribute('content', description);
    }
    
    if (ogImage) {
      let ogImageMeta = document.querySelector('meta[property="og:image"]');
      if (!ogImageMeta) {
        ogImageMeta = document.createElement('meta');
        ogImageMeta.setAttribute('property', 'og:image');
        document.head.appendChild(ogImageMeta);
      }
      ogImageMeta.setAttribute('content', ogImage);
    }
    
    // Add JSON-LD structured data
    if (jsonLd) {
      const existingScript = document.querySelector('script[data-seo-jsonld]');
      if (existingScript) {
        existingScript.remove();
      }
      
      const script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-seo-jsonld', 'true');
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [title, description, keywords, ogImage, ogType, canonicalUrl, jsonLd, noIndex]);
  
  return null; // This component doesn't render anything
}

// Utility functions for common SEO patterns
export const generateProductJsonLd = (product: any, siteUrl: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description || `Fresh ${product.name} from ${product.producer?.name}`,
  image: product.images?.[0]?.url || product.images?.[0]?.image_path,
  offers: {
    '@type': 'Offer',
    price: product.price,
    priceCurrency: 'EUR',
    availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    seller: {
      '@type': 'Organization',
      name: product.producer?.name || 'Local Producer',
    },
  },
  brand: {
    '@type': 'Brand',
    name: product.producer?.name || 'Local Producer',
  },
  category: product.categories?.[0]?.name || 'Fresh Produce',
  url: `${siteUrl}/products/${product.id}`,
});

export const generateBreadcrumbJsonLd = (items: Array<{name: string, url?: string}>, siteUrl: string) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url ? `${siteUrl}${item.url}` : undefined,
  })),
});