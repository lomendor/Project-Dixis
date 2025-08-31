'use client';

// AI Insights Page - Deep Dive Analytics with Business Intelligence
import { useState, useEffect } from 'react';
import useAnalytics from '@/hooks/useAnalytics';
import { insightsGenerator } from '@/lib/analytics/insightsGenerator';
import type { Insight, AnalyticsMetrics } from '@/lib/analytics/insightsGenerator';

interface InsightCategory {
  id: string;
  name: string;
  description: string;
  insights: Insight[];
  priority: number;
}

export default function AIInsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [categories, setCategories] = useState<InsightCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [aiAnalysisDepth, setAiAnalysisDepth] = useState<'basic' | 'detailed' | 'advanced'>('detailed');

  const { getStoredEvents, canTrack, hasConsent, requestConsent } = useAnalytics();

  // Load AI insights and categorize them
  const loadInsights = async () => {
    if (!canTrack) return;

    try {
      setLoading(true);
      const events = getStoredEvents();
      
      // Filter events by selected period
      const now = Date.now();
      const periods = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
        '90d': 90 * 24 * 60 * 60 * 1000,
      };
      
      const cutoffTime = now - periods[selectedPeriod as keyof typeof periods];
      const periodEvents = events.filter(event => event.timestamp >= cutoffTime);

      // Generate insights and metrics
      const [generatedInsights, calculatedMetrics] = await Promise.all([
        insightsGenerator.analyzeEvents(periodEvents),
        Promise.resolve(insightsGenerator.getMetrics(periodEvents)),
      ]);

      setInsights(generatedInsights);
      setMetrics(calculatedMetrics);

      // Categorize insights
      const categorizedInsights = categorizeInsights(generatedInsights);
      setCategories(categorizedInsights);
    } catch (error) {
      console.error('Failed to load AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  // Categorize insights into business categories
  const categorizeInsights = (insights: Insight[]): InsightCategory[] => {
    const categoryMap = new Map<string, Insight[]>();

    insights.forEach(insight => {
      let categoryId = '';
      
      // Business-focused categorization
      if (insight.type === 'opportunity' || insight.title.includes('Ευκαιρία') || insight.title.includes('Καλάθια')) {
        categoryId = 'revenue_optimization';
      } else if (insight.type === 'trend' && (insight.title.includes('Αιχμής') || insight.title.includes('Αναζητήσεις'))) {
        categoryId = 'customer_behavior';
      } else if (insight.type === 'warning' || insight.type === 'anomaly' || insight.title.includes('Σφάλματα') || insight.title.includes('Απόδοση')) {
        categoryId = 'technical_health';
      } else if (insight.title.includes('mobile') || insight.title.includes('Mobile') || insight.title.includes('desktop')) {
        categoryId = 'user_experience';
      } else if (insight.title.includes('Bounce') || insight.title.includes('Δέσμευση') || insight.title.includes('Navigation')) {
        categoryId = 'engagement';
      } else {
        categoryId = 'general_insights';
      }

      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, []);
      }
      categoryMap.get(categoryId)!.push(insight);
    });

    const categories: InsightCategory[] = [
      {
        id: 'revenue_optimization',
        name: 'Βελτιστοποίηση Εσόδων',
        description: 'Ευκαιρίες για αύξηση πωλήσεων και μετατροπών',
        insights: categoryMap.get('revenue_optimization') || [],
        priority: 1,
      },
      {
        id: 'customer_behavior',
        name: 'Συμπεριφορά Πελατών',
        description: 'Πρότυπα και τάσεις στη συμπεριφορά των χρηστών',
        insights: categoryMap.get('customer_behavior') || [],
        priority: 2,
      },
      {
        id: 'user_experience',
        name: 'Εμπειρία Χρήστη',
        description: 'Βελτιώσεις για καλύτερη εμπειρία χρήστη',
        insights: categoryMap.get('user_experience') || [],
        priority: 3,
      },
      {
        id: 'engagement',
        name: 'Δέσμευση Χρηστών',
        description: 'Αναλύσεις για την αλληλεπίδραση των χρηστών',
        insights: categoryMap.get('engagement') || [],
        priority: 4,
      },
      {
        id: 'technical_health',
        name: 'Τεχνική Υγεία',
        description: 'Απόδοση συστήματος και τεχνικά θέματα',
        insights: categoryMap.get('technical_health') || [],
        priority: 5,
      },
      {
        id: 'general_insights',
        name: 'Γενικές Παρατηρήσεις',
        description: 'Άλλες σημαντικές ανακαλύψεις',
        insights: categoryMap.get('general_insights') || [],
        priority: 6,
      },
    ];

    return categories
      .filter(category => category.insights.length > 0)
      .sort((a, b) => a.priority - b.priority);
  };

  // Auto-load insights
  useEffect(() => {
    loadInsights();
  }, [selectedPeriod, aiAnalysisDepth, canTrack]);

  // Business impact calculator
  const calculateBusinessImpact = (insight: Insight): string => {
    const { type, impact, confidence, data } = insight;
    
    if (type === 'opportunity' && impact === 'high' && confidence > 80) {
      // Estimate revenue impact for high-confidence opportunities
      const conversionImprovement = data.abandonment_rate ? `+${(data.abandonment_rate * 0.1).toFixed(1)}%` : '+5-15%';
      return `Εκτιμώμενη αύξηση εσόδων: ${conversionImprovement}`;
    }
    
    if (type === 'warning' && impact === 'high') {
      return 'Άμεση δράση απαιτείται για αποφυγή απώλειας πελατών';
    }
    
    if (type === 'trend' && impact === 'medium') {
      return 'Ευκαιρία για στρατηγικό προγραμματισμό';
    }
    
    return 'Παρακολούθηση και ανάλυση συνιστάται';
  };

  // Consent screen
  if (!hasConsent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            🤖 AI Business Insights
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Αποκτήστε έξυπνες ανακαλύψεις και συστάσεις με τεχνητή νοημοσύνη
          </p>
          <button
            onClick={requestConsent}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Ενεργοποίηση AI Analytics
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                🤖 AI Business Insights
                <span className="text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full font-medium">
                  BETA
                </span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Ανακαλύψτε κρυφές ευκαιρίες και βελτιστοποιήστε την επιχείρησή σας με AI
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Period Selector */}
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="24h">Τελευταίες 24 ώρες</option>
                <option value="7d">Τελευταίες 7 ημέρες</option>
                <option value="30d">Τελευταίες 30 ημέρες</option>
                <option value="90d">Τελευταίες 90 ημέρες</option>
              </select>

              {/* Analysis Depth */}
              <select
                value={aiAnalysisDepth}
                onChange={(e) => setAiAnalysisDepth(e.target.value as any)}
                className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="basic">Βασική Ανάλυση</option>
                <option value="detailed">Λεπτομερής Ανάλυση</option>
                <option value="advanced">Προχωρημένη AI</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={loadInsights}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                Ανανέωση AI
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              Η AI αναλύει τα δεδομένα σας...
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Executive Summary */}
            {metrics && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  📊 Executive Summary
                  <span className="text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded text-blue-600 dark:text-blue-400">
                    {selectedPeriod}
                  </span>
                </h2>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {insights.filter(i => i.type === 'opportunity' && i.impact === 'high').length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Υψηλή Προτεραιότητα Ευκαιρίες</div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {metrics.conversion_rate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Ποσοστό Μετατροπής</div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {insights.filter(i => i.confidence >= 80).length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Υψηλή Εμπιστοσύνη Insights</div>
                  </div>
                </div>
              </div>
            )}

            {/* Insight Categories */}
            {categories.length > 0 ? (
              categories.map(category => (
                <div key={category.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {category.description}
                      </p>
                    </div>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm font-medium">
                      {category.insights.length} insights
                    </span>
                  </div>

                  <div className="space-y-4">
                    {category.insights.map(insight => (
                      <div key={insight.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {insight.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {insight.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs">
                              <span className={`px-2 py-1 rounded-full ${
                                insight.impact === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                                insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                                {insight.impact === 'high' ? 'Υψηλή' : insight.impact === 'medium' ? 'Μέτρια' : 'Χαμηλή'} Επίδραση
                              </span>
                              <span className="text-gray-500 dark:text-gray-400">
                                {insight.confidence}% εμπιστοσύνη
                              </span>
                              <span className="text-gray-500 dark:text-gray-400">
                                {new Date(insight.timestamp).toLocaleDateString('el-GR')}
                              </span>
                            </div>
                          </div>
                          
                          <div className={`w-3 h-3 rounded-full ${
                            insight.impact === 'high' ? 'bg-red-500' :
                            insight.impact === 'medium' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}></div>
                        </div>

                        {/* Business Impact */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-3 mb-3">
                          <div className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                            💼 Business Impact
                          </div>
                          <div className="text-sm text-blue-800 dark:text-blue-300">
                            {calculateBusinessImpact(insight)}
                          </div>
                        </div>

                        {/* Action Items */}
                        {insight.actionable && insight.action && (
                          <div className="flex items-center gap-3">
                            <svg className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              <strong>Προτεινόμενη ενέργεια:</strong> {insight.action}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Δεν υπάρχουν AI insights για την περίοδο {selectedPeriod}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Η AI χρειάζεται περισσότερα δεδομένα για να παράγει έξυπνες ανακαλύψεις. 
                  Περιηγηθείτε στον ιστότοπο ή επιλέξτε μεγαλύτερη χρονική περίοδο.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setSelectedPeriod('30d')}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Δείτε 30 ημέρες
                  </button>
                  <button
                    onClick={loadInsights}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
                  >
                    Ανανέωση
                  </button>
                </div>
              </div>
            )}

            {/* AI Confidence Note */}
            {insights.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Σημείωση AI:</strong> Αυτά τα insights δημιουργήθηκαν αυτόματα από αλγορίθμους μηχανικής μάθησης. 
                    Χρησιμοποιήστε τα ως οδηγό, αλλά πάντα επαληθεύετε με επιπλέον ανάλυση και business context.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}