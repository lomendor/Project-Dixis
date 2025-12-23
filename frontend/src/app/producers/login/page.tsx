import { redirect } from 'next/navigation';

/**
 * Producer Login Redirect
 * Redirects /producers/login to /auth/login with role=producer
 * Fixes: Footer link /producers/login was causing 404
 */
export default function ProducerLoginPage() {
  redirect('/auth/login?role=producer');
}
