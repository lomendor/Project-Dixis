export function isIOS(ua?: string) {
  const s = (ua ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '')).toLowerCase();
  return /iphone|ipad|ipod/.test(s) && /applewebkit/.test(s);
}
