# Project Dixis - Frontend

A Next.js 15 frontend application for the Project Dixis local producer marketplace platform. This application provides a consumer-facing catalog, authentication, cart management, and a producer dashboard.

## 🚀 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Laravel Sanctum Bearer tokens
- **State Management**: React Context API
- **HTTP Client**: Native fetch API

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/               # Authentication pages
│   │   │   ├── login/          # Login page
│   │   │   └── register/       # Registration page
│   │   ├── cart/               # Shopping cart page
│   │   ├── orders/             # Order details pages
│   │   │   └── [id]/           # Individual order view
│   │   ├── producer/           # Producer-specific pages
│   │   │   └── dashboard/      # Producer dashboard with KPIs
│   │   ├── products/           # Product pages
│   │   │   └── [id]/           # Product detail pages
│   │   ├── layout.tsx          # Root layout with providers
│   │   └── page.tsx            # Home page (product catalog)
│   ├── components/             # Reusable React components
│   │   └── Navigation.tsx      # Main navigation component
│   ├── contexts/               # React Context providers
│   │   └── AuthContext.tsx     # Authentication state management
│   └── lib/                    # Utility libraries
│       └── api.ts              # API client and TypeScript types
├── public/                     # Static assets
├── .env.local                  # Environment variables (create from .env.sample)
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

## 🛠️ Setup & Development

### Prerequisites

- Node.js 20+ installed
- npm or yarn package manager
- Project Dixis backend API running (see `../README.md`)

### Installation

1. **Navigate to frontend directory**:
   ```bash
   cd backend/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment setup**:
   ```bash
   cp .env.sample .env.local
   ```

4. **Configure environment variables**:
   ```env
   # .env.local
   NEXT_PUBLIC_API_BASE=http://127.0.0.1:8001
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

6. **Open in browser**:
   Visit [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🔧 API Integration

The frontend integrates with the Laravel backend API using a centralized API client (`src/lib/api.ts`) that handles:

- **Authentication**: Bearer token management with localStorage persistence
- **Products**: Catalog browsing, search, filtering, and individual product details
- **Cart**: Add/remove items, quantity updates, checkout process
- **Orders**: Order placement and history viewing
- **Producer Dashboard**: KPIs and top products for authenticated producers

### Authentication Flow

1. User registers/logs in via `/auth/login` or `/auth/register`
2. API returns Sanctum Bearer token
3. Token stored in localStorage and attached to subsequent requests
4. AuthContext provides global authentication state management
5. Protected routes redirect unauthenticated users to login

## 🧭 Key Features

### Consumer Features
- **Product Catalog**: Browse all available products with search and category filtering
- **Product Details**: Detailed product information, producer details, images
- **Shopping Cart**: Add items, adjust quantities, checkout with cash on delivery
- **Order Management**: View order history and track order status
- **Authentication**: Secure login/registration with persistent sessions

### Producer Features
- **Dashboard**: Overview of business metrics and performance KPIs
- **Top Products**: View best-performing products
- **Order Insights**: Revenue, order counts, and average order value statistics

### Technical Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript integration with comprehensive API types
- **Error Handling**: User-friendly error messages and loading states
- **Performance**: Next.js optimizations with image optimization and caching
- **SEO**: Server-side rendering for public product pages

## 🎨 UI/UX Design

- **Color Scheme**: Green primary theme (green-600) with gray accents
- **Typography**: Default Next.js font stack with clean, readable design
- **Components**: Consistent button styles, form inputs, and layout patterns
- **Accessibility**: Semantic HTML, proper ARIA labels, keyboard navigation

## 🚦 CI/CD Integration

The frontend includes GitHub Actions CI pipeline (`.github/workflows/frontend-ci.yml`) that:

- Runs on changes to `backend/frontend/**` paths
- Sets up Node.js 20 with npm caching
- Installs dependencies with `npm ci`
- Runs ESLint for code quality
- Runs TypeScript type checking
- Builds the application for production
- Uploads build artifacts

## 🔗 Integration with Backend

The frontend expects the Laravel backend to be running on `http://127.0.0.1:8001` (configurable via `NEXT_PUBLIC_API_BASE`).

**Required Backend Endpoints**:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get authenticated user profile
- `GET /api/products` - Product catalog with search/filter
- `GET /api/products/{id}` - Individual product details
- `GET /api/cart` - Get cart contents
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/{id}` - Update cart item
- `DELETE /api/cart/{id}` - Remove cart item
- `POST /api/checkout` - Place order
- `GET /api/orders/{id}` - Get order details
- `GET /api/producer/stats` - Producer KPIs (for producers)
- `GET /api/producer/products/top` - Top products (for producers)

## 📊 State Management

Authentication state is managed globally via React Context (`AuthContext`) which provides:

- Current user information
- Authentication status
- Login/logout methods
- Automatic token management
- Role-based UI rendering (consumer vs producer)

## 🛡️ Security Considerations

- **Token Storage**: Sanctum Bearer tokens stored in localStorage
- **Route Protection**: Authentication checks on protected routes
- **CSRF Protection**: Not required for API-only backend with Sanctum
- **Input Validation**: Client-side validation with server-side validation as source of truth
- **Error Handling**: Sensitive information not exposed in error messages

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px  
- Desktop: > 1024px

Key responsive features:
- Collapsible navigation menu
- Responsive product grid (1-4 columns)
- Mobile-optimized forms and buttons
- Touch-friendly interface elements

## 🚀 Deployment

For production deployment:

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   npm run start
   ```

3. **Environment variables**:
   - Update `NEXT_PUBLIC_API_BASE` to production API URL
   - Ensure backend CORS is configured for frontend domain

## 🤝 Contributing

1. Follow the existing code style and component patterns
2. Use TypeScript for all new components
3. Add proper error handling and loading states
4. Test authentication flows and API integrations
5. Maintain responsive design principles

## 📈 Performance

- **Next.js optimizations**: Automatic code splitting, image optimization
- **API efficiency**: Centralized error handling, request deduplication
- **Bundle size**: Minimal dependencies, tree-shaking enabled
- **Caching**: Browser caching for static assets, API response caching where appropriate

---

**Status**: ✅ Production Ready | **Created**: 2025-08-25  
**Purpose**: Consumer-facing marketplace for local producers