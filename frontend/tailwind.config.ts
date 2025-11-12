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
        brand: {
          DEFAULT: 'hsl(var(--brand-primary))',
          foreground: 'hsl(var(--brand-primary-foreground))'
        },
        primary: { DEFAULT: '#0f5c2e', foreground: '#ffffff' },  /* cypress green */
        secondary: { DEFAULT: '#0ea5e9', foreground: '#ffffff' },
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
        'surface-lg': '0 8px 8px rgba(0,0,0,.06), 0 16px 24px rgba(0,0,0,.10)'
      },
    },
  },
  plugins: [],
};

export default config;
