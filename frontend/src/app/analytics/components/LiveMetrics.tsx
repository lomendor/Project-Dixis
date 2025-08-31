'use client';

// Live Metrics Component - Real-time KPI Display
import { useState, useEffect } from 'react';

interface LiveMetricsProps {
  metrics: {
    total_sessions: number;
    total_page_views: number;
    unique_users: number;
    bounce_rate: number;
    avg_session_duration: number;
    conversion_rate: number;
    error_rate: number;
    performance_score: number;
  };
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  format?: 'number' | 'percentage' | 'duration' | 'currency';
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
}

function MetricCard({ title, value, change, format = 'number', icon, color = 'blue' }: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate value changes
  useEffect(() => {
    if (displayValue !== value) {
      setIsAnimating(true);
      const timeout = setTimeout(() => {
        setDisplayValue(value);
        setIsAnimating(false);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [value, displayValue]);

  const formatValue = (val: string | number): string => {
    const numVal = typeof val === 'string' ? parseFloat(val) : val;
    
    switch (format) {
      case 'percentage':
        return `${numVal.toFixed(1)}%`;
      case 'duration':
        const minutes = Math.floor(numVal / 60000);
        const seconds = Math.floor((numVal % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      case 'currency':
        return `€${numVal.toFixed(2)}`;
      case 'number':
      default:
        return numVal.toLocaleString('el-GR');
    }
  };

  const getChangeColor = (change: number): string => {
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  const getChangeIcon = (change: number): React.ReactNode => {
    if (change > 0) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 17l9.2-9.2M17 17V7H7" />
        </svg>
      );
    }
    if (change < 0) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 7l-9.2 9.2M7 7v10h10" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14" />
      </svg>
    );
  };

  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    gray: 'bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${getChangeColor(change)}`}>
            {getChangeIcon(change)}
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {title}
        </h3>
        <p className={`text-2xl font-bold text-gray-900 dark:text-white transition-all duration-300 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
          {formatValue(displayValue)}
        </p>
      </div>
    </div>
  );
}

export default function LiveMetrics({ metrics }: LiveMetricsProps) {
  const [previousMetrics, setPreviousMetrics] = useState(metrics);
  const [animationKey, setAnimationKey] = useState(0);

  // Update previous metrics and trigger animation
  useEffect(() => {
    if (JSON.stringify(metrics) !== JSON.stringify(previousMetrics)) {
      setPreviousMetrics(metrics);
      setAnimationKey(prev => prev + 1);
    }
  }, [metrics, previousMetrics]);

  // Calculate changes (mock data for demo)
  const getChange = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const metricsConfig = [
    {
      title: 'Συνολικές Συνεδρίες',
      value: metrics.total_sessions,
      change: getChange(metrics.total_sessions, previousMetrics.total_sessions),
      format: 'number' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'blue' as const,
    },
    {
      title: 'Προβολές Σελίδων',
      value: metrics.total_page_views,
      change: getChange(metrics.total_page_views, previousMetrics.total_page_views),
      format: 'number' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      color: 'green' as const,
    },
    {
      title: 'Μοναδικοί Χρήστες',
      value: metrics.unique_users,
      change: getChange(metrics.unique_users, previousMetrics.unique_users),
      format: 'number' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'purple' as const,
    },
    {
      title: 'Ποσοστό Εγκατάλειψης',
      value: metrics.bounce_rate,
      change: -getChange(metrics.bounce_rate, previousMetrics.bounce_rate), // Negative because lower is better
      format: 'percentage' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      color: metrics.bounce_rate > 60 ? 'red' as const : metrics.bounce_rate > 40 ? 'yellow' as const : 'green' as const,
    },
    {
      title: 'Μέση Διάρκεια Συνεδρίας',
      value: metrics.avg_session_duration,
      change: getChange(metrics.avg_session_duration, previousMetrics.avg_session_duration),
      format: 'duration' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'blue' as const,
    },
    {
      title: 'Ποσοστό Μετατροπής',
      value: metrics.conversion_rate,
      change: getChange(metrics.conversion_rate, previousMetrics.conversion_rate),
      format: 'percentage' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: 'green' as const,
    },
    {
      title: 'Ποσοστό Σφαλμάτων',
      value: metrics.error_rate,
      change: -getChange(metrics.error_rate, previousMetrics.error_rate), // Negative because lower is better
      format: 'percentage' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: metrics.error_rate > 5 ? 'red' as const : metrics.error_rate > 2 ? 'yellow' as const : 'green' as const,
    },
    {
      title: 'Βαθμολογία Απόδοσης',
      value: metrics.performance_score,
      change: getChange(metrics.performance_score, previousMetrics.performance_score),
      format: 'number' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: metrics.performance_score >= 80 ? 'green' as const : metrics.performance_score >= 60 ? 'yellow' as const : 'red' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Ζωντανά Μετρήματα
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Δείκτες απόδοσης σε πραγματικό χρόνο
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-600 dark:text-green-400 font-medium">
            ΖΩΝΤΑΝΑ
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div 
        key={animationKey}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in"
      >
        {metricsConfig.map((metric, index) => (
          <MetricCard
            key={`${metric.title}-${index}`}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            format={metric.format}
            icon={metric.icon}
            color={metric.color}
          />
        ))}
      </div>

      {/* Summary Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Άμεση Ανάλυση
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Συνολική Κίνηση:</span>
                <span className="font-medium text-gray-900 dark:text-white ml-2">
                  {metrics.performance_score >= 80 ? 'Εξαιρετική' : metrics.performance_score >= 60 ? 'Καλή' : 'Χρειάζεται Βελτίωση'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Δέσμευση:</span>
                <span className="font-medium text-gray-900 dark:text-white ml-2">
                  {metrics.bounce_rate < 40 ? 'Υψηλή' : metrics.bounce_rate < 60 ? 'Μέτρια' : 'Χαμηλή'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Υγεία Συστήματος:</span>
                <span className="font-medium text-gray-900 dark:text-white ml-2">
                  {metrics.error_rate < 2 ? 'Εξαιρετική' : metrics.error_rate < 5 ? 'Καλή' : 'Προσοχή Απαιτείται'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}