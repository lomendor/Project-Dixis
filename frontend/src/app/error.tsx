'use client';
export default function Error({ error }: { error: Error & { digest?: string } }){
  return (
    <main>
      <h1 className="text-2xl font-bold text-red-600">Κάτι πήγε στραβά</h1>
      <p className="text-sm text-neutral-600 mt-2">Δοκιμάστε ξανά σε λίγο.</p>
    </main>
  );
}
