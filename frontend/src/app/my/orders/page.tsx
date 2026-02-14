import { redirect } from 'next/navigation';

/**
 * Legacy /my/orders route — redirects to the canonical /producer/orders page
 * which has proper AuthGuard + i18n support.
 */
export default function MyOrdersRedirect() {
  redirect('/producer/orders');
}
