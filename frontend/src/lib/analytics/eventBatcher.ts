// Event Batcher - Optimized Analytics Event Processing
// Handles batching, deduplication, and intelligent queuing

import type { AnalyticsEvent } from './analyticsEngine';

export interface BatchConfig {
  maxBatchSize: number;
  flushInterval: number;
  maxRetries: number;
  retryDelay: number;
  enableDeduplication: boolean;
  enableCompression: boolean;
}

export interface EventBatch {
  id: string;
  events: AnalyticsEvent[];
  timestamp: number;
  attempts: number;
  size: number;
}

class EventBatcher {
  private config: BatchConfig;
  private queue: AnalyticsEvent[] = [];
  private failedBatches: EventBatch[] = [];
  private flushTimer?: NodeJS.Timeout;
  private retryTimer?: NodeJS.Timeout;
  private isProcessing = false;

  constructor(config?: Partial<BatchConfig>) {
    this.config = {
      maxBatchSize: 50,
      flushInterval: 15000, // 15 seconds
      maxRetries: 3,
      retryDelay: 5000, // 5 seconds
      enableDeduplication: true,
      enableCompression: false,
      ...config,
    };

    this.startFlushTimer();
    this.startRetryTimer();
  }

  public addEvent(event: AnalyticsEvent): void {
    // Deduplicate events if enabled
    if (this.config.enableDeduplication && this.isDuplicate(event)) {
      return;
    }

    this.queue.push(event);

    // Flush immediately if batch is full
    if (this.queue.length >= this.config.maxBatchSize) {
      this.flush();
    }
  }

  public addEvents(events: AnalyticsEvent[]): void {
    events.forEach(event => this.addEvent(event));
  }

  private isDuplicate(newEvent: AnalyticsEvent): boolean {
    const recent = this.queue.slice(-10); // Check last 10 events
    
    return recent.some(event => {
      // Same type and very recent (within 1 second)
      const timeDiff = newEvent.timestamp - event.timestamp;
      if (timeDiff > 1000) return false;

      // Same event type and user action
      if (newEvent.type !== event.type) return false;

      // For clicks, check if same element
      if (newEvent.type === 'click' && event.type === 'click') {
        return newEvent.data.element_id === event.data.element_id;
      }

      // For page views, check if same path
      if (newEvent.type === 'page_view' && event.type === 'page_view') {
        return newEvent.data.path === event.data.path;
      }

      return false;
    });
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      if (this.queue.length > 0) {
        this.flush();
      }
    }, this.config.flushInterval);
  }

  private startRetryTimer(): void {
    this.retryTimer = setInterval(() => {
      this.retryFailedBatches();
    }, this.config.retryDelay);
  }

  public async flush(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const eventsToProcess = [...this.queue];
    this.queue = [];

    const batch = this.createBatch(eventsToProcess);

    try {
      await this.processBatch(batch);
    } catch (error) {
      console.warn('Batch processing failed:', error);
      this.handleFailedBatch(batch);
    } finally {
      this.isProcessing = false;
    }
  }

  private createBatch(events: AnalyticsEvent[]): EventBatch {
    const batch: EventBatch = {
      id: `batch_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      events: this.optimizeEvents(events),
      timestamp: Date.now(),
      attempts: 0,
      size: this.calculateBatchSize(events),
    };

    return batch;
  }

  private optimizeEvents(events: AnalyticsEvent[]): AnalyticsEvent[] {
    // Group similar events
    const grouped = this.groupSimilarEvents(events);
    
    // Sort by priority (errors first, then purchases, then page views)
    return grouped.sort((a, b) => {
      const priority = { error: 0, purchase: 1, page_view: 2, click: 3, search: 4, user_action: 5, performance: 6 };
      return (priority[a.type] || 10) - (priority[b.type] || 10);
    });
  }

  private groupSimilarEvents(events: AnalyticsEvent[]): AnalyticsEvent[] {
    const groups = new Map<string, AnalyticsEvent[]>();

    events.forEach(event => {
      let key = event.type;
      
      // Create more specific keys for grouping
      if (event.type === 'click') {
        key = `click_${event.data.element_type || 'unknown'}`;
      } else if (event.type === 'page_view') {
        key = `page_view_${event.data.path || 'unknown'}`;
      }

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(event);
    });

    // For some event types, we can aggregate multiple similar events
    const optimizedEvents: AnalyticsEvent[] = [];

    groups.forEach((eventGroup, key) => {
      if (key.startsWith('click_') && eventGroup.length > 1) {
        // Aggregate multiple clicks on same element
        const firstEvent = eventGroup[0];
        optimizedEvents.push({
          ...firstEvent,
          type: 'click' as const,
          data: {
            ...firstEvent.data,
            click_count: eventGroup.length,
            timestamps: eventGroup.map(e => e.timestamp),
          },
        });
      } else {
        // Add all events individually
        optimizedEvents.push(...eventGroup);
      }
    });

    return optimizedEvents;
  }

  private calculateBatchSize(events: AnalyticsEvent[]): number {
    return JSON.stringify(events).length;
  }

  private async processBatch(batch: EventBatch): Promise<void> {
    batch.attempts++;

    // Send to local storage first as backup
    this.storeLocally(batch);

    // Send to API endpoint
    await this.sendToAPI(batch);

    // Optional: Send to external analytics services
    await this.sendToExternalServices(batch);
  }

  private storeLocally(batch: EventBatch): void {
    if (typeof window === 'undefined') return;

    try {
      const key = `dixis_batch_${batch.id}`;
      const batchData = {
        ...batch,
        stored_at: Date.now(),
      };

      localStorage.setItem(key, JSON.stringify(batchData));

      // Clean up old batches (keep only last 10)
      this.cleanupLocalStorage();
    } catch (error) {
      console.warn('Failed to store batch locally:', error);
    }
  }

  private cleanupLocalStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('dixis_batch_'));
      
      if (keys.length > 10) {
        // Sort by timestamp and remove oldest
        const batches = keys.map(key => {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          return { key, timestamp: data.stored_at || 0 };
        }).sort((a, b) => b.timestamp - a.timestamp);

        // Remove oldest batches
        batches.slice(10).forEach(batch => {
          localStorage.removeItem(batch.key);
        });
      }
    } catch (error) {
      console.warn('Failed to cleanup local storage:', error);
    }
  }

  private async sendToAPI(batch: EventBatch): Promise<void> {
    const apiEndpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || '/api/v1/analytics/events';

    const payload = {
      batch_id: batch.id,
      events: batch.events,
      metadata: {
        batch_size: batch.size,
        event_count: batch.events.length,
        timestamp: batch.timestamp,
        attempt: batch.attempts,
      },
    };

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    // Log successful batch
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Batch ${batch.id} sent successfully: ${batch.events.length} events`);
    }
  }

  private async sendToExternalServices(batch: EventBatch): Promise<void> {
    // Placeholder for external analytics services
    // Google Analytics, Mixpanel, PostHog, etc.
    
    try {
      // Example: Google Analytics 4 integration
      if (typeof window !== 'undefined' && (window as any).gtag) {
        batch.events.forEach(event => {
          this.sendToGoogleAnalytics(event);
        });
      }
    } catch (error) {
      console.warn('Failed to send to external services:', error);
    }
  }

  private sendToGoogleAnalytics(event: AnalyticsEvent): void {
    if (typeof window === 'undefined' || !(window as any).gtag) return;

    const gtag = (window as any).gtag;
    const eventMap: Record<string, string> = {
      page_view: 'page_view',
      click: 'select_content',
      search: 'search',
      purchase: 'purchase',
      error: 'exception',
    };

    const eventName = eventMap[event.type] || 'custom_event';
    
    gtag('event', eventName, {
      event_category: event.type,
      event_label: event.data.path || event.data.element_id,
      value: event.data.value,
      custom_parameters: event.data,
    });
  }

  private handleFailedBatch(batch: EventBatch): void {
    if (batch.attempts < this.config.maxRetries) {
      this.failedBatches.push(batch);
    } else {
      console.warn(`Batch ${batch.id} failed after ${this.config.maxRetries} attempts`);
      
      // Store failed batch for manual inspection
      if (typeof window !== 'undefined') {
        const failedKey = `dixis_failed_batch_${batch.id}`;
        localStorage.setItem(failedKey, JSON.stringify({
          ...batch,
          failed_at: Date.now(),
        }));
      }
    }
  }

  private async retryFailedBatches(): Promise<void> {
    if (this.failedBatches.length === 0) return;

    const batchesToRetry = [...this.failedBatches];
    this.failedBatches = [];

    for (const batch of batchesToRetry) {
      try {
        await this.processBatch(batch);
      } catch (error) {
        this.handleFailedBatch(batch);
      }
    }
  }

  // Public API
  public getQueueSize(): number {
    return this.queue.length;
  }

  public getFailedBatchCount(): number {
    return this.failedBatches.length;
  }

  public getStats() {
    return {
      queue_size: this.queue.length,
      failed_batches: this.failedBatches.length,
      config: this.config,
      is_processing: this.isProcessing,
    };
  }

  public clear(): void {
    this.queue = [];
    this.failedBatches = [];
  }

  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    if (this.retryTimer) {
      clearInterval(this.retryTimer);
    }
    this.flush(); // Final flush
  }
}

// Global batcher instance
export const eventBatcher = new EventBatcher();

export default eventBatcher;