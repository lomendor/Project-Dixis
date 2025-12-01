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
        // Brand colors
        brand: {
          DEFAULT: 'hsl(var(--brand-primary))',
          foreground: 'hsl(var(--brand-primary-foreground))'
        },
        // Dixis Brand Palette (from Gemini mockup)
        dixis: {
          green: '#163A30',      // Deep Cypress Green (primary brand color)
          light: '#2C5E50',      // Lighter green (hover state)
          gold: '#C5A065',       // Premium gold accents
          paper: '#FDFBF7',      // Warm paper background
          text: '#2D2D2D',       // Primary text
          muted: '#666666',      // Secondary text
          border: '#E5E5E5',     // Border color
        },
        // Primary - Cyprus Green (agricultural, trust, freshness)
        primary: {
          DEFAULT: '#0f5c2e',
          light: '#1a7a3e',
          pale: '#e8f5ed',
          foreground: '#ffffff'
        },
        // Accent - Warm tones
        accent: {
          gold: '#c9a227',
          beige: '#f5f0e6',
          cream: '#faf8f3'
        },
        // Neutrals
        neutral: {
          0: '#ffffff',
          50: '#f8f9fa',
          100: '#f1f3f5',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#6b7280',
          700: '#495057',
          800: '#343a40',
          900: '#1a1a1a'
        },
        // Semantic colors
        success: { DEFAULT: '#10b981', light: '#d1fae5' },
        warning: { DEFAULT: '#f59e0b', light: '#fef3c7' },
        info: { DEFAULT: '#0ea5e9', light: '#e0f2fe' },
        danger: { DEFAULT: '#ef4444', light: '#fee2e2' },
        // Category pastel backgrounds (Wolt-style)
        category: {
          vegetables: '#e8f5ed',
          fruits: '#fef3c7',
          dairy: '#e0f2fe',
          meat: '#fee2e2',
          bakery: '#f5f0e6',
          honey: '#fef9c3',
          wine: '#fce7f3',
          olive: '#ecfccb'
        }
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0,0,0,0.05)',
        'md': '0 4px 12px rgba(0,0,0,0.08)',
        'lg': '0 8px 24px rgba(0,0,0,0.12)',
        'glow': '0 0 20px rgba(15,92,46,0.15)',
        'card': '0 2px 8px rgba(0,0,0,0.06), 0 8px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.1), 0 12px 24px rgba(0,0,0,0.08)',
        // Dixis shadows (from Gemini mockup)
        'dixis-card': '0 2px 4px rgba(0,0,0,0.08)',
        'dixis-hover': '0 4px 12px rgba(0,0,0,0.15)',
        'dixis-nav': '0 2px 8px rgba(0,0,0,0.1)',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px'
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem'
      },
      fontFamily: {
        heading: ['var(--font-playfair)', 'serif'],
        body: ['var(--font-manrope)', 'sans-serif'],
      },
      fontSize: {
        'display': ['3rem', { lineHeight: '1.1', fontWeight: '700' }],
        'heading': ['2rem', { lineHeight: '1.2', fontWeight: '600' }],
        'subheading': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }]
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      }
    },
  },
  plugins: [],
};

export default config;
