// GDPR-Compliant Privacy Manager
// Handles user consent and data protection

export interface ConsentSettings {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  performance: boolean;
}

export interface PrivacyPreferences {
  hasConsented: boolean;
  consentDate: number;
  settings: ConsentSettings;
  version: string;
  ipHash?: string;
}

export interface DataRetentionConfig {
  analyticsData: number; // days
  sessionData: number; // days
  errorLogs: number; // days
  performanceMetrics: number; // days
}

class PrivacyManager {
  private static readonly STORAGE_KEY = 'dixis_privacy_preferences';
  private static readonly CONSENT_VERSION = '1.0';
  private preferences: PrivacyPreferences | null = null;
  private consentCallbacks: Array<(preferences: PrivacyPreferences) => void> = [];

  private readonly defaultRetention: DataRetentionConfig = {
    analyticsData: 365, // 1 year
    sessionData: 30, // 1 month
    errorLogs: 90, // 3 months
    performanceMetrics: 90, // 3 months
  };

  constructor() {
    this.loadPreferences();
    this.setupConsentExpirationCheck();
  }

  private loadPreferences(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(PrivacyManager.STORAGE_KEY);
      if (stored) {
        this.preferences = JSON.parse(stored);
        
        // Check if consent is still valid (1 year expiry)
        const oneYear = 365 * 24 * 60 * 60 * 1000;
        if (this.preferences && Date.now() - this.preferences.consentDate > oneYear) {
          this.preferences = null;
          localStorage.removeItem(PrivacyManager.STORAGE_KEY);
        }
      }
    } catch (error) {
      console.warn('Failed to load privacy preferences:', error);
    }
  }

  private savePreferences(preferences: PrivacyPreferences): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(PrivacyManager.STORAGE_KEY, JSON.stringify(preferences));
      this.preferences = preferences;
    } catch (error) {
      console.warn('Failed to save privacy preferences:', error);
    }
  }

  private setupConsentExpirationCheck(): void {
    if (typeof window === 'undefined') return;

    // Check consent expiration every hour
    setInterval(() => {
      if (this.preferences && this.isConsentExpired()) {
        this.revokeConsent();
      }
    }, 60 * 60 * 1000);
  }

  // Public API Methods
  public hasConsented(): boolean {
    return this.preferences?.hasConsented || false;
  }

  public getConsentSettings(): ConsentSettings | null {
    return this.preferences?.settings || null;
  }

  public canCollectAnalytics(): boolean {
    return this.preferences?.settings.analytics || false;
  }

  public canCollectPerformance(): boolean {
    return this.preferences?.settings.performance || false;
  }

  public canCollectFunctional(): boolean {
    return this.preferences?.settings.functional || false;
  }

  public canUseMarketing(): boolean {
    return this.preferences?.settings.marketing || false;
  }

  public grantConsent(settings: ConsentSettings): void {
    const preferences: PrivacyPreferences = {
      hasConsented: true,
      consentDate: Date.now(),
      settings,
      version: PrivacyManager.CONSENT_VERSION,
      ipHash: this.generateIPHash(),
    };

    this.savePreferences(preferences);
    this.notifyConsentChange(preferences);
    
    console.log('✅ Privacy consent granted:', settings);
  }

  public revokeConsent(): void {
    if (this.preferences) {
      this.preferences.hasConsented = false;
      this.savePreferences(this.preferences);
    }

    this.clearAllAnalyticsData();
    this.notifyConsentChange(this.preferences);
    
    console.log('🛑 Privacy consent revoked');
  }

  public updateConsentSettings(settings: Partial<ConsentSettings>): void {
    if (!this.preferences) return;

    this.preferences.settings = { ...this.preferences.settings, ...settings };
    this.preferences.consentDate = Date.now(); // Update consent date
    this.savePreferences(this.preferences);
    this.notifyConsentChange(this.preferences);
    
    console.log('🔄 Privacy consent updated:', this.preferences.settings);
  }

  public exportUserData(): string {
    const data = {
      preferences: this.preferences,
      storedAnalytics: this.getStoredAnalyticsData(),
      timestamp: new Date().toISOString(),
    };

    return JSON.stringify(data, null, 2);
  }

  public deleteUserData(): void {
    // Clear all stored data
    this.clearAllAnalyticsData();
    
    // Clear preferences
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PrivacyManager.STORAGE_KEY);
    }
    
    this.preferences = null;
    console.log('🗑️ All user data deleted');
  }

  public getDataRetentionInfo(): DataRetentionConfig {
    return { ...this.defaultRetention };
  }

  public cleanupExpiredData(): void {
    if (typeof window === 'undefined') return;

    const now = Date.now();
    const retention = this.defaultRetention;

    try {
      // Clean up analytics events
      const analyticsKey = 'dixis_analytics_events';
      const stored = localStorage.getItem(analyticsKey);
      
      if (stored) {
        const events = JSON.parse(stored);
        const cutoffTime = now - (retention.analyticsData * 24 * 60 * 60 * 1000);
        
        const validEvents = events.filter((event: any) => 
          event.timestamp > cutoffTime
        );
        
        if (validEvents.length !== events.length) {
          localStorage.setItem(analyticsKey, JSON.stringify(validEvents));
          console.log(`🧹 Cleaned up ${events.length - validEvents.length} expired analytics events`);
        }
      }

      // Clean up batches
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('dixis_batch_')) {
          const batchData = JSON.parse(localStorage.getItem(key) || '{}');
          const batchAge = now - (batchData.stored_at || 0);
          const batchRetention = retention.sessionData * 24 * 60 * 60 * 1000;
          
          if (batchAge > batchRetention) {
            localStorage.removeItem(key);
          }
        }
      });

    } catch (error) {
      console.warn('Failed to cleanup expired data:', error);
    }
  }

  // Event System
  public onConsentChange(callback: (preferences: PrivacyPreferences | null) => void): () => void {
    this.consentCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.consentCallbacks.indexOf(callback);
      if (index > -1) {
        this.consentCallbacks.splice(index, 1);
      }
    };
  }

  private notifyConsentChange(preferences: PrivacyPreferences | null): void {
    this.consentCallbacks.forEach(callback => {
      try {
        callback(preferences);
      } catch (error) {
        console.warn('Error in consent change callback:', error);
      }
    });
  }

  // Helper methods
  private generateIPHash(): string {
    // Generate a simple hash for IP tracking without storing actual IP
    // In production, this should be done server-side
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const language = typeof navigator !== 'undefined' ? navigator.language : '';
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const combined = `${userAgent}-${language}-${timezone}`;
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  private isConsentExpired(): boolean {
    if (!this.preferences) return true;
    
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    return Date.now() - this.preferences.consentDate > oneYear;
  }

  private getStoredAnalyticsData(): any[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem('dixis_analytics_events');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private clearAllAnalyticsData(): void {
    if (typeof window === 'undefined') return;

    // Clear main analytics data
    localStorage.removeItem('dixis_analytics_events');
    
    // Clear all batch data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('dixis_batch_') || key.startsWith('dixis_failed_batch_')) {
        localStorage.removeItem(key);
      }
    });
  }

  // Cookie Banner Helper Methods
  public shouldShowCookieBanner(): boolean {
    return !this.hasConsented();
  }

  public getConsentBannerText(): {
    title: string;
    description: string;
    acceptAll: string;
    acceptSelected: string;
    reject: string;
    settings: string;
  } {
    return {
      title: 'Χρήση Cookies & Προστασία Δεδομένων',
      description: 'Χρησιμοποιούμε cookies για να βελτιώσουμε την εμπειρία σας, να παρέχουμε εξατομικευμένο περιεχόμενο και να αναλύσουμε την κίνηση στον ιστότοπό μας. Μπορείτε να επιλέξετε ποιες κατηγορίες cookies θέλετε να δεχτείτε.',
      acceptAll: 'Αποδοχή Όλων',
      acceptSelected: 'Αποδοχή Επιλεγμένων',
      reject: 'Απόρριψη Όλων',
      settings: 'Ρυθμίσεις Cookie',
    };
  }

  public getCookieCategories(): Array<{
    id: keyof ConsentSettings;
    name: string;
    description: string;
    required: boolean;
    default: boolean;
  }> {
    return [
      {
        id: 'functional',
        name: 'Λειτουργικά Cookies',
        description: 'Απαραίτητα για τη βασική λειτουργία του ιστότοπου (καλάθι αγορών, είσοδος χρήστη).',
        required: true,
        default: true,
      },
      {
        id: 'analytics',
        name: 'Cookies Αναλυτικών',
        description: 'Μας βοηθούν να κατανοήσουμε πως οι επισκέπτες χρησιμοποιούν τον ιστότοπο για βελτιώσεις.',
        required: false,
        default: false,
      },
      {
        id: 'performance',
        name: 'Cookies Απόδοσης',
        description: 'Παρακολουθούν την απόδοση του ιστότοπου για καλύτερη εμπειρία χρήστη.',
        required: false,
        default: false,
      },
      {
        id: 'marketing',
        name: 'Marketing Cookies',
        description: 'Χρησιμοποιούνται για εξατομικευμένες διαφημίσεις και remarketing.',
        required: false,
        default: false,
      },
    ];
  }

  // Static utility methods
  public static getDefaultConsentSettings(): ConsentSettings {
    return {
      functional: true,  // Always required
      analytics: false,
      performance: false,
      marketing: false,
    };
  }

  public static getFullConsentSettings(): ConsentSettings {
    return {
      functional: true,
      analytics: true,
      performance: true,
      marketing: true,
    };
  }
}

// Export singleton instance
export const privacyManager = new PrivacyManager();
export default privacyManager;