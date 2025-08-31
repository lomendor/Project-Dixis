// AI-Powered Insights Generator
// Intelligent analytics insights with Greek localization

import type { AnalyticsEvent } from './analyticsEngine';

export interface Insight {
  id: string;
  type: 'trend' | 'anomaly' | 'opportunity' | 'warning' | 'recommendation';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number; // 0-100
  data: Record<string, any>;
  timestamp: number;
  actionable: boolean;
  action?: string;
}

export interface UserJourney {
  session_id: string;
  user_id?: number;
  events: AnalyticsEvent[];
  start_time: number;
  end_time: number;
  duration: number;
  page_count: number;
  conversion: boolean;
  bounce: boolean;
  device_type: string;
}

export interface AnalyticsMetrics {
  total_sessions: number;
  total_page_views: number;
  unique_users: number;
  bounce_rate: number;
  avg_session_duration: number;
  conversion_rate: number;
  popular_products: Array<{ product_id: number; views: number; conversions: number }>;
  search_terms: Array<{ query: string; count: number; results: number }>;
  error_rate: number;
  performance_score: number;
}

class InsightsGenerator {
  private events: AnalyticsEvent[] = [];
  private insights: Insight[] = [];

  public analyzeEvents(events: AnalyticsEvent[]): Insight[] {
    this.events = events;
    this.insights = [];

    // Generate various types of insights
    this.generateTrendInsights();
    this.generateAnomalyInsights();
    this.generateOpportunityInsights();
    this.generatePerformanceInsights();
    this.generateUserBehaviorInsights();

    // Sort by impact and confidence
    return this.insights.sort((a, b) => {
      const impactWeight = { high: 3, medium: 2, low: 1 };
      const aScore = impactWeight[a.impact] * a.confidence;
      const bScore = impactWeight[b.impact] * b.confidence;
      return bScore - aScore;
    });
  }

  private generateTrendInsights(): void {
    const pageViews = this.events.filter(e => e.type === 'page_view');
    const searches = this.events.filter(e => e.type === 'search');
    const purchases = this.events.filter(e => e.type === 'purchase');

    // Page view trends
    if (pageViews.length > 10) {
      const hourlyData = this.groupByHour(pageViews);
      const peakHour = this.findPeakHour(hourlyData);
      
      this.insights.push({
        id: `trend_peak_hours_${Date.now()}`,
        type: 'trend',
        title: 'Ώρες Αιχμής Επισκέψεων',
        description: `Η μεγαλύτερη κίνηση παρατηρείται στις ${peakHour}:00. Εξετάστε την προγραμματισμένη δημοσίευση περιεχομένου.`,
        impact: 'medium',
        confidence: 85,
        data: { peak_hour: peakHour, hourly_data: hourlyData },
        timestamp: Date.now(),
        actionable: true,
        action: 'Προγραμματίστε προωθητικές ενέργειες κατά τις ώρες αιχμής',
      });
    }

    // Search trends
    if (searches.length > 5) {
      const searchTerms = this.analyzeSearchTerms(searches);
      const topTerm = searchTerms[0];

      this.insights.push({
        id: `trend_search_terms_${Date.now()}`,
        type: 'trend',
        title: 'Δημοφιλείς Αναζητήσεις',
        description: `Ο όρος "${topTerm.query}" αναζητήθηκε ${topTerm.count} φορές. Δημιουργήστε περιεχόμενο για αυτό το θέμα.`,
        impact: 'high',
        confidence: 90,
        data: { search_terms: searchTerms },
        timestamp: Date.now(),
        actionable: true,
        action: 'Δημιουργήστε νέα προϊόντα ή κατηγορίες για δημοφιλείς αναζητήσεις',
      });
    }
  }

  private generateAnomalyInsights(): void {
    const recentEvents = this.events.filter(e => e.timestamp > Date.now() - 3600000); // Last hour
    const errors = recentEvents.filter(e => e.type === 'error');

    // Error rate anomaly
    if (errors.length > 0) {
      const errorRate = (errors.length / recentEvents.length) * 100;
      
      if (errorRate > 5) { // More than 5% error rate
        this.insights.push({
          id: `anomaly_error_rate_${Date.now()}`,
          type: 'anomaly',
          title: 'Αυξημένα Σφάλματα',
          description: `Παρατηρήθηκε ${errorRate.toFixed(1)}% ποσοστό σφαλμάτων την τελευταία ώρα. Απαιτείται άμεση προσοχή.`,
          impact: 'high',
          confidence: 95,
          data: { error_rate: errorRate, error_count: errors.length },
          timestamp: Date.now(),
          actionable: true,
          action: 'Ελέγξτε τα server logs και την κατάσταση της υπηρεσίας',
        });
      }
    }

    // Performance anomaly
    const performanceEvents = recentEvents.filter(e => e.type === 'performance');
    const slowLoads = performanceEvents.filter(e => 
      e.performance?.page_load_time && e.performance.page_load_time > 3000
    );

    if (slowLoads.length > performanceEvents.length * 0.3) {
      this.insights.push({
        id: `anomaly_performance_${Date.now()}`,
        type: 'anomaly',
        title: 'Αργή Φόρτωση Σελίδων',
        description: `${((slowLoads.length / performanceEvents.length) * 100).toFixed(1)}% των σελίδων φορτώνουν αργά (>3s).`,
        impact: 'medium',
        confidence: 80,
        data: { slow_loads: slowLoads.length, total_loads: performanceEvents.length },
        timestamp: Date.now(),
        actionable: true,
        action: 'Βελτιστοποιήστε την ταχύτητα του site με image compression και caching',
      });
    }
  }

  private generateOpportunityInsights(): void {
    const journeys = this.reconstructUserJourneys();
    const abandonedCarts = journeys.filter(j => 
      j.events.some(e => e.data.element_id === 'add-to-cart') && 
      !j.events.some(e => e.type === 'purchase')
    );

    if (abandonedCarts.length > 0) {
      const abandonmentRate = (abandonedCarts.length / journeys.length) * 100;
      
      this.insights.push({
        id: `opportunity_abandoned_carts_${Date.now()}`,
        type: 'opportunity',
        title: 'Εγκαταλελειμμένα Καλάθια',
        description: `${abandonmentRate.toFixed(1)}% των χρηστών προσθέτουν προϊόντα στο καλάθι αλλά δεν ολοκληρώνουν την παραγγελία.`,
        impact: 'high',
        confidence: 85,
        data: { 
          abandoned_count: abandonedCarts.length, 
          abandonment_rate: abandonmentRate,
          common_exit_points: this.findCommonExitPoints(abandonedCarts)
        },
        timestamp: Date.now(),
        actionable: true,
        action: 'Υλοποιήστε email remarketing και βελτιώστε το checkout process',
      });
    }

    // Mobile vs Desktop opportunities
    const mobileEvents = this.events.filter(e => e.context.device_type === 'mobile');
    const desktopEvents = this.events.filter(e => e.context.device_type === 'desktop');
    
    if (mobileEvents.length > 0 && desktopEvents.length > 0) {
      const mobileConversions = mobileEvents.filter(e => e.type === 'purchase').length;
      const desktopConversions = desktopEvents.filter(e => e.type === 'purchase').length;
      
      const mobileConversionRate = (mobileConversions / mobileEvents.length) * 100;
      const desktopConversionRate = (desktopConversions / desktopEvents.length) * 100;
      
      if (desktopConversionRate > mobileConversionRate * 1.5) {
        this.insights.push({
          id: `opportunity_mobile_optimization_${Date.now()}`,
          type: 'opportunity',
          title: 'Βελτιστοποίηση Mobile',
          description: `Το desktop έχει ${(desktopConversionRate / mobileConversionRate).toFixed(1)}x καλύτερη μετατροπή από mobile. Υπάρχει δυνατότητα βελτίωσης.`,
          impact: 'high',
          confidence: 75,
          data: { 
            mobile_conversion: mobileConversionRate,
            desktop_conversion: desktopConversionRate 
          },
          timestamp: Date.now(),
          actionable: true,
          action: 'Βελτιστοποιήστε την mobile εμπειρία χρήστη',
        });
      }
    }
  }

  private generatePerformanceInsights(): void {
    const performanceEvents = this.events.filter(e => e.type === 'performance');
    
    if (performanceEvents.length > 0) {
      const avgLoadTime = performanceEvents
        .filter(e => e.performance?.page_load_time)
        .reduce((sum, e) => sum + (e.performance?.page_load_time || 0), 0) / performanceEvents.length;

      let performanceRating: 'excellent' | 'good' | 'needs-improvement' | 'poor';
      let impact: 'low' | 'medium' | 'high';

      if (avgLoadTime < 1000) {
        performanceRating = 'excellent';
        impact = 'low';
      } else if (avgLoadTime < 2000) {
        performanceRating = 'good';
        impact = 'low';
      } else if (avgLoadTime < 4000) {
        performanceRating = 'needs-improvement';
        impact = 'medium';
      } else {
        performanceRating = 'poor';
        impact = 'high';
      }

      const title = {
        excellent: 'Εξαιρετική Απόδοση',
        good: 'Καλή Απόδοση',
        'needs-improvement': 'Απόδοση Προς Βελτίωση',
        poor: 'Κακή Απόδοση'
      }[performanceRating];

      const description = {
        excellent: `Εξαιρετική ταχύτητα φόρτωσης (${avgLoadTime.toFixed(0)}ms). Συνεχίστε τη βελτιστοποίηση!`,
        good: `Καλή ταχύτητα φόρτωσης (${(avgLoadTime/1000).toFixed(1)}s). Μικρές βελτιώσεις θα ενισχύσουν την εμπειρία.`,
        'needs-improvement': `Μέτρια ταχύτητα φόρτωσης (${(avgLoadTime/1000).toFixed(1)}s). Απαιτείται βελτιστοποίηση.`,
        poor: `Αργή ταχύτητα φόρτωσης (${(avgLoadTime/1000).toFixed(1)}s). Άμεση δράση απαραίτητη.`
      }[performanceRating];

      this.insights.push({
        id: `performance_overview_${Date.now()}`,
        type: performanceRating === 'excellent' || performanceRating === 'good' ? 'trend' : 'warning',
        title,
        description,
        impact,
        confidence: 95,
        data: { 
          avg_load_time: avgLoadTime,
          performance_rating: performanceRating,
          sample_size: performanceEvents.length 
        },
        timestamp: Date.now(),
        actionable: performanceRating !== 'excellent',
        action: 'Βελτιστοποιήστε images, χρησιμοποιήστε CDN, και minify resources',
      });
    }
  }

  private generateUserBehaviorInsights(): void {
    const journeys = this.reconstructUserJourneys();
    const avgPagesPerSession = journeys.reduce((sum, j) => sum + j.page_count, 0) / journeys.length;
    const bounceRate = (journeys.filter(j => j.bounce).length / journeys.length) * 100;

    // Bounce rate insight
    if (bounceRate > 60) {
      this.insights.push({
        id: `behavior_bounce_rate_${Date.now()}`,
        type: 'warning',
        title: 'Υψηλό Bounce Rate',
        description: `${bounceRate.toFixed(1)}% των επισκεπτών φεύγουν χωρίς να δουν άλλες σελίδες. Βελτιώστε το περιεχόμενο.`,
        impact: 'high',
        confidence: 90,
        data: { bounce_rate: bounceRate, avg_pages: avgPagesPerSession },
        timestamp: Date.now(),
        actionable: true,
        action: 'Βελτιώστε την πρώτη εντύπωση και προσθέστε related content',
      });
    } else if (bounceRate < 30) {
      this.insights.push({
        id: `behavior_engagement_${Date.now()}`,
        type: 'trend',
        title: 'Εξαιρετική Δέσμευση',
        description: `Χαμηλό bounce rate ${bounceRate.toFixed(1)}% και ${avgPagesPerSession.toFixed(1)} σελίδες ανά session. Οι επισκέπτες εμπλέκονται!`,
        impact: 'low',
        confidence: 85,
        data: { bounce_rate: bounceRate, avg_pages: avgPagesPerSession },
        timestamp: Date.now(),
        actionable: false,
      });
    }

    // Popular content paths
    const popularPaths = this.findPopularNavigationPaths(journeys);
    if (popularPaths.length > 0) {
      this.insights.push({
        id: `behavior_popular_paths_${Date.now()}`,
        type: 'opportunity',
        title: 'Δημοφιλή Navigation Patterns',
        description: `Οι χρήστες ακολουθούν συγκεκριμένα patterns. Βελτιστοποιήστε αυτές τις διαδρομές.`,
        impact: 'medium',
        confidence: 75,
        data: { popular_paths: popularPaths },
        timestamp: Date.now(),
        actionable: true,
        action: 'Βελτιστοποιήστε την navigation για τα δημοφιλή paths',
      });
    }
  }

  // Helper methods
  private groupByHour(events: AnalyticsEvent[]): Record<number, number> {
    const hourly: Record<number, number> = {};
    
    events.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourly[hour] = (hourly[hour] || 0) + 1;
    });
    
    return hourly;
  }

  private findPeakHour(hourlyData: Record<number, number>): number {
    let peakHour = 0;
    let maxViews = 0;
    
    Object.entries(hourlyData).forEach(([hour, views]) => {
      if (views > maxViews) {
        maxViews = views;
        peakHour = parseInt(hour);
      }
    });
    
    return peakHour;
  }

  private analyzeSearchTerms(searches: AnalyticsEvent[]): Array<{ query: string; count: number; results: number }> {
    const terms = new Map<string, { count: number; totalResults: number }>();
    
    searches.forEach(search => {
      const query = search.data.query?.toLowerCase() || '';
      const results = search.data.results_count || 0;
      
      if (!terms.has(query)) {
        terms.set(query, { count: 0, totalResults: 0 });
      }
      
      const term = terms.get(query)!;
      term.count++;
      term.totalResults += results;
    });
    
    return Array.from(terms.entries())
      .map(([query, data]) => ({
        query,
        count: data.count,
        results: Math.round(data.totalResults / data.count),
      }))
      .sort((a, b) => b.count - a.count);
  }

  private reconstructUserJourneys(): UserJourney[] {
    const sessions = new Map<string, AnalyticsEvent[]>();
    
    // Group events by session
    this.events.forEach(event => {
      const sessionId = event.session_id;
      if (!sessions.has(sessionId)) {
        sessions.set(sessionId, []);
      }
      sessions.get(sessionId)!.push(event);
    });
    
    // Convert to journey objects
    return Array.from(sessions.entries()).map(([sessionId, events]) => {
      const sortedEvents = events.sort((a, b) => a.timestamp - b.timestamp);
      const startTime = sortedEvents[0].timestamp;
      const endTime = sortedEvents[sortedEvents.length - 1].timestamp;
      const pageViews = sortedEvents.filter(e => e.type === 'page_view');
      const hasPurchase = sortedEvents.some(e => e.type === 'purchase');
      
      return {
        session_id: sessionId,
        user_id: sortedEvents[0].user_id,
        events: sortedEvents,
        start_time: startTime,
        end_time: endTime,
        duration: endTime - startTime,
        page_count: pageViews.length,
        conversion: hasPurchase,
        bounce: pageViews.length === 1,
        device_type: sortedEvents[0].context.device_type,
      };
    });
  }

  private findCommonExitPoints(abandonedJourneys: UserJourney[]): Array<{ page: string; count: number }> {
    const exitPoints = new Map<string, number>();
    
    abandonedJourneys.forEach(journey => {
      const lastPageView = journey.events
        .filter(e => e.type === 'page_view')
        .pop();
      
      if (lastPageView?.data.path) {
        const path = lastPageView.data.path;
        exitPoints.set(path, (exitPoints.get(path) || 0) + 1);
      }
    });
    
    return Array.from(exitPoints.entries())
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private findPopularNavigationPaths(journeys: UserJourney[]): Array<{ path: string[]; count: number }> {
    const pathCounts = new Map<string, number>();
    
    journeys.forEach(journey => {
      const pages = journey.events
        .filter(e => e.type === 'page_view')
        .map(e => e.data.path)
        .slice(0, 5); // First 5 pages only
      
      if (pages.length >= 2) {
        const pathKey = pages.join(' -> ');
        pathCounts.set(pathKey, (pathCounts.get(pathKey) || 0) + 1);
      }
    });
    
    return Array.from(pathCounts.entries())
      .map(([pathKey, count]) => ({
        path: pathKey.split(' -> '),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  // Public API
  public getMetrics(events: AnalyticsEvent[]): AnalyticsMetrics {
    const journeys = this.reconstructUserJourneys();
    const pageViews = events.filter(e => e.type === 'page_view');
    const purchases = events.filter(e => e.type === 'purchase');
    const errors = events.filter(e => e.type === 'error');
    const performanceEvents = events.filter(e => e.type === 'performance');
    
    const uniqueUsers = new Set(events.filter(e => e.user_id).map(e => e.user_id)).size;
    const totalSessions = journeys.length;
    const bounceRate = (journeys.filter(j => j.bounce).length / totalSessions) * 100;
    const avgSessionDuration = journeys.reduce((sum, j) => sum + j.duration, 0) / totalSessions;
    const conversionRate = (purchases.length / totalSessions) * 100;
    const errorRate = (errors.length / events.length) * 100;
    
    const avgPerformance = performanceEvents
      .filter(e => e.performance?.page_load_time)
      .reduce((sum, e) => sum + (e.performance?.page_load_time || 0), 0) / performanceEvents.length;
    
    const performanceScore = Math.max(0, 100 - Math.floor(avgPerformance / 100));
    
    return {
      total_sessions: totalSessions,
      total_page_views: pageViews.length,
      unique_users: uniqueUsers,
      bounce_rate: bounceRate,
      avg_session_duration: avgSessionDuration,
      conversion_rate: conversionRate,
      popular_products: this.getPopularProducts(events),
      search_terms: this.analyzeSearchTerms(events.filter(e => e.type === 'search')),
      error_rate: errorRate,
      performance_score: performanceScore,
    };
  }

  private getPopularProducts(events: AnalyticsEvent[]): Array<{ product_id: number; views: number; conversions: number }> {
    const productStats = new Map<number, { views: number; conversions: number }>();
    
    events.forEach(event => {
      if (event.data.product_id) {
        const productId = event.data.product_id;
        if (!productStats.has(productId)) {
          productStats.set(productId, { views: 0, conversions: 0 });
        }
        
        const stats = productStats.get(productId)!;
        if (event.type === 'page_view' && event.data.path?.includes('/products/')) {
          stats.views++;
        }
        if (event.type === 'purchase') {
          stats.conversions++;
        }
      }
    });
    
    return Array.from(productStats.entries())
      .map(([product_id, stats]) => ({ product_id, ...stats }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }
}

// Export singleton instance
export const insightsGenerator = new InsightsGenerator();
export default insightsGenerator;