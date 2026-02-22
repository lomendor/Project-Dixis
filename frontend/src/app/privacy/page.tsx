import { redirect } from 'next/navigation';

/**
 * Legacy /privacy route — redirects to canonical /legal/privacy.
 * Single source of truth: /legal/privacy/page.tsx
 */
export default function PrivacyRedirect() {
  redirect('/legal/privacy');
}
