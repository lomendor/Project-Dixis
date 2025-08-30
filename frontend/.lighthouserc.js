module.exports = {
  ci: {
    collect: {
      url: [
        'http://127.0.0.1:3001/',
        'http://127.0.0.1:3001/products',
        'http://127.0.0.1:3001/cart',
        'http://127.0.0.1:3001/auth/login',
      ],
      numberOfRuns: 2,
      startServerCommand: null, // Server already running
      startServerReadyPattern: 'ready',
      settings: {
        chromeFlags: ['--no-sandbox', '--disable-dev-shm-usage'],
        preset: 'desktop',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      },
    },
    assert: {
      // Warning thresholds (soft mode)
      assertions: {
        'categories:performance': ['warn', { minScore: 0.75 }], // ≥ 75% warning
        'categories:accessibility': ['warn', { minScore: 0.90 }], // ≥ 90% warning
        'categories:best-practices': ['warn', { minScore: 0.80 }],
        'categories:seo': ['warn', { minScore: 0.85 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
    server: {
      // Disable LHCI server for now
    },
  },
};