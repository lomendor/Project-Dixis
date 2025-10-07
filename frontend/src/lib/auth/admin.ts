// server-only guard (EL-first)
type SessionUser = { id?: string; phone?: string; email?: string; role?: string };

async function currentUser(): Promise<SessionUser | null> {
  // Προσπαθούμε να χρησιμοποιήσουμε υπάρχον session helper (αν υπάρχει)
  try {
    const mod: any = await import('@/lib/auth/session');
    if (typeof mod.currentUser === 'function') return await mod.currentUser();
    if (typeof mod.requireSessionUser === 'function') return await mod.requireSessionUser();
    // Fallback: αν υπάρχει μόνο getSessionPhone
    if (typeof mod.getSessionPhone === 'function') {
      const phone = await mod.getSessionPhone();
      return phone ? { phone, id: phone } : null;
    }
  } catch {}
  return null;
}

function envAdminPhones(): string[] {
  const raw = process.env.ADMIN_PHONES || '';
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

function isAdminByRoleOrPhone(u: SessionUser | null, allow: string[]): boolean {
  if (!u) return false;
  const byRole = (u.role || '').toUpperCase() === 'ADMIN';
  const byPhone = !!u.phone && allow.includes(u.phone);
  return byRole || byPhone;
}

// Χρήση: στις admin σελίδες/API: `await requireAdmin();`
export async function requireAdmin(): Promise<SessionUser | null> {
  const u = await currentUser();
  const allow = envAdminPhones();

  // Αν δεν έχει ρυθμιστεί allowlist, ΜΗΝ μπλοκάρεις (CI/dev συμβατότητα)
  if (allow.length === 0) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[admin] ADMIN_PHONES not set — permissive mode (dev/CI)');
    }
    return u;
  }
  if (!isAdminByRoleOrPhone(u, allow)) {
    throw new Error('forbidden_admin');
  }
  return u;
}

// Optional helper για συνθήκες στα RSC
export async function isAdminRequest(): Promise<boolean> {
  const u = await currentUser();
  const allow = envAdminPhones();
  if (allow.length === 0) return true;
  return isAdminByRoleOrPhone(u, allow);
}
