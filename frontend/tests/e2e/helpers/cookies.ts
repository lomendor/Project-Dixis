import type { BrowserContext } from '@playwright/test';

function baseURL(): string {
  return process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://localhost:3030';
}

export async function setE2EProbeCookie(ctx: BrowserContext) {
  const url = new URL(baseURL());
  await ctx.addCookies([{
    name: 'e2e_auth_probe',
    value: '1',
    url: url.origin + '/',
    httpOnly: false,
    secure: false,
    sameSite: 'Lax',
  }]);
}

export async function clearE2EProbeCookie(ctx: BrowserContext) {
  try { await ctx.clearCookies(); } catch {}
}