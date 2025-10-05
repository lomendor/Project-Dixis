import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  // Default to Greek (el) locale
  const locale = 'el';

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
