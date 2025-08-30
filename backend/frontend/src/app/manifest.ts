import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Project Dixis - Local Producer Marketplace',
    short_name: 'Dixis',
    description: 'Connect with local producers and discover fresh, quality products in your area',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#16a34a',
    orientation: 'portrait',
    categories: ['food', 'shopping', 'lifestyle'],
    lang: 'el-GR',
    dir: 'ltr',
    scope: '/',
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Browse Products',
        short_name: 'Products',
        description: 'Browse fresh products from local producers',
        url: '/',
        icons: [
          {
            src: '/icons/products-96x96.png',
            sizes: '96x96',
            type: 'image/png',
          },
        ],
      },
      {
        name: 'Login',
        short_name: 'Login',
        description: 'Access your account',
        url: '/auth/login',
        icons: [
          {
            src: '/icons/login-96x96.png',
            sizes: '96x96',
            type: 'image/png',
          },
        ],
      },
    ],
    screenshots: [
      {
        src: '/screenshots/desktop-homepage.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Homepage showing fresh products from local producers',
      },
      {
        src: '/screenshots/mobile-products.png',
        sizes: '375x812',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Mobile view of product listings',
      },
    ],
  };
}