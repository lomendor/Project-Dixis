'use client';

import { useState } from 'react';
import { useErrorBoundaryTest } from '@/components/ErrorBoundary';
import { useAnalytics } from '@/lib/analytics';
import { usePageAnalytics } from '@/hooks/usePageAnalytics';

export default function TestErrorPage() {
  const { getEvents, clearEvents, exportEvents } = useAnalytics();
  const [events, setEvents] = useState<any[]>([]);
  const [showEvents, setShowEvents] = useState(false);

  // Track page view
  usePageAnalytics('Test Error Boundary - Analytics Demo');

  const [shouldThrowError, setShouldThrowError] = useState(false);
  
  const handleTriggerError = () => {
    setShouldThrowError(true);
  };
  
  // Component that throws error on render
  const TriggerErrorComponent = (): null => {
    if (shouldThrowError) {
      throw new Error('This is a test error to demonstrate the Error Boundary functionality!');
    }
    return null;
  };

  const handleShowEvents = () => {
    const currentEvents = getEvents();
    setEvents(currentEvents);
    setShowEvents(!showEvents);
  };

  const handleClearEvents = () => {
    clearEvents();
    setEvents([]);
    // Keep events panel open to show empty state
    setShowEvents(true);
  };

  const handleDownloadEvents = () => {
    const eventsJson = exportEvents();
    const blob = new Blob([eventsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dixis-analytics-events-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Component that will trigger an error when rendered
  const ErrorComponent = () => {
    throw new Error('React component error for testing ErrorBoundary!');
  };

  const [showErrorComponent, setShowErrorComponent] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Analytics & Error Boundary Testing
          </h1>
          <p className="text-gray-600">
            This page demonstrates the analytics tracking and error boundary functionality.
          </p>
        </div>

        {/* Error Boundary Testing */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🚨 Error Boundary Testing
          </h2>
          <p className="text-gray-600 mb-4">
            Test the error boundary functionality by triggering errors in different ways:
          </p>
          
          <div className="space-y-4">
            <button
              onClick={handleTriggerError}
              className="block w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Trigger JavaScript Error
            </button>
            
            <button
              onClick={() => setShowErrorComponent(!showErrorComponent)}
              className="block w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {showErrorComponent ? 'Hide' : 'Show'} React Component Error
            </button>
          </div>

          {/* This will trigger error boundary if shouldThrowError is true */}
          <TriggerErrorComponent />
          
          {/* This will trigger error boundary if showErrorComponent is true */}
          {showErrorComponent && <ErrorComponent />}

          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> When you trigger an error, the Error Boundary will catch it and display a user-friendly error page. 
              The error will also be logged to analytics and forwarded to error monitoring services.
            </p>
          </div>
        </div>

        {/* Analytics Testing */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📊 Analytics Event Tracking
          </h2>
          <p className="text-gray-600 mb-4">
            View and manage the analytics events that have been tracked during your session:
          </p>
          
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={handleShowEvents}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              data-testid="events-count"
            >
              {showEvents ? 'Hide Events' : 'Show Events'} ({getEvents().length})
            </button>
            
            <button
              onClick={handleDownloadEvents}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Download Events JSON
            </button>
            
            <button
              onClick={handleClearEvents}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Clear Events
            </button>
          </div>

          {showEvents && (
            <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-auto">
              <h3 className="font-medium text-gray-900 mb-2">Analytics Events:</h3>
              {events.length === 0 ? (
                <p className="text-gray-500 text-sm">No events recorded yet. Navigate around the site to generate events.</p>
              ) : (
                <div className="space-y-2">
                  {events.map((event, index) => (
                    <div key={index} className="border-l-4 border-blue-400 pl-3 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-blue-700">
                          {event.event}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Page: {event.page}
                      </div>
                      {event.data && (
                        <details className="mt-1">
                          <summary className="text-xs text-gray-500 cursor-pointer">
                            Event Data
                          </summary>
                          <pre className="text-xs text-gray-600 mt-1 bg-white p-2 rounded border">
                            {JSON.stringify(event.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            🧪 Testing Instructions
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>Analytics Events:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Navigate to different pages to see <code>page_view</code> events</li>
              <li>Go to a product page and add items to cart to see <code>add_to_cart</code> events</li>
              <li>Start checkout process to see <code>checkout_start</code> events</li>
              <li>Complete an order to see <code>order_complete</code> events</li>
            </ul>
            
            <p className="mt-3"><strong>Error Boundary:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Click "Trigger JavaScript Error" to test error handling</li>
              <li>Click "Show React Component Error" to test React error catching</li>
              <li>Errors will be logged to console and analytics</li>
              <li>User will see a friendly error page with recovery options</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}