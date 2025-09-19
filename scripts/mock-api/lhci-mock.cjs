/**
 * Mock API server for Lighthouse CI testing
 * Provides minimal endpoints needed for Next.js app to function during CI
 */

const express = require('express');
const app = express();
const port = process.env.MOCK_PORT || 3200;

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  // Simple logging
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/v1/health', (_, res) => {
  res.json({ ok: true, status: 'healthy', timestamp: new Date().toISOString() });
});

// Mock products endpoint
app.get('/api/v1/public/products', (_, res) => {
  res.json({
    data: [
      {
        id: 1,
        name: 'Μοκ Προϊόν 1',
        price: 10.50,
        stock: 100,
        producer: { id: 1, name: 'Παραγωγός 1' }
      },
      {
        id: 2,
        name: 'Μοκ Προϊόν 2',
        price: 25.00,
        stock: 50,
        producer: { id: 2, name: 'Παραγωγός 2' }
      }
    ],
    meta: { total: 2, page: 1 }
  });
});

// Mock product detail endpoint
app.get('/api/v1/public/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  res.json({
    data: {
      id,
      name: `Μοκ Προϊόν ${id}`,
      description: 'Περιγραφή προϊόντος για Lighthouse testing',
      price: 15.50,
      stock: 75,
      producer: {
        id: 1,
        name: 'Τοπικός Παραγωγός',
        location: 'Αθήνα'
      }
    }
  });
});

// Mock categories endpoint
app.get('/api/v1/public/categories', (_, res) => {
  res.json({
    data: [
      { id: 1, name: 'Λαχανικά' },
      { id: 2, name: 'Φρούτα' },
      { id: 3, name: 'Γαλακτοκομικά' }
    ]
  });
});

// Mock cart endpoint
app.get('/api/v1/cart', (_, res) => {
  res.json({
    data: {
      items: [],
      total: 0
    }
  });
});

// Mock orders endpoint
app.get('/api/v1/orders', (_, res) => {
  res.json({
    data: [],
    meta: { total: 0, page: 1 }
  });
});

// Mock auth endpoints
app.post('/api/v1/auth/login', (_, res) => {
  res.status(401).json({ message: 'Mock API - auth not implemented' });
});

app.post('/api/v1/auth/register', (_, res) => {
  res.status(401).json({ message: 'Mock API - registration not implemented' });
});

// Mock user endpoint
app.get('/api/v1/user', (_, res) => {
  res.status(401).json({ message: 'Unauthenticated' });
});

// Mock shipping quote endpoint
app.post('/api/v1/shipping/quote', (req, res) => {
  const { postal_code = '10000', items = [] } = req.body;

  res.json({
    data: {
      carrier_code: 'standard',
      zone_code: 'zone1',
      postal_code,
      estimated_delivery_days: 2,
      cost_cents: 350,
      cost_breakdown: {
        base_cost: 300,
        weight_surcharge: 50,
        fuel_surcharge: 0
      }
    }
  });
});

// Catch-all for unmatched routes
app.use((req, res) => {
  console.log(`Mock API: Unmatched route ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Not found', path: req.url });
});

// Start server
const server = app.listen(port, () => {
  console.log(`🚀 Mock API server running on http://localhost:${port}`);
  console.log(`   Health check: http://localhost:${port}/api/v1/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down mock API...');
  server.close(() => {
    console.log('Mock API server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down mock API...');
  server.close(() => {
    console.log('Mock API server closed');
    process.exit(0);
  });
});