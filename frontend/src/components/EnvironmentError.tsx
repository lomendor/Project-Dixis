'use client';

import { validateEnvironment } from '@/env';

export default function EnvironmentError() {
  const validation = validateEnvironment();

  if (validation.isValid) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-red-50 z-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-red-200">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800">
                Configuration Error
              </h3>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-red-700">
              The application is missing required environment configuration:
            </p>
            <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>

          <div className="bg-red-50 border border-red-200 rounded p-4">
            <h4 className="text-sm font-medium text-red-800 mb-2">
              To fix this issue:
            </h4>
            <ol className="text-xs text-red-700 list-decimal list-inside space-y-1">
              <li>Create a <code>.env.local</code> file in your project root</li>
              <li>Add the following environment variables:</li>
            </ol>
            <pre className="mt-2 text-xs bg-red-100 p-2 rounded border text-red-800 font-mono">
{`# Required environment variables
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8001/api/v1
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Optional (for SEO)
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-verification-code
NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION=your-verification-code`}
            </pre>
            <p className="mt-2 text-xs text-red-600">
              Restart the development server after making these changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}