import { redirect } from 'next/navigation';

/** Legacy redirect: /my/products → /producer/products (route cleanup) */
export default function Page() { redirect('/producer/products'); }
