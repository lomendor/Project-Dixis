'use client';

import { useRouter } from 'next/navigation';

/**
 * Producer Onboarding — Coming Soon
 *
 * Previously showed a form that posted to a mock API (always userId=1,
 * no DB write). Users thought they registered but nothing was saved.
 *
 * Now shows an honest "coming soon" message with contact info.
 * When the backend registration flow is ready, restore the form
 * and wire to Laravel producer registration API.
 */
export default function ProducerOnboardingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2" data-testid="page-title">
            Γίνετε Παραγωγός
          </h1>
          <p className="text-gray-600 mb-6">
            Πουλήστε τα προϊόντα σας στην πλατφόρμα Dixis.
          </p>

          <div className="border rounded-lg p-6 mb-6 bg-blue-50 border-blue-200 text-blue-800">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🚧</span>
              <div>
                <h3 className="font-semibold text-lg">Σύντομα διαθέσιμο</h3>
                <p className="mt-1">
                  Η ηλεκτρονική εγγραφή παραγωγών ετοιμάζεται.
                  Στείλτε μας email στο{' '}
                  <a
                    href="mailto:info@dixis.gr"
                    className="font-medium underline hover:text-blue-900"
                  >
                    info@dixis.gr
                  </a>{' '}
                  και θα επικοινωνήσουμε μαζί σας.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href="mailto:info@dixis.gr?subject=Ενδιαφέρον για εγγραφή παραγωγού"
              className="block w-full text-center bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
              data-testid="contact-btn"
            >
              Επικοινωνία μέσω Email
            </a>
            <button
              onClick={() => router.push('/producers')}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              data-testid="browse-producers-btn"
            >
              Δείτε τους Παραγωγούς μας
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
