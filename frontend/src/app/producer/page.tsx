import { redirect } from 'next/navigation';

/**
 * Pass PRODUCER-DASH-FIX-01: Redirect /producer → /producer/dashboard
 * Previously this was a 404 since no index page existed.
 */
export default function ProducerIndexPage() {
  redirect('/producer/dashboard');
}
