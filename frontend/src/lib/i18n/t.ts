import messages from '../../../messages/el.json';

function dig(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => {
    if (o && typeof o === 'object' && !Array.isArray(o)) {
      return (o as Record<string, unknown>)[k];
    }
    return undefined;
  }, obj);
}

/**
 * Server-safe getTranslations (mirrors LocaleContext's t() for Server Components).
 *
 * Usage:
 *   const t = await getTranslations();
 *   t('nav.home')               // "Αρχική"
 *   t('order.success.body', { id: '42' })  // "Η παραγγελία σας ... #{id}"
 */
export async function getTranslations() {
  return (key: string, params?: Record<string, string | number>): string => {
    const v = dig(messages as unknown as Record<string, unknown>, key);
    if (v === undefined || v === null) return key;
    let result = String(v);
    if (params) {
      Object.entries(params).forEach(([k, val]) => {
        result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(val));
      });
    }
    return result;
  };
}
