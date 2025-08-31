'use client';

// Analytics Dashboard - Real-time Analytics with Greek Localization
import { useState, useEffect } from 'react';
import useAnalytics from '@/hooks/useAnalytics';
import LiveMetrics from './components/LiveMetrics';
import FunnelChart from './components/FunnelChart';
import HealthMonitor from './components/HealthMonitor';
import InsightsList from './components/InsightsList';
import type { Insight } from '@/lib/analytics/insightsGenerator';

interface DashboardData {
  metrics: any;
  insights: Insight[];
  isLoading: boolean;
  lastUpdated: number;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<DashboardData>({
    metrics: null,
    insights: [],
    isLoading: true,
    lastUpdated: 0,
  });

  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  const { 
    getMetrics, 
    generateInsights, 
    canTrack, 
    hasConsent, 
    requestConsent,
    getStoredEvents,
    exportData,
  } = useAnalytics();

  // Load dashboard data
  const loadDashboardData = async () => {
    if (!canTrack) return;

    try {
      setData(prev => ({ ...prev, isLoading: true }));

      const [metrics, insights] = await Promise.all([
        getMetrics(),
        generateInsights(),
      ]);

      setData({
        metrics,
        insights,
        isLoading: false,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setData(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    loadDashboardData();

    const interval = setInterval(loadDashboardData, refreshInterval);
    return () => clearInterval(interval);
  }, [canTrack, refreshInterval]);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle consent request
  const handleConsentRequest = () => {
    requestConsent();
    // Reload after consent
    setTimeout(loadDashboardData, 1000);
  };

  // Export functionality
  const handleExport = () => {
    const exportedData = exportData();
    const blob = new Blob([exportedData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dixis-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Consent required screen
  if (!hasConsent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Για να δείτε τα analytics, παρακαλούμε δώστε τη συγκατάθεσή σας για συλλογή δεδομένων.
            </p>
          </div>

          <button
            onClick={handleConsentRequest}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Δώστε Συγκατάθεση
          </button>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Χρησιμοποιούμε τα δεδομένα μόνο για βελτίωση της εμπειρίας σας
          </p>
        </div>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                📊 Analytics Dashboard
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Πραγματικός χρόνος • Τελευταία ενημέρωση: {new Date(data.lastUpdated).toLocaleTimeString('el-GR')}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Time Range Selector */}
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1h">Τελευταία 1 ώρα</option>
                <option value="24h">Τελευταίες 24 ώρες</option>
                <option value="7d">Τελευταίες 7 ημέρες</option>
                <option value="30d">Τελευταίες 30 ημέρες</option>
              </select>

              {/* Refresh Interval */}
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10000}>Ανανέωση κάθε 10s</option>
                <option value={30000}>Ανανέωση κάθε 30s</option>
                <option value={60000}>Ανανέωση κάθε 1min</option>
                <option value={300000}>Ανανέωση κάθε 5min</option>
              </select>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title={darkMode ? 'Φωτεινό θέμα' : 'Σκοτεινό θέμα'}
              >
                {darkMode ? (
                  <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Export Button */}
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                title="Εξαγωγή δεδομένων"
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Εξαγωγή
              </button>

              {/* Refresh Button */}
              <button
                onClick={loadDashboardData}
                disabled={data.isLoading}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                title="Ανανέωση"
              >
                <svg 
                  className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${data.isLoading ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Loading State */}
      {data.isLoading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Φορτώνει δεδομένα...</span>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      {!data.isLoading && data.metrics && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-6">
            {/* Live Metrics */}
            <LiveMetrics metrics={data.metrics} />

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Funnel Chart */}
              <FunnelChart 
                events={getStoredEvents()} 
                timeRange={selectedTimeRange} 
              />
              
              {/* Health Monitor */}
              <HealthMonitor />
            </div>

            {/* Insights */}
            <InsightsList insights={data.insights} />
          </div>
        </main>
      )}

      {/* No Data State */}
      {!data.isLoading && !data.metrics && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Δεν υπάρχουν δεδομένα analytics
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Περιηγηθείτε στον ιστότοπο για να συλλέξουμε δεδομένα analytics.
          </p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Ανανέωση
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <div>
              Dixis Analytics Dashboard • Πραγματικός Χρόνος & AI Insights
            </div>
            <div className="flex items-center gap-4">
              <span>Συνεδρία: {getStoredEvents().length} events</span>
              <span>•</span>
              <span>GDPR Compliant</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}