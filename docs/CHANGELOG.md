# Changelog

All notable changes to Project-Dixis will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-08-25

### Added
- **Products API**: Browse and search agricultural products
  - `GET /api/v1/products` - List products with pagination (default 15 items, max 100)
  - `GET /api/v1/products/{id}` - Get product details
  - Filter to show only active products
- **Orders API**: Place and manage orders with authentication
  - `POST /api/v1/orders` - Create new order (requires Sanctum authentication)
  - `GET /api/v1/orders/{id}` - Get order details (requires authentication)
  - Comprehensive validation (quantity > 0, product existence, total calculation)
  - Rate limiting: 10 requests per minute for order creation
- **Health Check API**: System status monitoring
  - `GET /api/health` - Check API and database connectivity
- **Authentication**: Laravel Sanctum token-based authentication
  - Demo user seeder with API token logging for testing
  - Stateful domains configuration for frontend integration
- **Database**: PostgreSQL/SQLite compatible migrations and seeders
  - Idempotent migrations with proper guards (`Schema::hasColumn`)
  - Idempotent seeders using `firstOrCreate` pattern
  - Database-agnostic foreign key handling
- **Models & Relationships**: Core domain models
  - User, Producer, Product, Order, OrderItem with proper relationships
  - Enum fields for statuses (user roles, product/order statuses)
- **Testing**: Comprehensive feature test suite
  - Tests tagged with `@group mvp` for selective execution
  - Authentication tests, API structure validation
  - Database transaction and rollback testing
- **CORS Support**: Frontend integration ready
  - Configure for localhost:3000 development
  - Proper middleware registration

### Fixed
- **PostgreSQL Compatibility**: Database-agnostic enum modifications
  - Fixed `SQLSTATE[42601]` syntax error with `MODIFY COLUMN`
  - Use temporary column approach for PostgreSQL enum changes
  - Preserve data during status enum migrations
- **Order Status Enum**: Updated from 'processing' to 'paid'
  - Proper data migration with enum value conversion
  - Rollback support with reverse data transformation

### Documentation
- **README**: Comprehensive API documentation with curl examples
  - Tech stack overview and installation instructions
  - API quickstart guide with authentication examples
  - Development and testing guidelines
- **OpenAPI 3.0 Specification**: Complete API documentation
  - All endpoints with request/response schemas
  - Authentication requirements and error responses
  - Interactive documentation ready
- **Postman Collection**: Ready-to-use API testing collection
  - Environment variables for easy setup
  - Example requests with sample responses
  - Pre-request scripts and basic tests

### Infrastructure
- **GitHub Actions CI/CD**: PostgreSQL-based testing pipeline
  - Automated testing on push and pull requests
  - PostgreSQL service container with health checks
  - Test strategy: MVP feature tests first, fallback to full suite
  - OpenAPI specification artifact generation
  - Concurrency control to prevent resource conflicts
- **Environment Configuration**: Production-ready setup
  - PostgreSQL settings in `.env.example`
  - Sanctum domains for CORS configuration
  - Proper app name and URL defaults

### Security
- **Rate Limiting**: Basic protection for create endpoints
- **Input Validation**: Comprehensive request validation
- **Database Transactions**: Atomic operations with rollback support
- **Authentication**: Bearer token requirements for protected endpoints
- **CORS**: Configured for secure frontend integration

## [0.0.1] - 2025-08-24

### Added
- Initial Laravel 11.45.2 project setup
- Basic health check endpoint
- CI/CD pipeline foundation

---

**Legend:**
- 🆕 **Added**: New features
- 🔧 **Fixed**: Bug fixes
- 📚 **Documentation**: Documentation changes
- 🏗️ **Infrastructure**: CI/CD and deployment changes
- 🔒 **Security**: Security improvements