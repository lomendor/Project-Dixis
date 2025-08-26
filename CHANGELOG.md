# Changelog

All notable changes to Project Dixis will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.3] - 2025-08-26

### Added
- **Comprehensive E2E testing with Playwright** covering complete user journeys
- **Enhanced UI polish** with dedicated loading, error, and empty state components
- **Better user feedback** with toast notifications replacing basic alerts
- **Test data attributes** throughout frontend for reliable E2E testing
- **CHANGELOG.md** with complete project history and semantic versioning
- **DEPLOYMENT.md** with comprehensive deployment guide for all environments

### Changed
- Improved cart success/error feedback from alerts to elegant toast notifications
- Enhanced empty states with contextual messaging and clear user actions
- Better loading states with descriptive text and consistent styling
- Upgraded error handling with retry functionality and professional styling

### Technical
- **Playwright configuration** with multi-browser support (Chromium, Firefox, WebKit)
- **CI pipeline enhancement** with E2E tests running on dual server setup
- **Test coverage** for complete user journey: catalog → product → login → cart → checkout → success
- **GitHub Actions** artifact collection for test results and reports
- **Release hygiene** with proper semantic versioning and comprehensive documentation

## [0.1.2] - 2025-08-26

### Fixed
- Force-dynamic and no-store caching for products and featured endpoints
- Fixed toFixed precision errors in cart calculations

### Changed
- Updated cart UX to reduce user confusion
- Added testids for better button disambiguation

## [0.1.1] - 2025-08-26

### Added
- Complete VPS deployment pipeline
- Context engineering for production readiness
- All staging validation checks

### Fixed
- Production deployment issues
- VPS configuration optimizations

## [0.1.0] - 2025-08-26

### Added
- **Complete Next.js 15 Frontend** with TypeScript and Tailwind CSS
- **Laravel 11 Backend API** with Sanctum authentication
- **Product Catalog** with search, filtering, and categories
- **Shopping Cart** with quantity management and persistence
- **User Authentication** with consumer/producer role separation
- **Producer Dashboard** with product and order management
- **Order Management** with status tracking and payment processing
- **GitHub Actions CI/CD** with PostgreSQL integration
- **Comprehensive Testing** with PHPUnit backend tests

### Features
- **Product Management**: Full CRUD operations with image support
- **Cart System**: Add, update, remove items with real-time totals
- **Authentication**: Secure login/register with Bearer token API
- **Producer Tools**: Dashboard for managing products and viewing orders
- **Order Processing**: Complete checkout flow with cash-on-delivery
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **API Integration**: RESTful API with proper TypeScript interfaces

### Technical
- **Backend**: Laravel 11, PHP 8.2, PostgreSQL 15
- **Frontend**: Next.js 15, React 19, TypeScript 5
- **Authentication**: Laravel Sanctum with Bearer tokens
- **Testing**: PHPUnit with GitHub Actions CI
- **Deployment**: Docker-ready with environment configuration

### Infrastructure
- **CI/CD**: Automated testing and deployment pipeline
- **Database**: PostgreSQL with migrations and seeders  
- **Security**: CORS configuration, rate limiting, input validation
- **Performance**: Optimized API responses and database queries