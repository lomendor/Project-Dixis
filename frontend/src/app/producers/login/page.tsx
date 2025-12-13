import Link from 'next/link';

export const metadata = {
  title: 'Σύνδεση Παραγωγών | Dixis',
  description: 'Σύνδεση για παραγωγούς στην πλατφόρμα Dixis',
};

export default function ProducerLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center text-neutral-900 mb-6">
          Σύνδεση Παραγωγών
        </h1>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            Η ξεχωριστή σελίδα σύνδεσης για παραγωγούς είναι υπό κατασκευή.
          </p>
        </div>

        <p className="text-center text-neutral-600 mb-6">
          Μπορείτε να συνδεθείτε από τη γενική σελίδα σύνδεσης επιλέγοντας &quot;Παραγωγός&quot;.
        </p>

        <Link
          href="/auth/login"
          className="block w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-lg text-center transition-colors"
        >
          Μετάβαση στη Σύνδεση
        </Link>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            ← Επιστροφή στην Αρχική
          </Link>
        </div>
      </div>
    </div>
  );
}
