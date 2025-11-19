export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const iOSUA = /iP(hone|od|ad)/.test(ua);
  const iPadOS13 = navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1;
  return iOSUA || iPadOS13;
}

let last = 0;
export function safeRefresh(router: { refresh: () => void }, cooldownMs = 1200) {
  const now = Date.now();
  if (now - last < cooldownMs) return;
  last = now;
  try { router.refresh(); } catch {}
}

export function safeRefreshMobileAware(router: { refresh: () => void }) {
  // TEMP hotfix: ποτέ refresh σε iOS (μέχρι να εντοπίσουμε οριστικά την αιτία)
  if (isIOS()) return;
  safeRefresh(router, 1200);
}
