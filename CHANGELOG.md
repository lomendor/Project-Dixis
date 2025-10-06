# Changelog

All notable changes to Project Dixis will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-10-06

### Highlights
- **Orders MVP**: Atomic checkout guard, producer orders inbox with status flow (PENDING→ACCEPTED→FULFILLED)
- **Public Catalog**: /products list with search/filters, /product/[id] detail pages  
- **/my/products CRUD**: Full producer product management (EL-first, server actions, Zod validation)
- **CI Hardening**: Artifacts preservation, lint/typecheck workflows, PostgreSQL adoption
- **Database**: PostgreSQL with Prisma, atomic stock guards, oversell protection (409)

### Added
- Producer orders inbox at /my/orders with status tabs (PENDING/ACCEPTED/REJECTED/FULFILLED)
- Server actions for order status transitions with validation
- Public product catalog at /products with search, category, and region filters
- Product detail pages at /product/[id] with add-to-cart functionality
- Product snapshots (titleSnap, priceSnap) in OrderItem for historical tracking
- Atomic stock decrement with updateMany guard to prevent oversell race conditions
- 409 Conflict response for oversell scenarios with Greek error messages
- PostgreSQL database with comprehensive migrations
- Prisma schema enhancements for Orders, OrderItems, and Products
- Playwright E2E tests for orders flow and public catalog
- Producer path redirects (/producer/orders → /my/orders, /producer/products → /my/products)

### Changed
- OrderItem status normalized to uppercase 'PENDING' for UI consistency
- Tests moved to canonical location under frontend/tests/
- CI workflows enhanced with artifact preservation
- Database provider switched from SQLite to PostgreSQL

### Technical
- **Pass 110.x**: CI/CD infrastructure, Playwright config, docs enforcement
- **Pass 111.x**: PostgreSQL setup with migrations and seeding
- **Pass 112.x**: Database hardening with atomic stock guards, oversell protection
- **Pass 113.x**: Products CRUD with Zod validation, public catalog implementation  
- **Pass 114.x**: Orders MVP, status flow, release preparation

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
- Production environment variables
- Database connection handling
