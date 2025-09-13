/**
 * Checkout Circuit Breaker & Performance Monitor
 */
interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeoutMs: number;
  monitoringWindowMs: number;
}

interface RequestMetrics {
  requestCount: number;
  failureCount: number;
  avgResponseTime: number;
  lastFailureTime: number;
}

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CheckoutCircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private metrics: RequestMetrics = {
    requestCount: 0,
    failureCount: 0,
    avgResponseTime: 0,
    lastFailureTime: 0
  };
  
  constructor(private config: CircuitBreakerConfig = { failureThreshold: 5, resetTimeoutMs: 30000, monitoringWindowMs: 60000 }) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Υπηρεσία παραγγελίας προσωρινά μη διαθέσιμη');
      }
    }

    const startTime = Date.now();
    this.metrics.requestCount++;

    try {
      const result = await operation();
      this.recordSuccess(Date.now() - startTime);
      
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
        this.resetMetrics();
      }
      
      return result;
    } catch (error) {
      this.recordFailure(Date.now() - startTime);
      throw error;
    }
  }

  private shouldAttemptReset(): boolean {
    return Date.now() - this.metrics.lastFailureTime > this.config.resetTimeoutMs;
  }

  private recordSuccess(duration: number): void {
    this.updateResponseTime(duration);
  }

  private recordFailure(duration: number): void {
    this.metrics.failureCount++;
    this.metrics.lastFailureTime = Date.now();
    this.updateResponseTime(duration);
    
    if (this.metrics.failureCount >= this.config.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  private updateResponseTime(duration: number): void {
    this.metrics.avgResponseTime = 
      (this.metrics.avgResponseTime * (this.metrics.requestCount - 1) + duration) / this.metrics.requestCount;
  }

  private getFailureRate(): number {
    return this.metrics.requestCount > 0 ? this.metrics.failureCount / this.metrics.requestCount : 0;
  }

  private resetMetrics(): void {
    this.metrics = { requestCount: 0, failureCount: 0, avgResponseTime: 0, lastFailureTime: 0 };
  }

  getHealthStatus() {
    return {
      state: this.state,
      failureRate: this.getFailureRate(),
      avgResponseTime: this.metrics.avgResponseTime,
      isHealthy: this.state === 'CLOSED' && this.getFailureRate() < 0.1
    };
  }
}

export const checkoutCircuitBreaker = new CheckoutCircuitBreaker();