const express = require('express');
const app = express();
app.use(express.json());

// CORS headers for frontend requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Minimal endpoints used by homepage/products/categories
app.get('/api/v1/health', (_, res) => {
  res.json({ ok: true, status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/v1/products', (req, res) => {
  const items = [
    {
      id: 1,
      name: 'Premium Greek Olive Oil',
      price_eur: 12.50,
      slug: 'premium-olive-oil',
      images: ['/images/olive-oil.jpg'],
      producer: { name: 'Cretan Farmers Co-op', id: 1 },
      categories: [{ id: 1, name: 'Oils & Vinegars' }],
      description: 'Extra virgin olive oil from Crete'
    },
    {
      id: 2,
      name: 'Organic Honey',
      price_eur: 8.90,
      slug: 'organic-honey',
      images: ['/images/honey.jpg'],
      producer: { name: 'Mountain Beekeepers', id: 2 },
      categories: [{ id: 2, name: 'Sweets & Preserves' }],
      description: 'Pure organic wildflower honey'
    },
    {
      id: 3,
      name: 'Feta Cheese PDO',
      price_eur: 6.75,
      slug: 'feta-cheese-pdo',
      images: ['/images/feta.jpg'],
      producer: { name: 'Traditional Dairy', id: 3 },
      categories: [{ id: 3, name: 'Dairy & Eggs' }],
      description: 'Authentic Greek feta cheese'
    }
  ];

  res.json({
    success: true,
    data: {
      items,
      total: items.length,
      page: 1,
      per_page: 24,
      total_pages: 1
    }
  });
});

app.get('/api/v1/categories', (_, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, slug: 'oils-vinegars', name: 'Oils & Vinegars', product_count: 15 },
      { id: 2, slug: 'sweets-preserves', name: 'Sweets & Preserves', product_count: 12 },
      { id: 3, slug: 'dairy-eggs', name: 'Dairy & Eggs', product_count: 8 }
    ]
  });
});

app.post('/api/v1/shipping/quote', (req, res) => {
  const { payment_method = 'CARD', postal_code = '11111' } = req.body || {};
  const codFee = payment_method === 'COD' ? 400 : 0; // 4 EUR in cents

  res.json({
    success: true,
    data: {
      cost_cents: 290 + codFee, // Base shipping + COD fee
      cost_eur: (290 + codFee) / 100,
      carrier_code: 'ELTA',
      zone_code: 'GR_MAINLAND',
      zone_name: 'Mainland Greece',
      estimated_delivery_days: 2,
      delivery_method: 'HOME',
      payment_method,
      breakdown: {
        base_cost_cents: 290,
        weight_adjustment_cents: 0,
        volume_adjustment_cents: 0,
        zone_multiplier: 1.0,
        actual_weight_kg: 1.0,
        volumetric_weight_kg: 0.5,
        postal_code,
        profile_applied: null,
        cod_fee_cents: codFee,
        payment_method
      }
    }
  });
});

app.get('/api/v1/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = {
    id,
    name: `Sample Product ${id}`,
    price_eur: 9.99 + id,
    slug: `sample-product-${id}`,
    images: [`/images/product-${id}.jpg`],
    producer: { name: 'Demo Producer', id: 1 },
    categories: [{ id: 1, name: 'Demo Category' }],
    description: `This is a sample product ${id} for testing purposes.`,
    stock: 10,
    unit: 'piece'
  };

  res.json({ success: true, data: product });
});

// Catch-all for unhandled endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Mock API: Endpoint ${req.method} ${req.path} not implemented`
  });
});

const port = process.env.MOCK_PORT || 3200;
const server = app.listen(port, () => {
  console.log(`🚀 LHCI Mock API running on port ${port}`);
  console.log(`   Health: http://localhost:${port}/api/v1/health`);
  console.log(`   Products: http://localhost:${port}/api/v1/products`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 LHCI Mock API shutting down...');
  server.close(() => {
    console.log('✅ LHCI Mock API closed');
    process.exit(0);
  });
});