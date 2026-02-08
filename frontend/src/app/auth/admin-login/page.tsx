import { redirect } from 'next/navigation';

/**
 * Pass AUTH-UNIFY-02: Admin login now uses unified login page
 *
 * Redirects to /auth/login?redirect=/admin
 * All users (consumers, producers, admins) use the same login flow
 */
export default function AdminLoginRedirect() {
  redirect('/auth/login?redirect=/admin');
}
