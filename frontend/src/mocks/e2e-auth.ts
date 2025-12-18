/**
 * E2E Authentication Mocks
 * Provides stable authentication states for E2E testing
 * Includes consumer, producer, and guest scenarios
 */

export interface E2EUser {
  id: string;
  email: string;
  role: 'consumer' | 'producer' | 'admin';
  name: string;
  avatar?: string;
  verified: boolean;
}

export interface E2EAuthState {
  isAuthenticated: boolean;
  user: E2EUser | null;
  token: string | null;
  sessionId: string;
}

// Mock users for different E2E scenarios
export const E2E_MOCK_USERS: Record<string, E2EUser> = {
  consumer: {
    id: 'e2e-consumer-001',
    email: 'consumer@e2e.dixis.test',
    role: 'consumer',
    name: 'Δημήτρης Παπαδόπουλος',
    verified: true
  },
  producer: {
    id: 'e2e-producer-001',
    email: 'producer@e2e.dixis.test',
    role: 'producer',
    name: 'Μαρία Κωνσταντίνου',
    verified: true
  },
  admin: {
    id: 'e2e-admin-001',
    email: 'admin@e2e.dixis.test',
    role: 'admin',
    name: 'Admin E2E User',
    verified: true
  },
  unverified: {
    id: 'e2e-unverified-001',
    email: 'unverified@e2e.dixis.test',
    role: 'consumer',
    name: 'Unverified User',
    verified: false
  }
};

// Auth states for different scenarios
export const E2E_AUTH_SCENARIOS: Record<string, E2EAuthState> = {
  authenticatedConsumer: {
    isAuthenticated: true,
    user: E2E_MOCK_USERS.consumer,
    token: 'e2e-token-consumer-valid',
    sessionId: 'e2e-session-consumer-001'
  },
  authenticatedProducer: {
    isAuthenticated: true,
    user: E2E_MOCK_USERS.producer,
    token: 'e2e-token-producer-valid',
    sessionId: 'e2e-session-producer-001'
  },
  guest: {
    isAuthenticated: false,
    user: null,
    token: null,
    sessionId: 'e2e-session-guest-001'
  },
  expiredAuth: {
    isAuthenticated: false,
    user: null,
    token: 'e2e-token-expired',
    sessionId: 'e2e-session-expired-001'
  }
};

/**
 * Apply E2E auth mock to browser environment
 * Call this from test setup or page.addInitScript()
 */
export function applyE2EAuthMock(scenario: keyof typeof E2E_AUTH_SCENARIOS = 'authenticatedConsumer') {
  const authState = E2E_AUTH_SCENARIOS[scenario];

  return `
    // Clear existing auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');

    // Set E2E mode flag
    localStorage.setItem('e2eMode', 'true');
    localStorage.setItem('locale', 'el');

    ${authState.isAuthenticated ? `
      // Set authenticated state
      localStorage.setItem('authToken', '${authState.token}');
      localStorage.setItem('userRole', '${authState.user!.role}');
      localStorage.setItem('userId', '${authState.user!.id}');
      localStorage.setItem('userEmail', '${authState.user!.email}');
      localStorage.setItem('userName', '${authState.user!.name}');
      localStorage.setItem('userVerified', '${authState.user!.verified}');
    ` : `
      // Set guest state
      localStorage.setItem('guestSession', '${authState.sessionId}');
    `}

    // Mock cart for authenticated users
    ${authState.isAuthenticated ? `
      localStorage.setItem('cartId', 'e2e-cart-${authState.user!.id}');
    ` : `
      localStorage.setItem('cartId', 'e2e-cart-guest-${authState.sessionId}');
    `}
  `;
}

/**
 * E2E Auth API Mock Responses
 * Use these for mocking API responses during E2E tests
 */
export const E2E_AUTH_API_RESPONSES = {
  login: {
    success: {
      success: true,
      data: {
        user: E2E_MOCK_USERS.consumer,
        token: E2E_AUTH_SCENARIOS.authenticatedConsumer.token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    },
    invalid: {
      success: false,
      message: 'Invalid credentials',
      errors: {
        email: ['Τα διαπιστευτήρια δεν είναι έγκυρα']
      }
    },
    unverified: {
      success: false,
      message: 'Email not verified',
      errors: {
        email: ['Παρακαλώ επιβεβαιώστε το email σας']
      }
    }
  },

  logout: {
    success: {
      success: true,
      message: 'Logged out successfully'
    }
  },

  me: {
    authenticated: {
      success: true,
      data: E2E_MOCK_USERS.consumer
    },
    unauthenticated: {
      success: false,
      message: 'Unauthenticated',
      status: 401
    }
  }
};

/**
 * Guest fallback mock for checkout scenarios
 * Handles cases where auth fails but checkout should still work
 */
export function mockGuestCheckoutAuth() {
  return applyE2EAuthMock('guest');
}

/**
 * Utility to get current E2E auth state from localStorage
 * Use this in test assertions
 */
export function getE2EAuthState(): E2EAuthState | null {
  if (typeof window === 'undefined') return null;

  const authToken = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole') as 'consumer' | 'producer' | 'admin' | null;
  const userId = localStorage.getItem('userId');
  const userEmail = localStorage.getItem('userEmail');
  const userName = localStorage.getItem('userName');
  const guestSession = localStorage.getItem('guestSession');

  if (authToken && userRole && userId && userEmail && userName) {
    return {
      isAuthenticated: true,
      user: {
        id: userId,
        email: userEmail,
        role: userRole,
        name: userName,
        verified: localStorage.getItem('userVerified') === 'true'
      },
      token: authToken,
      sessionId: userId
    };
  }

  return {
    isAuthenticated: false,
    user: null,
    token: null,
    sessionId: guestSession || 'unknown-session'
  };
}

/**
 * Mock API interceptors for E2E tests
 * Use with playwright page.route() for consistent API responses
 */
export const E2E_API_ROUTES = {
  '/api/v1/auth/login': {
    POST: E2E_AUTH_API_RESPONSES.login.success
  },
  '/api/v1/auth/logout': {
    POST: E2E_AUTH_API_RESPONSES.logout.success
  },
  '/api/v1/auth/profile': {
    GET: E2E_AUTH_API_RESPONSES.me.authenticated
  }
};