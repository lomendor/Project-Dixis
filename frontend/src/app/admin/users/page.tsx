export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/client';
import { requireAdmin, AdminError } from '@/lib/auth/admin';
import Link from 'next/link';

/**
 * Pass FIX-ADMIN-DASHBOARD-418-01: Deterministic date formatter for Server Components.
 * Using toISOString() slice avoids hydration mismatch from locale-dependent formatting.
 */
function formatDateStable(date: Date | string): string {
  const d = new Date(date);
  // Format: YYYY-MM-DD (stable across server/client)
  return d.toISOString().slice(0, 10);
}

interface AdminUser {
  id: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

export default async function AdminUsersPage() {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminError) {
      redirect('/auth/admin-login?from=/admin/users');
    }
    throw e;
  }

  const adminUsers = await prisma.adminUser.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return (
    <main style={{ padding: 16, maxWidth: 960, margin: '0 auto' }} data-testid="admin-users-page">
      <div style={{ marginBottom: 16 }}>
        <Link href="/admin" style={{ color: '#0070f3', textDecoration: 'none' }}>
          &larr; Επιστροφή στο Dashboard
        </Link>
      </div>

      <h1 style={{ marginBottom: 24 }}>Διαχειριστές</h1>

      <section>
        <table style={{ width: '100%', borderCollapse: 'collapse' }} data-testid="admin-users-table">
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
              <th style={{ padding: '12px 8px' }}>Τηλέφωνο</th>
              <th style={{ padding: '12px 8px' }}>Ρόλος</th>
              <th style={{ padding: '12px 8px' }}>Κατάσταση</th>
              <th style={{ padding: '12px 8px' }}>Εγγραφή</th>
            </tr>
          </thead>
          <tbody>
            {adminUsers.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '24px 8px', textAlign: 'center', color: '#6b7280' }}>
                  Δεν υπάρχουν διαχειριστές.
                </td>
              </tr>
            ) : (
              adminUsers.map((user: AdminUser) => (
                <tr
                  key={user.id}
                  style={{ borderBottom: '1px solid #e5e7eb' }}
                  data-testid={`admin-user-row-${user.id}`}
                >
                  <td style={{ padding: '12px 8px' }}>
                    <code style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>
                      {user.phone}
                    </code>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <RoleBadge role={user.role} />
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <StatusBadge isActive={user.isActive} />
                  </td>
                  <td style={{ padding: '12px 8px', color: '#6b7280', fontSize: 14 }}>
                    {formatDateStable(user.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <div style={{ marginTop: 24, padding: 16, backgroundColor: '#f9fafb', borderRadius: 8, fontSize: 14, color: '#6b7280' }}>
        <strong>Σημείωση:</strong> Η διαχείριση διαχειριστών (προσθήκη/αφαίρεση) γίνεται μέσω της βάσης δεδομένων.
      </div>
    </main>
  );
}

function RoleBadge({ role }: { role: string }) {
  const isSuperAdmin = role === 'super_admin';
  return (
    <span
      data-testid={`role-badge-${role}`}
      style={{
        display: 'inline-block',
        padding: '4px 8px',
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 600,
        backgroundColor: isSuperAdmin ? '#fef3c7' : '#dbeafe',
        color: isSuperAdmin ? '#92400e' : '#1e40af',
      }}
    >
      {isSuperAdmin ? 'Super Admin' : 'Admin'}
    </span>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      data-testid={`status-badge-${isActive ? 'active' : 'inactive'}`}
      style={{
        display: 'inline-block',
        padding: '4px 8px',
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 600,
        backgroundColor: isActive ? '#d1fae5' : '#fee2e2',
        color: isActive ? '#065f46' : '#991b1b',
      }}
    >
      {isActive ? 'Ενεργός' : 'Ανενεργός'}
    </span>
  );
}
