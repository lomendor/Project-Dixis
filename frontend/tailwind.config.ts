import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Brand colors - consistent with brand.css */
        brand: {
          DEFAULT: 'var(--brand-primary)',
          light: 'var(--brand-primary-light)',
          dark: 'var(--brand-primary-dark)',
          foreground: 'var(--brand-primary-foreground)'
        },
        /* Primary palette - Cypress Green */
        primary: {
          DEFAULT: '#0f5c2e',
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#0f5c2e',
          800: '#0a4421',
          900: '#052e16',
          foreground: '#ffffff'
        },
        /* Accent palette - Warm Amber */
        accent: {
          DEFAULT: '#f59e0b',
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          foreground: '#1c1917'
        },
        neutral: {
          0:'#ffffff', 50:'#fafafa', 100:'#f5f5f5', 200:'#e5e5e5', 300:'#d4d4d4',
          600:'#525252', 700:'#404040', 800:'#262626', 900:'#171717'
        },
        success: { DEFAULT:'#10b981' },
        warning: { DEFAULT:'#f59e0b' },
        info: { DEFAULT:'#0ea5e9' },
        danger: { DEFAULT:'#ef4444' }
      },
      boxShadow: {
        'surface-sm': '0 1px 1px rgba(0,0,0,.04), 0 2px 4px rgba(0,0,0,.06)',
        'surface-md': '0 2px 2px rgba(0,0,0,.05), 0 6px 12px rgba(0,0,0,.08)',
        'surface-lg': '0 8px 8px rgba(0,0,0,.06), 0 16px 24px rgba(0,0,0,.10)',
        'brand-glow': '0 4px 14px 0 rgba(15, 92, 46, 0.25)',
        'accent-glow': '0 4px 14px 0 rgba(245, 158, 11, 0.25)'
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #0f5c2e 0%, #16a34a 100%)',
        'hero-gradient': 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)'
      }
    },
  },
  plugins: [],
};

export default config;
