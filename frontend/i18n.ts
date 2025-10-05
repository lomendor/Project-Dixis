export const locales = ['el', 'en'] as const;
export const defaultLocale = 'el';
export type Locale = (typeof locales)[number];
