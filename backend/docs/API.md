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

## Examples (curl)

### Health Check
```bash
curl -i http://127.0.0.1:8000/api/v1/health
```

### Producer KPIs (requires auth)
```bash
curl -H "Authorization: Bearer <token>" http://127.0.0.1:8000/api/v1/producer/dashboard/kpi
```

### Toggle Product Status
```bash
curl -X PATCH -H "Authorization: Bearer <token>" http://127.0.0.1:8000/api/v1/producer/products/123/toggle
```

### Mark Message as Read
```bash
curl -X PATCH -H "Authorization: Bearer <token>" http://127.0.0.1:8000/api/v1/producer/messages/10/read
```

### Reply to Message
```bash
curl -X POST -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
     -d '{"content":"Καλημέρα!"}' \
     http://127.0.0.1:8000/api/v1/producer/messages/10/replies
```

### Product Catalog with Filters
```bash
# Basic product list
curl http://127.0.0.1:8000/api/v1/public/products

# With filters
curl "http://127.0.0.1:8000/api/v1/public/products?search=ντομάτες&organic=true&min_price=2&max_price=5&producer=farm-koukoutsis"
```

## Greek Market Features
- Product filtering by Greek producers
- Greek language support in messages
- Local produce categories
- Organic certification flags
- Greek market-specific validation