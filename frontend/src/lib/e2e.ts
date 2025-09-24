export function getE2EToken(): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem('test_auth_token'); } catch { return null; }
}
export function isE2E(): boolean {
  // NEXT_PUBLIC_E2E is inlined at build; also allow window flag for safety
  return process.env.NEXT_PUBLIC_E2E === 'true' || (typeof window !== 'undefined' && (window as any).__E2E__ === true);
}