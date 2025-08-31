'use client';

// Health Monitor Component - System Health & Performance Monitoring
import { useState, useEffect } from 'react';
import useAnalytics from '@/hooks/useAnalytics';

interface HealthStatus {
  status: 'excellent' | 'good' | 'warning' | 'critical';
  score: number;
  message: string;
}

interface HealthMetric {
  name: string;
  value: number;
  unit: string;
  status: HealthStatus['status'];
  threshold: { good: number; warning: number };
  trend?: 'up' | 'down' | 'stable';
}

export default function HealthMonitor() {
  const [healthData, setHealthData] = useState<{
    overall: HealthStatus;
    metrics: HealthMetric[];
    lastChecked: number;
    uptime: number;
  }>({
    overall: { status: 'good', score: 85, message: 'Σύστημα λειτουργεί κανονικά' },
    metrics: [],
    lastChecked: Date.now(),
    uptime: 99.9,
  });

  const [isMonitoring, setIsMonitoring] = useState(true);
  const { getStoredEvents } = useAnalytics();

  // Calculate health metrics from analytics data
  const calculateHealthMetrics = () => {
    const events = getStoredEvents();
    const recentEvents = events.filter(e => e.timestamp > Date.now() - 3600000); // Last hour
    
    // Performance metrics
    const performanceEvents = recentEvents.filter(e => e.type === 'performance');
    const avgLoadTime = performanceEvents.length > 0 
      ? performanceEvents.reduce((sum, e) => sum + (e.performance?.page_load_time || 0), 0) / performanceEvents.length
      : 0;

    // Error metrics
    const errorEvents = recentEvents.filter(e => e.type === 'error');
    const errorRate = recentEvents.length > 0 ? (errorEvents.length / recentEvents.length) * 100 : 0;

    // API response times (mock data based on performance events)
    const apiResponseTime = performanceEvents.length > 0 
      ? performanceEvents.reduce((sum, e) => sum + ((e.performance?.ttfb || 0) + Math.random() * 100), 0) / performanceEvents.length
      : 150;

    // Memory usage (simulated)
    const memoryUsage = 45 + Math.random() * 20;

    // Traffic metrics
    const currentTraffic = recentEvents.filter(e => e.type === 'page_view').length;

    const metrics: HealthMetric[] = [
      {
        name: 'Χρόνος Φόρτωσης',
        value: avgLoadTime,
        unit: 'ms',
        status: avgLoadTime < 1000 ? 'excellent' : avgLoadTime < 2000 ? 'good' : avgLoadTime < 4000 ? 'warning' : 'critical',
        threshold: { good: 1000, warning: 2000 },
        trend: avgLoadTime < 1500 ? 'down' : avgLoadTime > 2500 ? 'up' : 'stable',
      },
      {
        name: 'Ποσοστό Σφαλμάτων',
        value: errorRate,
        unit: '%',
        status: errorRate < 1 ? 'excellent' : errorRate < 3 ? 'good' : errorRate < 5 ? 'warning' : 'critical',
        threshold: { good: 1, warning: 3 },
        trend: errorRate < 2 ? 'down' : errorRate > 4 ? 'up' : 'stable',
      },
      {
        name: 'API Response',
        value: apiResponseTime,
        unit: 'ms',
        status: apiResponseTime < 100 ? 'excellent' : apiResponseTime < 300 ? 'good' : apiResponseTime < 500 ? 'warning' : 'critical',
        threshold: { good: 100, warning: 300 },
        trend: apiResponseTime < 200 ? 'down' : apiResponseTime > 400 ? 'up' : 'stable',
      },
      {
        name: 'Χρήση Μνήμης',
        value: memoryUsage,
        unit: '%',
        status: memoryUsage < 60 ? 'excellent' : memoryUsage < 80 ? 'good' : memoryUsage < 90 ? 'warning' : 'critical',
        threshold: { good: 60, warning: 80 },
        trend: memoryUsage < 50 ? 'down' : memoryUsage > 75 ? 'up' : 'stable',
      },
      {
        name: 'Κίνηση (1h)',
        value: currentTraffic,
        unit: 'views',
        status: currentTraffic > 100 ? 'excellent' : currentTraffic > 50 ? 'good' : currentTraffic > 10 ? 'warning' : 'critical',
        threshold: { good: 100, warning: 50 },
        trend: currentTraffic > 75 ? 'up' : currentTraffic < 25 ? 'down' : 'stable',
      },
    ];

    // Calculate overall health score
    const overallScore = metrics.reduce((sum, metric) => {
      const scores = { excellent: 100, good: 80, warning: 60, critical: 20 };
      return sum + scores[metric.status];
    }, 0) / metrics.length;

    const overall: HealthStatus = {
      score: Math.round(overallScore),
      status: overallScore >= 90 ? 'excellent' : overallScore >= 75 ? 'good' : overallScore >= 50 ? 'warning' : 'critical',
      message: overallScore >= 90 
        ? 'Σύστημα σε εξαιρετική κατάσταση'
        : overallScore >= 75 
        ? 'Σύστημα λειτουργεί κανονικά'
        : overallScore >= 50 
        ? 'Εντοπίστηκαν θέματα που χρειάζονται προσοχή'
        : 'Κρίσιμα προβλήματα απαιτούν άμεση δράση',
    };

    setHealthData({
      overall,
      metrics,
      lastChecked: Date.now(),
      uptime: 99.9 - (errorRate * 0.1),
    });
  };

  // Auto-update health metrics
  useEffect(() => {
    if (!isMonitoring) return;

    calculateHealthMetrics();
    const interval = setInterval(calculateHealthMetrics, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const getStatusIcon = (status: HealthStatus['status']) => {
    switch (status) {
      case 'excellent':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'good':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'critical':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 17l9.2-9.2M17 17V7H7" />
        </svg>;
      case 'down':
        return <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 7l-9.2 9.2M7 7v10h10" />
        </svg>;
      default:
        return <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14" />
        </svg>;
    }
  };

  const getStatusColor = (status: HealthStatus['status']) => {
    switch (status) {
      case 'excellent': return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 'good': return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      case 'warning': return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
      case 'critical': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            🩺 Παρακολούθηση Υγείας
            {getStatusIcon(healthData.overall.status)}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Τελευταίος έλεγχος: {new Date(healthData.lastChecked).toLocaleTimeString('el-GR')}
          </p>
        </div>

        <button
          onClick={() => setIsMonitoring(!isMonitoring)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            isMonitoring
              ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
          }`}
        >
          {isMonitoring ? '🟢 ΕΝΕΡΓΟ' : '⚫ ΑΝΕΝΕΡΓΟ'}
        </button>
      </div>

      {/* Overall Status */}
      <div className={`rounded-lg p-4 mb-6 border-2 ${getStatusColor(healthData.overall.status)}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {healthData.overall.score}/100
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Συνολική Βαθμολογία
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {healthData.overall.message}
            </p>
          </div>

          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {healthData.uptime.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Διαθεσιμότητα
            </div>
          </div>
        </div>
      </div>

      {/* Health Metrics */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
          Λεπτομερείς Μετρήσεις
        </h4>

        {healthData.metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(metric.status)}
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {metric.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Όριο: {metric.threshold.good}{metric.unit} (καλό) • {metric.threshold.warning}{metric.unit} (προσοχή)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {getTrendIcon(metric.trend)}
              <div className="text-right">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {metric.value.toFixed(metric.unit === 'ms' ? 0 : 1)}{metric.unit}
                </div>
                <div className={`text-xs capitalize ${
                  metric.status === 'excellent' ? 'text-green-600 dark:text-green-400' :
                  metric.status === 'good' ? 'text-blue-600 dark:text-blue-400' :
                  metric.status === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {metric.status === 'excellent' ? 'Εξαιρετικό' :
                   metric.status === 'good' ? 'Καλό' :
                   metric.status === 'warning' ? 'Προσοχή' : 'Κρίσιμο'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Recommendations */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
          Συστάσεις Βελτίωσης
        </h4>

        <div className="space-y-2">
          {healthData.metrics
            .filter(metric => metric.status === 'warning' || metric.status === 'critical')
            .map((metric, index) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                <svg className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>{metric.name}:</strong> {
                    metric.name === 'Χρόνος Φόρτωσης' ? 'Βελτιστοποιήστε images και χρησιμοποιήστε CDN' :
                    metric.name === 'Ποσοστό Σφαλμάτων' ? 'Ελέγξτε logs και διορθώστε bugs' :
                    metric.name === 'API Response' ? 'Βελτιστοποιήστε database queries και caching' :
                    metric.name === 'Χρήση Μνήμης' ? 'Καθαρίστε cache και βελτιστοποιήστε κώδικα' :
                    'Προσθέστε marketing campaigns για αυξημένη κίνηση'
                  }
                </div>
              </div>
            ))}

          {healthData.metrics.every(metric => metric.status === 'excellent' || metric.status === 'good') && (
            <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-green-800 dark:text-green-200">
                Όλες οι μετρήσεις είναι σε καλό επίπεδο! Συνεχίστε την παρακολούθηση.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* System Information */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-gray-900 dark:text-white">
              {healthData.uptime.toFixed(2)}%
            </div>
            <div className="text-gray-500 dark:text-gray-400">Uptime</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-900 dark:text-white">
              {healthData.metrics.filter(m => m.status === 'excellent' || m.status === 'good').length}/{healthData.metrics.length}
            </div>
            <div className="text-gray-500 dark:text-gray-400">Υγιή Metrics</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-900 dark:text-white">
              15s
            </div>
            <div className="text-gray-500 dark:text-gray-400">Ανανέωση</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-900 dark:text-white">
              {isMonitoring ? 'ON' : 'OFF'}
            </div>
            <div className="text-gray-500 dark:text-gray-400">Monitoring</div>
          </div>
        </div>
      </div>
    </div>
  );
}