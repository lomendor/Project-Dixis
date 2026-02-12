import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="container mx-auto px-4 py-16 flex flex-col items-center text-center">
      <p className="text-7xl font-bold text-gray-200 select-none">404</p>

      <h1 className="text-2xl font-bold mt-4">Η σελίδα δεν βρέθηκε</h1>

      <p className="text-gray-600 mt-2 max-w-md">
        Η σελίδα που αναζητάτε δεν υπάρχει ή έχει μετακινηθεί.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <Link
          href="/"
          className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition"
        >
          Αρχική σελίδα
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center justify-center border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg transition"
        >
          Δείτε τα προϊόντα
        </Link>
      </div>
    </main>
  );
}
