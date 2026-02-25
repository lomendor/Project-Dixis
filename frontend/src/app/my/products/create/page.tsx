import { redirect } from 'next/navigation';

/** Legacy redirect: /my/products/create → /producer/products/create (route cleanup) */
export default function Page() { redirect('/producer/products/create'); }
