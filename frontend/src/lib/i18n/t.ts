import el from './el.json';

export function t(key: string, vars?: Record<string, string | number>): string {
  const raw = (el as any)[key] ?? key;
  if (!vars) return raw;
  return String(raw).replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}
