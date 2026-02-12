import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Dev Check - Project Dixis',
  description: 'Development environment health check',
  robots: { index: false, follow: false }
};

export default async function DevCheckPage() {
  // Block in production — exposes env configuration
  if (process.env.DIXIS_ENV === 'production' || process.env.NODE_ENV === 'production') {
    notFound();
  }
  let healthStatus = 'unknown';
  let healthTimestamp = 'N/A';

  try {
    // Use relative URL to avoid localhost in production bundle
    const response = await fetch('/api/health', {
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    const data = await response.json();
    healthStatus = data.status || 'error';
    healthTimestamp = data.ts ? new Date(data.ts).toISOString() : 'N/A';
  } catch (_error) {
    healthStatus = 'error';
  }

  const envChecks = {
    'Next.js Version': '15.5.0',
    'Node ENV': process.env.NODE_ENV,
    'API Base URL': process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1',
    'E2E Mode': process.env.NEXT_PUBLIC_E2E || 'false',
    'Health Status': healthStatus,
    'Health Timestamp': healthTimestamp,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Development Environment Check</h1>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              healthStatus === 'ok'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {healthStatus === 'ok' ? '✅ Healthy' : '❌ Error'}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">
                Environment Configuration
              </h2>
              <dl className="space-y-2">
                {Object.entries(envChecks).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-600">{key}:</dt>
                    <dd className="text-sm text-gray-900 font-mono">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">
                Quick Actions
              </h2>
              <div className="space-y-2">
                <a
                  href="/api/health"
                  target="_blank"
                  className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                >
                  Test Health Endpoint
                </a>
                <a
                  href="/"
                  className="block w-full text-center bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
                >
                  Return to Home
                </a>
              </div>

              <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This page is for development use only and should not be accessible in production.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}