# 🏗️ PROJECT-DIXIS ARCHITECTURE MAP

**System Overview & Integration Patterns**

## 🎯 HIGH-LEVEL ARCHITECTURE

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    BACKEND      │    │   DATABASE      │
│   Next.js 15    │◄──►│   Laravel 11    │◄──►│ PostgreSQL 15   │
│   Port: 3030    │    │   Port: 8001    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │  CI/CD PIPELINE │              │
         └──────────────► GitHub Actions ◄───────────────┘
                        │  E2E + Unit     │
                        └─────────────────┘
```

## 🌐 DOMAIN BOUNDARIES

### **Frontend Domain** (`frontend/`)
- **Framework**: Next.js 15.5.0 + React 19 + TypeScript 5
- **Port**: 3030 (development), 3000 (production)
- **Key Responsibilities**:
  - User interface and experience
  - Client-side authentication state
  - Cart management and checkout flow
  - Product catalog browsing
  - Real-time notifications (toast system)

### **Backend Domain** (`backend/`)
- **Framework**: Laravel 11.45.2 + PHP 8.2
- **Port**: 8001 (development), 8000 (production)
- **Key Responsibilities**:
  - API endpoints and business logic
  - Authentication and authorization
  - Database operations and migrations
  - Order processing and validation
  - Producer and product management

### **Database Domain**
- **Engine**: PostgreSQL 15
- **Port**: 5432
- **Key Responsibilities**:
  - Data persistence and integrity
  - Transactional operations
  - User and product data storage
  - Order history and tracking

## 🔄 CORE DATA FLOWS

### **Authentication Flow**
```
1. Frontend → POST /api/v1/auth/login → Backend
2. Backend → Validate credentials → Database
3. Backend → Generate JWT token → Frontend
4. Frontend → Store token (localStorage) → AuthGuard
5. Frontend → Include Bearer token → Subsequent API calls
```

### **Product Browsing Flow**
```
1. Frontend → GET /api/v1/public/products → Backend
2. Backend → Query products → Database
3. Backend → ProductResource::toArray() → JSON response
4. Frontend → Display products → User interface
```

### **Checkout Flow** [[E2E]]
```
1. Frontend → Cart seeding → Local state
2. Frontend → Navigate to /checkout → Backend validation
3. Frontend → POST shipping info → Backend
4. Backend → Calculate shipping → Quote update
5. Frontend → POST payment → Backend
6. Backend → Process order → Database transaction
7. Frontend → Redirect to confirmation → Success state
```

## 🔧 INTEGRATION PATTERNS

### **Integration Patterns**
- **API Client**: Frontend abstraction with baseURL, auth tokens, endpoint mapping
- **Laravel Resources**: Backend response standardization (ProductResource, CategoryResource)
- **Auth Guards**: Frontend route protection with role-based access

## 🧪 TESTING ARCHITECTURE

### **E2E Testing Strategy** [[E2E]]
- **Framework**: Playwright
- **Storage States**: Pre-authenticated user sessions
- **Key Test Scenarios**:
  - Cart operations and checkout flow
  - Producer dashboard functionality
  - Authentication redirects
  - Form validation and error handling

### **Backend Testing**
- **Framework**: PHPUnit
- **Coverage**: API endpoints, business logic validation
- **Database**: In-memory SQLite for test isolation

### **Frontend Testing**
- **Type Checking**: TypeScript strict mode
- **Build Validation**: Next.js production builds
- **Linting**: ESLint + Prettier enforcement

## 🚀 DEPLOYMENT ARCHITECTURE

### **Development Environment**
- **Backend**: php artisan serve (port 8001)
- **Frontend**: npm run dev (port 3030)
- **Database**: PostgreSQL local instance

### **CI/CD Pipeline**
```yaml
# GitHub Actions workflow
1. Checkout code
2. Setup PHP 8.2 + Node.js 18
3. Install dependencies (Composer + npm)
4. Run backend tests (PHPUnit)
5. Run frontend build + type check
6. Execute E2E tests (Playwright)
7. Upload artifacts on failure
```

## 📊 PERFORMANCE CONSIDERATIONS

### **Frontend Optimizations**
- **Static Generation**: Next.js ISR for product pages
- **Image Optimization**: Next.js Image component
- **Bundle Splitting**: Dynamic imports for large components
- **Caching**: API response caching strategies

### **Backend Optimizations**
- **Database Queries**: Eloquent eager loading
- **API Responses**: Resource transformation caching
- **Authentication**: JWT token validation efficiency

### **Full-Stack Optimization**
- **API Design**: RESTful endpoints with proper HTTP methods
- **Error Handling**: Consistent error responses and frontend handling
- **Loading States**: Progressive loading and skeleton screens

## 🔒 SECURITY ARCHITECTURE

### **Authentication & Authorization**
- **JWT Tokens**: Stateless authentication
- **Role-Based Access**: Consumer/Producer/Admin roles
- **API Protection**: Laravel Sanctum middleware
- **Frontend Guards**: Route-level access control

### **Data Protection**
- **Input Validation**: Laravel form requests
- **SQL Injection Prevention**: Eloquent ORM usage
- **XSS Protection**: React's built-in escaping
- **CORS Configuration**: Controlled API access

## 🔗 EXTERNAL INTEGRATIONS

### **Current Integrations**
- **None** (MVP focuses on core functionality)

### **Planned Integrations** [[PRD]]
- **Payment Gateway**: Viva Wallet integration
- **Shipping APIs**: Greek postal service integration
- **Analytics**: User behavior tracking, transactional email

## 📁 FILE STRUCTURE MAPPING

### **Critical Paths**
```
frontend/
├── src/components/cart/          # Cart functionality
├── src/components/products/      # Product catalog
├── src/lib/auth.ts              # Authentication logic
├── tests/e2e/                   # E2E test suites
└── tests/e2e/utils/checkout.ts  # Test utilities

backend/
├── app/Http/Controllers/        # API controllers
├── app/Http/Resources/          # API response formatting
├── app/Models/                  # Eloquent models
├── database/migrations/         # Database schema
└── tests/                       # Backend test suites
```

## 🔧 ENVIRONMENT FLAGS [[REGISTRY]]

### **Critical Configuration**
- **NEXT_PUBLIC_API_BASE_URL**: Frontend API endpoint
- **NEXT_PUBLIC_E2E**: E2E testing mode flag
- **APP_ENV**: Laravel environment (local/testing/production)
- **DB_CONNECTION**: Database connection type

---

**Last Updated**: 2025-09-27 | **Architecture Version**: v1.0
**Related**: [[PRD]], [[E2E]], [[REGISTRY]], [[TESTIDS]], [[CI-RCA]]