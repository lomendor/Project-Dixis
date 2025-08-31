'use client';

// Insights List Component - AI-Generated Analytics Insights
import { useState } from 'react';
import type { Insight } from '@/lib/analytics/insightsGenerator';

interface InsightsListProps {
  insights: Insight[];
}

interface InsightCardProps {
  insight: Insight;
  onDismiss?: (insightId: string) => void;
  onAction?: (insightId: string) => void;
}

function InsightCard({ insight, onDismiss, onAction }: InsightCardProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'trend':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'anomaly':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'opportunity':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'recommendation':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
    }
  };

  const getInsightColor = (type: Insight['type'], impact: Insight['impact']) => {
    const baseColors = {
      trend: 'blue',
      anomaly: 'red',
      opportunity: 'green',
      warning: 'yellow',
      recommendation: 'purple',
    };

    const intensityMap = {
      low: '50',
      medium: '100',
      high: '200',
    };

    const color = baseColors[type];
    const intensity = intensityMap[impact];

    return {
      bg: `bg-${color}-${intensity} dark:bg-${color}-900/30`,
      border: `border-${color}-200 dark:border-${color}-800`,
      text: `text-${color}-800 dark:text-${color}-200`,
      icon: `text-${color}-600 dark:text-${color}-400`,
      button: `bg-${color}-600 hover:bg-${color}-700 text-white`,
    };
  };

  const getImpactBadge = (impact: Insight['impact']) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
      high: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    };

    const labels = {
      low: 'Χαμηλή',
      medium: 'Μέτρια',
      high: 'Υψηλή',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[impact]}`}>
        {labels[impact]} Επίδραση
      </span>
    );
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.(insight.id);
  };

  const handleAction = () => {
    onAction?.(insight.id);
  };

  if (isDismissed) return null;

  const colors = getInsightColor(insight.type, insight.impact);

  return (
    <div className={`rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-md ${colors.bg} ${colors.border}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 ${colors.icon}`}>
            {getInsightIcon(insight.type)}
          </div>
          
          <div className="flex-1">
            <h3 className={`font-semibold mb-1 ${colors.text}`}>
              {insight.title}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              {getImpactBadge(insight.impact)}
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{insight.confidence}% εμπιστοσύνη</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title={isExpanded ? 'Σύμπτυξη' : 'Επέκταση'}
          >
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <button
            onClick={handleDismiss}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Απόρριψη"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Description */}
      <p className={`text-sm mb-4 ${colors.text}`}>
        {insight.description}
      </p>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Data Details */}
          {Object.keys(insight.data).length > 0 && (
            <div>
              <h4 className={`font-medium text-sm mb-2 ${colors.text}`}>Δεδομένα:</h4>
              <div className="bg-white dark:bg-gray-800 rounded p-3 text-xs font-mono">
                <pre className="whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                  {JSON.stringify(insight.data, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Ανιχνεύθηκε: {new Date(insight.timestamp).toLocaleString('el-GR')}
          </div>
        </div>
      )}

      {/* Action Button */}
      {insight.actionable && insight.action && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleAction}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${colors.button}`}
          >
            💡 {insight.action}
          </button>
        </div>
      )}
    </div>
  );
}

export default function InsightsList({ insights }: InsightsListProps) {
  const [filter, setFilter] = useState<'all' | Insight['type']>('all');
  const [sortBy, setSortBy] = useState<'impact' | 'confidence' | 'timestamp'>('impact');
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set());

  // Filter and sort insights
  const filteredInsights = insights
    .filter(insight => !dismissedInsights.has(insight.id))
    .filter(insight => filter === 'all' || insight.type === filter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'impact':
          const impactWeight = { high: 3, medium: 2, low: 1 };
          const aScore = impactWeight[a.impact] * a.confidence;
          const bScore = impactWeight[b.impact] * b.confidence;
          return bScore - aScore;
        case 'confidence':
          return b.confidence - a.confidence;
        case 'timestamp':
          return b.timestamp - a.timestamp;
        default:
          return 0;
      }
    });

  const handleDismissInsight = (insightId: string) => {
    setDismissedInsights(prev => new Set([...prev, insightId]));
  };

  const handleActionClick = (insightId: string) => {
    const insight = insights.find(i => i.id === insightId);
    if (insight?.action) {
      // In a real app, this would trigger the specific action
      console.log('Action triggered for insight:', insight.title, insight.action);
    }
  };

  const getInsightTypeCount = (type: Insight['type']) => {
    return insights.filter(insight => 
      insight.type === type && !dismissedInsights.has(insight.id)
    ).length;
  };

  const filterOptions = [
    { value: 'all', label: 'Όλα', count: filteredInsights.length },
    { value: 'anomaly', label: 'Ανωμαλίες', count: getInsightTypeCount('anomaly') },
    { value: 'opportunity', label: 'Ευκαιρίες', count: getInsightTypeCount('opportunity') },
    { value: 'trend', label: 'Τάσεις', count: getInsightTypeCount('trend') },
    { value: 'warning', label: 'Προειδοποιήσεις', count: getInsightTypeCount('warning') },
    { value: 'recommendation', label: 'Συστάσεις', count: getInsightTypeCount('recommendation') },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            🤖 AI Insights
            {filteredInsights.length > 0 && (
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 text-sm font-medium px-2 py-1 rounded-full">
                {filteredInsights.length}
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Αυτόματες ανακαλύψεις και συστάσεις από τα δεδομένα σας
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Sort Options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="impact">Σειρά: Επίδραση</option>
            <option value="confidence">Σειρά: Εμπιστοσύνη</option>
            <option value="timestamp">Σειρά: Χρόνος</option>
          </select>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
        {filterOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value as any)}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === option.value
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {option.label}
            {option.count > 0 && (
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                filter === option.value 
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300'
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
              }`}>
                {option.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Insights List */}
      {filteredInsights.length > 0 ? (
        <div className="space-y-4">
          {filteredInsights.map(insight => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onDismiss={handleDismissInsight}
              onAction={handleActionClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {filter === 'all' 
              ? 'Δεν υπάρχουν insights' 
              : `Δεν υπάρχουν ${filterOptions.find(f => f.value === filter)?.label.toLowerCase()}`
            }
          </h4>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {dismissedInsights.size > 0 
              ? 'Όλα τα insights έχουν απορριφθεί ή φιλτραριστεί'
              : 'Περισσότερα δεδομένα χρειάζονται για να δημιουργηθούν insights'
            }
          </p>
          
          {dismissedInsights.size > 0 && (
            <button
              onClick={() => setDismissedInsights(new Set())}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Επαναφορά Απορριφθέντων
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      {filteredInsights.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <span>
            {filteredInsights.length} insight{filteredInsights.length !== 1 ? 's' : ''} 
            {dismissedInsights.size > 0 && ` • ${dismissedInsights.size} απορρίφθηκαν`}
          </span>
          
          <div className="flex items-center gap-4">
            {dismissedInsights.size > 0 && (
              <button
                onClick={() => setDismissedInsights(new Set())}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Επαναφορά όλων
              </button>
            )}
            
            <span className="text-xs">
              Ανανέωση: αυτόματη κάθε 5 λεπτά
            </span>
          </div>
        </div>
      )}
    </div>
  );
}