/**
 * SEC-DSR-001 Implementation: GDPR Data Subject Rights
 * Implements GDPR compliance for Greek marketplace users
 */

// GDPR Article 15-22 request types
export enum DSRRequestType {
  ACCESS = 'access',           // Article 15 - Right of access
  RECTIFICATION = 'rectification', // Article 16 - Right to rectification
  ERASURE = 'erasure',         // Article 17 - Right to erasure ("right to be forgotten")
  RESTRICTION = 'restriction', // Article 18 - Right to restriction of processing
  PORTABILITY = 'portability', // Article 20 - Right to data portability
  OBJECTION = 'objection'      // Article 21 - Right to object
}

// Request status tracking
export enum DSRRequestStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

// Legal basis for processing (GDPR Article 6)
export enum ProcessingLegalBasis {
  CONSENT = 'consent',           // Article 6(1)(a)
  CONTRACT = 'contract',         // Article 6(1)(b)
  LEGAL_OBLIGATION = 'legal_obligation', // Article 6(1)(c)
  VITAL_INTERESTS = 'vital_interests',   // Article 6(1)(d)
  PUBLIC_TASK = 'public_task',   // Article 6(1)(e)
  LEGITIMATE_INTERESTS = 'legitimate_interests' // Article 6(1)(f)
}

// Data categories for Greek marketplace
export enum DataCategory {
  PERSONAL_IDENTITY = 'personal_identity',     // Name, email, phone
  ADDRESS_DATA = 'address_data',               // Shipping/billing addresses
  PAYMENT_DATA = 'payment_data',               // Payment methods (tokenized)
  ORDER_HISTORY = 'order_history',             // Purchase history
  BEHAVIORAL_DATA = 'behavioral_data',         // Browsing, preferences
  COMMUNICATION_DATA = 'communication_data',   // Messages, support tickets
  PRODUCER_DATA = 'producer_data',             // Producer-specific data
  MARKETING_DATA = 'marketing_data'            // Newsletter, promotions
}

// DSR request interface
interface DSRRequest {
  id: string;
  type: DSRRequestType;
  status: DSRRequestStatus;
  user_id: string;
  email: string;
  submitted_at: string;
  completed_at?: string;
  expires_at: string; // 30 days from submission per GDPR
  details: {
    reason?: string;
    data_categories?: DataCategory[];
    specific_data?: string[];
    verification_method: 'email' | 'phone' | 'document';
    verification_completed: boolean;
  };
  processing_notes?: string[];
  response_data?: any;
}

// Data export format for portability requests
interface DataExportPackage {
  user_info: {
    id: string;
    email: string;
    name: string;
    phone?: string;
    created_at: string;
    verified_at?: string;
  };
  addresses: Array<{
    id: string;
    type: 'shipping' | 'billing';
    address_line_1: string;
    address_line_2?: string;
    city: string;
    postal_code: string;
    region: string;
    country: string;
    created_at: string;
  }>;
  orders: Array<{
    id: string;
    total: number;
    status: string;
    created_at: string;
    items: Array<{
      product_name: string;
      producer_name: string;
      quantity: number;
      price: number;
    }>;
  }>;
  preferences: {
    marketing_consent: boolean;
    newsletter_subscribed: boolean;
    preferred_language: string;
    notification_settings: Record<string, boolean>;
  };
  behavioral_data: {
    last_login: string;
    login_count: number;
    page_views: number;
    search_history: string[];
    cart_history: Array<{
      products: string[];
      timestamp: string;
    }>;
  };
  export_metadata: {
    generated_at: string;
    format_version: string;
    retention_policy: string;
    legal_basis: ProcessingLegalBasis[];
  };
}

// Main DSR service implementation
export class GDPRDataSubjectService {
  private static instance: GDPRDataSubjectService;
  private apiBaseUrl: string;

  private constructor() {
    // SSOT: Import from @/env — but currently only used with mockApiCall
    // When real API integration added, use API_BASE_URL from '@/env'
    this.apiBaseUrl = '/api/v1';
  }

  static getInstance(): GDPRDataSubjectService {
    if (!GDPRDataSubjectService.instance) {
      GDPRDataSubjectService.instance = new GDPRDataSubjectService();
    }
    return GDPRDataSubjectService.instance;
  }

  // Submit DSR request
  async submitDSRRequest(
    type: DSRRequestType,
    email: string,
    details: DSRRequest['details']
  ): Promise<DSRRequest> {
    const request: Omit<DSRRequest, 'id' | 'submitted_at' | 'expires_at'> = {
      type,
      status: DSRRequestStatus.SUBMITTED,
      user_id: '', // Will be populated by backend
      email: email.toLowerCase().trim(),
      details,
      processing_notes: []
    };

    // Mock implementation - in production this would be an API call
    const response = await this.mockApiCall('/gdpr/dsr-requests', 'POST', request);
    return response;
  }

  // Check DSR request status
  async getDSRRequestStatus(requestId: string): Promise<DSRRequest> {
    const response = await this.mockApiCall(`/gdpr/dsr-requests/${requestId}`, 'GET');
    return response;
  }

  // List user's DSR requests
  async getUserDSRRequests(email: string): Promise<DSRRequest[]> {
    const response = await this.mockApiCall(`/gdpr/dsr-requests?email=${encodeURIComponent(email)}`, 'GET');
    return response;
  }

  // Download data export for portability requests
  async downloadDataExport(requestId: string): Promise<DataExportPackage> {
    const response = await this.mockApiCall(`/gdpr/data-export/${requestId}`, 'GET');
    return response;
  }

  // Verify identity for DSR request
  async verifyIdentity(requestId: string, verificationCode: string): Promise<boolean> {
    const response = await this.mockApiCall(`/gdpr/dsr-requests/${requestId}/verify`, 'POST', {
      verification_code: verificationCode
    });
    return response.verified;
  }

  // Get data retention policy information
  async getRetentionPolicy(): Promise<{
    categories: Record<DataCategory, { retention_period: string; legal_basis: ProcessingLegalBasis; }>;
    contact_info: { dpo_email: string; dpo_phone: string; };
    policy_version: string;
    last_updated: string;
  }> {
    return {
      categories: {
        [DataCategory.PERSONAL_IDENTITY]: {
          retention_period: '7 years after account closure',
          legal_basis: ProcessingLegalBasis.CONTRACT
        },
        [DataCategory.ADDRESS_DATA]: {
          retention_period: '7 years for tax purposes',
          legal_basis: ProcessingLegalBasis.LEGAL_OBLIGATION
        },
        [DataCategory.PAYMENT_DATA]: {
          retention_period: '10 years (tokenized)',
          legal_basis: ProcessingLegalBasis.LEGAL_OBLIGATION
        },
        [DataCategory.ORDER_HISTORY]: {
          retention_period: '7 years for accounting',
          legal_basis: ProcessingLegalBasis.LEGAL_OBLIGATION
        },
        [DataCategory.BEHAVIORAL_DATA]: {
          retention_period: '2 years or until consent withdrawal',
          legal_basis: ProcessingLegalBasis.CONSENT
        },
        [DataCategory.COMMUNICATION_DATA]: {
          retention_period: '3 years',
          legal_basis: ProcessingLegalBasis.LEGITIMATE_INTERESTS
        },
        [DataCategory.PRODUCER_DATA]: {
          retention_period: '10 years for business records',
          legal_basis: ProcessingLegalBasis.CONTRACT
        },
        [DataCategory.MARKETING_DATA]: {
          retention_period: 'Until consent withdrawal',
          legal_basis: ProcessingLegalBasis.CONSENT
        }
      },
      contact_info: {
        dpo_email: 'dpo@dixis.gr',
        dpo_phone: '+30 210 1234567'
      },
      policy_version: '1.2',
      last_updated: '2024-10-01'
    };
  }

  // Mock API implementation for development
  private async mockApiCall(endpoint: string, method: string, data?: any): Promise<any> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));

    const requestId = `dsr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    switch (endpoint) {
      case '/gdpr/dsr-requests':
        if (method === 'POST') {
          return {
            id: requestId,
            ...data,
            user_id: 'user_123',
            submitted_at: now,
            expires_at: expiresAt,
            status: DSRRequestStatus.SUBMITTED
          };
        }
        break;

      default:
        // Handle dynamic request IDs in path
        if (endpoint.startsWith('/gdpr/dsr-requests/') && !endpoint.includes('verify')) {
          return {
            id: requestId,
            type: DSRRequestType.ACCESS,
            status: DSRRequestStatus.COMPLETED,
            user_id: 'user_123',
            email: 'user@example.com',
            submitted_at: now,
            completed_at: now,
            expires_at: expiresAt,
            details: {
              verification_method: 'email',
              verification_completed: true
            }
          };
        }

        if (endpoint.startsWith('/gdpr/data-export/')) {
          return this.generateMockDataExport();
        }

        if (endpoint.includes('verify')) {
          return { verified: true };
        }
        return [];
    }
  }

  private generateMockDataExport(): DataExportPackage {
    return {
      user_info: {
        id: 'user_123',
        email: 'user@example.com',
        name: 'Γιάννης Παπαδόπουλος',
        phone: '+30 6912345678',
        created_at: '2023-06-15T10:30:00Z',
        verified_at: '2023-06-15T11:00:00Z'
      },
      addresses: [
        {
          id: 'addr_1',
          type: 'shipping',
          address_line_1: 'Βασιλίσσης Σοφίας 123',
          city: 'Αθήνα',
          postal_code: '10671',
          region: 'Αττική',
          country: 'Ελλάδα',
          created_at: '2023-06-15T10:35:00Z'
        }
      ],
      orders: [
        {
          id: 'order_456',
          total: 34.50,
          status: 'completed',
          created_at: '2024-09-15T14:20:00Z',
          items: [
            {
              product_name: 'Ελαιόλαδο Κρήτης',
              producer_name: 'Κρητικός Παραγωγός',
              quantity: 2,
              price: 15.50
            }
          ]
        }
      ],
      preferences: {
        marketing_consent: true,
        newsletter_subscribed: true,
        preferred_language: 'el',
        notification_settings: {
          order_updates: true,
          promotions: false,
          producer_news: true
        }
      },
      behavioral_data: {
        last_login: '2024-10-01T09:15:00Z',
        login_count: 127,
        page_views: 2341,
        search_history: ['ελαιόλαδο', 'μέλι', 'κρητικά προϊόντα'],
        cart_history: [
          {
            products: ['Ελαιόλαδο Κρήτης', 'Μέλι Θυμαριού'],
            timestamp: '2024-09-30T16:45:00Z'
          }
        ]
      },
      export_metadata: {
        generated_at: new Date().toISOString(),
        format_version: '1.0',
        retention_policy: 'Available for 30 days after generation',
        legal_basis: [ProcessingLegalBasis.CONSENT, ProcessingLegalBasis.CONTRACT]
      }
    };
  }
}

// Convenience functions for common DSR operations
export const dsrService = GDPRDataSubjectService.getInstance();

export const DSRUtils = {
  // Check if request is still valid (not expired)
  isRequestValid: (request: DSRRequest): boolean => {
    return new Date(request.expires_at) > new Date();
  },

  // Get human-readable request type in Greek
  getRequestTypeLabel: (type: DSRRequestType): string => {
    const labels = {
      [DSRRequestType.ACCESS]: 'Πρόσβαση στα Δεδομένα',
      [DSRRequestType.RECTIFICATION]: 'Διόρθωση Δεδομένων',
      [DSRRequestType.ERASURE]: 'Διαγραφή Δεδομένων',
      [DSRRequestType.RESTRICTION]: 'Περιορισμός Επεξεργασίας',
      [DSRRequestType.PORTABILITY]: 'Φορητότητα Δεδομένων',
      [DSRRequestType.OBJECTION]: 'Αντίρρηση στην Επεξεργασία'
    };
    return labels[type];
  },

  // Get status label in Greek
  getStatusLabel: (status: DSRRequestStatus): string => {
    const labels = {
      [DSRRequestStatus.SUBMITTED]: 'Υποβλήθηκε',
      [DSRRequestStatus.UNDER_REVIEW]: 'Υπό Εξέταση',
      [DSRRequestStatus.IN_PROGRESS]: 'Σε Εξέλιξη',
      [DSRRequestStatus.COMPLETED]: 'Ολοκληρώθηκε',
      [DSRRequestStatus.REJECTED]: 'Απορρίφθηκε',
      [DSRRequestStatus.EXPIRED]: 'Έληξε'
    };
    return labels[status];
  },

  // Calculate days remaining until expiration
  getDaysUntilExpiration: (request: DSRRequest): number => {
    const now = new Date();
    const expires = new Date(request.expires_at);
    const diffTime = expires.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  // Validate email format
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
};

// React hook for DSR functionality
export const useGDPRDSR = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitRequest = async (
    type: DSRRequestType,
    email: string,
    details: DSRRequest['details']
  ) => {
    setLoading(true);
    setError(null);
    try {
      const request = await dsrService.submitDSRRequest(type, email, details);
      return request;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Σφάλμα κατά την υποβολή αιτήματος');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async (requestId: string) => {
    setLoading(true);
    setError(null);
    try {
      const status = await dsrService.getDSRRequestStatus(requestId);
      return status;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Σφάλμα κατά τον έλεγχο κατάστασης');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitRequest,
    checkStatus,
    loading,
    error,
    clearError: () => setError(null)
  };
};

// Mock useState for development
const useState = <T>(initial: T): [T, (value: T) => void] => {
  // This is a mock implementation - in real React this would be the actual useState hook
  let value = initial;
  const setter = (newValue: T) => { value = newValue; };
  return [value, setter];
};

// Export types for external use
export type { DSRRequest, DataExportPackage };