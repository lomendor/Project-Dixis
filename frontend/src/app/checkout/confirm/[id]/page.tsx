import { prisma } from '@/lib/db/client';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Επιβεβαίωση Παραγγελίας | Dixis'
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ConfirmPage({ params }: Props) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      createdAt: true,
      status: true,
      total: true,
      buyerName: true,
      shippingLine1: true,
      shippingCity: true,
      shippingPostal: true
    }
  });

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Δεν βρέθηκε η παραγγελία
          </h1>
          <Link
            href="/"
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Επιστροφή στην Αρχική
          </Link>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('el-GR', {
      dateStyle: 'long',
      timeStyle: 'short'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ευχαριστούμε!
          </h1>
          <p className="text-lg text-gray-600">
            Η παραγγελία σας καταχωρήθηκε επιτυχώς
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold mb-6">Στοιχεία Παραγγελίας</h2>

          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Αριθμός Παραγγελίας</span>
              <span className="font-mono font-semibold">#{order.id}</span>
            </div>

            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Ημερομηνία</span>
              <span className="font-medium">{formatDate(order.createdAt)}</span>
            </div>

            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Κατάσταση</span>
              <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                {String(order.status || 'PENDING').toUpperCase()}
              </span>
            </div>

            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Σύνολο</span>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(Number(order.total || 0))}
              </span>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold text-gray-900 mb-3">Διεύθυνση Αποστολής</h3>
            <div className="text-gray-700 space-y-1">
              <p className="font-medium">{order.buyerName}</p>
              <p>{order.shippingLine1}</p>
              <p>
                {order.shippingCity} {order.shippingPostal}
              </p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-2">Τι ακολουθεί;</h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Θα λάβετε email επιβεβαίωσης με τις λεπτομέρειες της παραγγελίας</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Η πληρωμή θα γίνει με αντικαταβολή κατά την παράδοση</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Θα ενημερωθείτε για την πρόοδο της παραγγελίας σας</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-block text-center bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Επιστροφή στην Αρχική
          </Link>
          <Link
            href="/products"
            className="inline-block text-center border-2 border-green-600 text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition"
          >
            Συνέχεια Αγορών
          </Link>
        </div>
      </div>
    </div>
  );
}
