import { redirect } from 'next/navigation';

/** Legacy redirect: /my/products/[id]/edit → /producer/products/[id]/edit (route cleanup) */
export default function Page({ params }: { params: { id: string } }) { redirect(`/producer/products/${params.id}/edit`); }
