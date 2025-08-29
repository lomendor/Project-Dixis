# API v1 Endpoints

## Health Check
- **GET** `/api/v1/health` - Health check with database connectivity

## Public Products
- **GET** `/api/v1/public/products` - List active products with filters
- **GET** `/api/v1/public/products/{id}` - Get product details

## Authentication (Sanctum Required)
- **POST** `/api/v1/auth/register` - User registration
- **POST** `/api/v1/auth/login` - User login
- **POST** `/api/v1/auth/logout` - User logout
- **GET** `/api/v1/auth/profile` - Get user profile

## Producer Dashboard (Auth Required)
- **GET** `/api/v1/producer/dashboard/kpi` - Get producer KPIs
- **GET** `/api/v1/producer/dashboard/top-products` - Get top-selling products
- **PATCH** `/api/v1/producer/products/{id}/toggle` - Toggle product active status

## Producer Messages (Auth Required)  
- **PATCH** `/api/v1/producer/messages/{id}/read` - Mark message as read
- **POST** `/api/v1/producer/messages/{id}/replies` - Reply to message

## Cart Management (Auth Required)
- **GET** `/api/v1/cart/items` - Get cart items
- **POST** `/api/v1/cart/items` - Add item to cart
- **PATCH** `/api/v1/cart/items/{id}` - Update cart item
- **DELETE** `/api/v1/cart/items/{id}` - Remove cart item

## Orders (Auth Required)
- **GET** `/api/v1/orders` - List user orders
- **POST** `/api/v1/orders` - Create new order
- **POST** `/api/v1/orders/checkout` - Checkout cart
- **GET** `/api/v1/orders/{id}` - Get order details

## Shipping (Rate Limited: 60/min)
- **POST** `/api/v1/shipping/quote` - Calculate shipping cost and ETA

## Examples (curl)

### Health Check
```bash
curl -i http://127.0.0.1:8001/api/v1/health
```

### Producer KPIs (requires auth)
```bash
curl -H "Authorization: Bearer <token>" http://127.0.0.1:8001/api/v1/producer/dashboard/kpi
```

### Toggle Product Status
```bash
curl -X PATCH -H "Authorization: Bearer <token>" http://127.0.0.1:8001/api/v1/producer/products/123/toggle
```

### Mark Message as Read
```bash
curl -X PATCH -H "Authorization: Bearer <token>" http://127.0.0.1:8001/api/v1/producer/messages/10/read
```

### Reply to Message
```bash
curl -X POST -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
     -d '{"content":"Καλημέρα!"}' \
     http://127.0.0.1:8001/api/v1/producer/messages/10/replies
```

### Product Catalog with Filters
```bash
# Basic product list
curl http://127.0.0.1:8001/api/v1/public/products

# With filters
curl "http://127.0.0.1:8001/api/v1/public/products?search=ντομάτες&organic=true&min_price=2&max_price=5&producer=farm-koukoutsis"
```

### Shipping Quote Calculation
```bash
# Athens Metro Zone (11xxx-12xxx postal codes)
curl -X POST -H "Content-Type: application/json" \
     -d '{"zip":"11527","city":"Athens","weight":2.5,"volume":0.01}' \
     http://127.0.0.1:8001/api/v1/shipping/quote

# Response: {"carrier":"Athens Express","cost":4.20,"etaDays":1,"zone":"athens_metro"}

# Thessaloniki Zone (54xxx-56xxx postal codes)  
curl -X POST -H "Content-Type: application/json" \
     -d '{"zip":"54623","city":"Thessaloniki","weight":2.0,"volume":0.008}' \
     http://127.0.0.1:8001/api/v1/shipping/quote

# Response: {"carrier":"Northern Courier","cost":4.80,"etaDays":2,"zone":"thessaloniki"}

# Greek Islands (80xxx-85xxx postal codes)
curl -X POST -H "Content-Type: application/json" \
     -d '{"zip":"84600","city":"Mykonos","weight":1.5,"volume":0.005}' \
     http://127.0.0.1:8001/api/v1/shipping/quote

# Response: {"carrier":"Island Logistics","cost":10.56,"etaDays":4,"zone":"islands"}

# Major Cities (20xxx-28xxx, 30xxx-38xxx postal codes)
curl -X POST -H "Content-Type: application/json" \
     -d '{"zip":"26500","city":"Patras","weight":3.0,"volume":0.015}' \
     http://127.0.0.1:8001/api/v1/shipping/quote

# Response: {"carrier":"Greek Post","cost":6.30,"etaDays":3,"zone":"major_cities"}
```

## Greek Market Features
- Product filtering by Greek producers
- Greek language support in messages
- Local produce categories
- Organic certification flags
- Greek market-specific validation
- **Greek shipping zones**: Athens Metro, Thessaloniki, Islands, Major Cities, Remote areas
- **ΤΚ (Postal Code) validation** for accurate shipping calculations
- **Weight/volume-based pricing** with Greek carrier partnerships
- **Real-time shipping quotes** with ETA calculations