import messages from '../../../messages/el.json';

function dig(obj: any, path: string) {
  return path.split('.').reduce((o, k) => (o && typeof o === 'object') ? o[k] : undefined, obj);
}

/** Server-safe getTranslations: t(key, fallback?) -> string */
export async function getTranslations() {
  return (key: string, fallback?: string) => {
    const v = dig(messages as any, key);
    return (v === undefined || v === null) ? (fallback ?? key) : String(v);
  };
}
