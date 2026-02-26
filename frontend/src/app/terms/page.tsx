import { redirect } from 'next/navigation';

/**
 * Legacy /terms route — redirects to canonical /legal/terms.
 * Single source of truth: /legal/terms/page.tsx
 */
export default function TermsRedirect() {
  redirect('/legal/terms');
}
