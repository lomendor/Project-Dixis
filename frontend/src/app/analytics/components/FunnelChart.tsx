'use client';

// Funnel Chart Component - User Journey Visualization
import { useMemo } from 'react';
import type { AnalyticsEvent } from '@/lib/analytics/analyticsEngine';

interface FunnelChartProps {
  events: AnalyticsEvent[];
  timeRange: string;
}

interface FunnelStep {
  name: string;
  count: number;
  percentage: number;
  dropoff?: number;
  color: string;
}

export default function FunnelChart({ events, timeRange }: FunnelChartProps) {
  const funnelData = useMemo(() => {
    // Filter events based on time range
    const now = Date.now();
    const timeRanges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };
    
    const cutoffTime = now - (timeRanges[timeRange as keyof typeof timeRanges] || timeRanges['24h']);
    const recentEvents = events.filter(event => event.timestamp >= cutoffTime);

    // Group events by session to track user journeys
    const sessions = new Map<string, AnalyticsEvent[]>();
    recentEvents.forEach(event => {
      if (!sessions.has(event.session_id)) {
        sessions.set(event.session_id, []);
      }
      sessions.get(event.session_id)!.push(event);
    });

    // Calculate funnel steps
    const totalSessions = sessions.size;
    
    // Step 1: Page Views (Landing)
    const landingSessions = new Set();
    recentEvents.filter(e => e.type === 'page_view').forEach(e => {
      landingSessions.add(e.session_id);
    });

    // Step 2: Product Views
    const productViewSessions = new Set();
    recentEvents.filter(e => 
      e.type === 'page_view' && 
      e.data.path?.includes('/products/')
    ).forEach(e => {
      productViewSessions.add(e.session_id);
    });

    // Step 3: Add to Cart
    const addToCartSessions = new Set();
    recentEvents.filter(e => 
      e.type === 'click' && 
      (e.data.element_id?.includes('add-to-cart') || e.data.element_type === 'add-to-cart')
    ).forEach(e => {
      addToCartSessions.add(e.session_id);
    });

    // Step 4: Checkout Started
    const checkoutSessions = new Set();
    recentEvents.filter(e => 
      e.type === 'page_view' && 
      e.data.path?.includes('/checkout')
    ).forEach(e => {
      checkoutSessions.add(e.session_id);
    });

    // Step 5: Purchase Complete
    const purchaseSessions = new Set();
    recentEvents.filter(e => e.type === 'purchase').forEach(e => {
      purchaseSessions.add(e.session_id);
    });

    const steps: FunnelStep[] = [
      {
        name: 'Επισκέπτες',
        count: landingSessions.size,
        percentage: 100,
        color: 'bg-blue-500',
      },
      {
        name: 'Προβολή Προϊόντων',
        count: productViewSessions.size,
        percentage: totalSessions > 0 ? (productViewSessions.size / landingSessions.size) * 100 : 0,
        dropoff: landingSessions.size - productViewSessions.size,
        color: 'bg-indigo-500',
      },
      {
        name: 'Προσθήκη στο Καλάθι',
        count: addToCartSessions.size,
        percentage: productViewSessions.size > 0 ? (addToCartSessions.size / productViewSessions.size) * 100 : 0,
        dropoff: productViewSessions.size - addToCartSessions.size,
        color: 'bg-purple-500',
      },
      {
        name: 'Έναρξη Παραγγελίας',
        count: checkoutSessions.size,
        percentage: addToCartSessions.size > 0 ? (checkoutSessions.size / addToCartSessions.size) * 100 : 0,
        dropoff: addToCartSessions.size - checkoutSessions.size,
        color: 'bg-pink-500',
      },
      {
        name: 'Ολοκλήρωση Παραγγελίας',
        count: purchaseSessions.size,
        percentage: checkoutSessions.size > 0 ? (purchaseSessions.size / checkoutSessions.size) * 100 : 0,
        dropoff: checkoutSessions.size - purchaseSessions.size,
        color: 'bg-green-500',
      },
    ];

    return steps;
  }, [events, timeRange]);

  const maxWidth = 400; // Maximum width for the top of the funnel

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Χοάνη Μετατροπών
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ανάλυση διαδρομής χρήστη • {timeRange}
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {funnelData.length > 0 ? funnelData[funnelData.length - 1].percentage.toFixed(1) : '0'}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Συνολική Μετατροπή
          </div>
        </div>
      </div>

      {/* Funnel Visualization */}
      <div className="space-y-4">
        {funnelData.map((step, index) => {
          const width = (step.percentage / 100) * maxWidth;
          const isFirst = index === 0;
          const isLast = index === funnelData.length - 1;

          return (
            <div key={step.name} className="relative">
              {/* Step Container */}
              <div className="flex items-center gap-4 mb-2">
                {/* Funnel Bar */}
                <div className="flex-1 relative">
                  <div 
                    className={`h-12 ${step.color} rounded-lg relative overflow-hidden transition-all duration-500 ease-out`}
                    style={{ 
                      width: `${Math.max(width, 60)}px`,
                      maxWidth: '100%',
                    }}
                  >
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10"></div>
                    
                    {/* Step Label */}
                    <div className="absolute inset-0 flex items-center px-4">
                      <span className="text-white font-medium text-sm truncate">
                        {step.name}
                      </span>
                    </div>

                    {/* Count Badge */}
                    <div className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-full px-2 py-1 shadow-sm">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {step.count.toLocaleString('el-GR')}
                      </span>
                    </div>
                  </div>

                  {/* Percentage Label */}
                  <div className="absolute -bottom-6 left-0">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {step.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="w-24 text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {step.count.toLocaleString('el-GR')}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {step.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Dropoff Information */}
              {!isLast && step.dropoff && step.dropoff > 0 && (
                <div className="flex items-center gap-2 ml-4 mb-4">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span className="text-sm text-red-600 dark:text-red-400">
                    Εγκαταλείπουν: {step.dropoff.toLocaleString('el-GR')} χρήστες
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({((step.dropoff / (step.count + step.dropoff)) * 100).toFixed(1)}%)
                  </span>
                </div>
              )}

              {/* Connection Line */}
              {!isLast && (
                <div className="absolute left-8 -bottom-2 w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Insights */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">
          Βασικές Παρατηρήσεις
        </h4>
        
        <div className="space-y-3">
          {funnelData.length > 1 && (
            <>
              {/* Biggest Dropoff */}
              {(() => {
                const dropoffs = funnelData
                  .filter(step => step.dropoff && step.dropoff > 0)
                  .sort((a, b) => (b.dropoff || 0) - (a.dropoff || 0));
                
                if (dropoffs.length > 0) {
                  const biggestDropoff = dropoffs[0];
                  return (
                    <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="p-1 bg-red-100 dark:bg-red-900/50 rounded">
                        <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-red-800 dark:text-red-200">
                          <strong>Μεγαλύτερη εγκατάλειψη:</strong> {biggestDropoff.name}
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {biggestDropoff.dropoff?.toLocaleString('el-GR')} χρήστες εγκαταλείπουν σε αυτό το στάδιο
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Best Performing Step */}
              {(() => {
                const bestStep = funnelData
                  .slice(1) // Skip first step (always 100%)
                  .reduce((best, step) => 
                    step.percentage > best.percentage ? step : best
                  );

                if (bestStep.percentage > 60) {
                  return (
                    <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="p-1 bg-green-100 dark:bg-green-900/50 rounded">
                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          <strong>Καλύτερη απόδοση:</strong> {bestStep.name}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          {bestStep.percentage.toFixed(1)}% ποσοστό μετατροπής
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Overall Performance */}
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="p-1 bg-blue-100 dark:bg-blue-900/50 rounded">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Συνολική απόδοση:</strong> {
                      funnelData.length > 0 && funnelData[funnelData.length - 1].percentage > 5 
                        ? 'Καλή μετατροπή' 
                        : funnelData[funnelData.length - 1].percentage > 2 
                        ? 'Μέτρια μετατροπή' 
                        : 'Χρειάζεται βελτίωση'
                    }
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {funnelData.length > 0 ? funnelData[funnelData.length - 1].percentage.toFixed(1) : '0'}% των επισκεπτών ολοκληρώνουν παραγγελία
                  </p>
                </div>
              </div>
            </>
          )}

          {funnelData.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p>Δεν υπάρχουν αρκετά δεδομένα για την περίοδο {timeRange}</p>
              <p className="text-sm mt-1">Περιηγηθείτε στον ιστότοπο για να δημιουργήσετε δεδομένα</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}