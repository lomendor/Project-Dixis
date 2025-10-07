import { redirect } from 'next/navigation';

export default function Page({ searchParams }: { searchParams: { id?: string; phone?: string } }) {
  const id = searchParams?.id || '';
  const phone = searchParams?.phone || '';
  redirect(`/orders/track/${encodeURIComponent(id)}?phone=${encodeURIComponent(phone)}`);
}
