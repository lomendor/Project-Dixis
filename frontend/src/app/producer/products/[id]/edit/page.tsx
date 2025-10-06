import { redirect } from 'next/navigation';
export default function Page({ params }: { params: { id: string } }){ redirect(`/my/products/${params.id}/edit`); }
