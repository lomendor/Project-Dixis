# 🎯 DIXIS PRD v2 — Product Requirements Document

**Project**: Local Producer Marketplace
**Version**: 2.0
**Last Updated**: 2025-09-25
**Status**: ✅ Production Ready
**Tech Stack**: Laravel 11, Next.js 15.5.0, PostgreSQL 15

---

## 📋 Executive Summary

**Dixis** is a production-ready local producer marketplace connecting Greek producers directly with consumers and businesses. The platform eliminates intermediaries while promoting sustainability, quality, and community engagement through innovative features like product origin stories, virtual farm visits, and adoption programs.

### 🎯 Core Value Proposition
- **Direct-to-Consumer (D2C)** sales channel with 0% commission for registered businesses
- **Producer empowerment** through modern digital tools and low entry barriers
- **Quality assurance** with verified product authenticity and fair pricing
- **Sustainability focus** through circular economy practices and environmental impact tracking

### 📊 Key Metrics & Targets
- **ROI Target**: 22% first year
- **Monthly Visitors**: 50,000 unique visitors by end of year
- **Conversion Rate**: 3.2%
- **Average Order Value (AOV)**: €85
- **Uptime**: 99.9% annual availability
- **Page Load Time**: <3 seconds on 4G networks

---

## 💰 Revenue Streams

1. **Commission from Sales**
   - **Retail customers**: 7% commission
   - **Registered businesses**: 0% commission (competitive advantage)

2. **Business Subscriptions**
   - **Basic**: €29/month - Core marketplace features
   - **Professional**: €79/month - Enhanced analytics and branding
   - **Premium**: €149/month - Full feature suite with priority support

3. **Producer Services**
   - Brand development and consultation
   - Professional photography and content creation
   - Marketing campaign management
   - SEO optimization services

4. **Premium Promotion**
   - Featured product placements
   - Newsletter highlighting
   - Homepage banner opportunities
   - Social media amplification

---

## 🚀 Technical Architecture

### Current Production Stack
```yaml
Backend:
  Framework: Laravel 11.45.2
  Language: PHP 8.2+
  Database: PostgreSQL 15
  Authentication: Laravel Sanctum
  Cache: Redis 7
  Queue: Laravel Horizon

Frontend:
  Framework: Next.js 15.5.0
  Runtime: Node.js 18+
  Language: TypeScript 5
  UI: React 19
  Styling: Tailwind CSS
  State: React Query + Context API

Infrastructure:
  Containers: Docker + Docker Compose
  CI/CD: GitHub Actions
  Testing: PHPUnit + Playwright E2E
  Monitoring: Laravel Telescope
  Analytics: Custom implementation
```

### Deployment Configuration
```yaml
Ports:
  Backend API: 8001
  Frontend Dev: 3001
  Frontend CI: 3030
  Database: 5432

Environment Variables:
  NEXT_PUBLIC_API_BASE_URL: Backend API endpoint
  NEXT_PUBLIC_SITE_URL: Frontend domain
  DATABASE_URL: PostgreSQL connection
  REDIS_URL: Cache connection
```

---

## 🎨 Unique Differentiators

### 1. 📖 Product Origin Stories
Every product includes detailed origin information with:
- **QR Code traceability** linking to production timeline
- **Visual storytelling** with photos and videos from the farm
- **Producer profiles** with personal stories and farming philosophy
- **Environmental impact metrics** and sustainability practices

### 2. 🎥 Virtual Farm Experiences
- **Pre-recorded tours** of production facilities
- **Live streaming sessions** during harvest or production
- **Educational content** about farming techniques and traditions
- **Seasonal updates** showing the full production cycle

### 3. 🌱 Adoption Programs
Customers can "adopt" and receive regular products from:
- **Individual olive trees** with personalized oil bottles
- **Beehives** with honey and beeswax products
- **Garden plots** with seasonal vegetable boxes
- **Livestock** with meat, dairy, and wool products

### 4. 💎 Price Transparency
Complete cost breakdown showing:
- **Producer share** (typically 80-85%)
- **Platform commission** (7% retail, 0% business)
- **Payment processing** fees
- **Shipping costs** and carbon footprint

### 5. 🤝 Collaborative Production
- **Pre-order campaigns** for limited or seasonal products
- **Community funding** for new product development
- **Bulk ordering** with group discounts
- **Custom products** based on community requests

### 6. 🎓 Education & Community
- **Producer workshops** and masterclasses
- **Recipe sharing** and cooking tutorials
- **Community forums** for producers and consumers
- **Local events** and farmers market integration

### 7. ♻️ Circular Economy Features
- **Packaging return programs** with deposit systems
- **Carbon footprint calculator** for each order
- **Zero-waste challenges** and rewards
- **Local delivery optimization** to reduce emissions

---

## 👥 User Personas & Journeys

### Primary Personas

#### 🛍️ **Maria - Conscious Consumer**
- **Age**: 35-45, Urban professional with family
- **Goals**: Healthy, authentic food for family; support local economy
- **Pain Points**: Difficulty finding genuine local products; unclear provenance
- **Journey**: Discovers through social media → Explores producer stories → Makes first purchase → Becomes regular subscriber

#### 🚜 **Yannis - Small Producer**
- **Age**: 45-60, Traditional farmer transitioning to direct sales
- **Goals**: Better margins; direct customer relationships; digital presence
- **Pain Points**: Limited digital skills; logistics complexity; marketing costs
- **Journey**: Learns about platform → Sets up profile with help → Lists products → Builds customer base

#### 🏢 **Elena - Restaurant Owner**
- **Age**: 30-50, Professional chef or restaurant manager
- **Goals**: Unique, high-quality ingredients; reliable supply; cost management
- **Pain Points**: Inconsistent quality from distributors; high markup costs
- **Journey**: Registers business account → Explores premium products → Places bulk orders → Develops supplier relationships

---

## 📱 Core Features & Functionality

### Producer Dashboard
- **Product Management**: CRUD operations with rich media upload
- **Order Processing**: Status tracking and fulfillment workflow
- **Analytics**: Sales metrics, customer insights, performance tracking
- **Content Tools**: Story creation, photo management, video upload
- **Financial Reporting**: Revenue tracking, commission calculations, payout management

### Consumer Experience
- **Product Discovery**: Search, filter, and recommendation engine
- **Producer Profiles**: Detailed stories, certifications, and reviews
- **Shopping Cart**: Save for later, bulk pricing, shipping calculations
- **Order Tracking**: Real-time updates from producer to delivery
- **Community Features**: Reviews, Q&A, producer interaction

### Business Tools
- **Bulk Ordering**: Volume discounts and custom pricing
- **Procurement Management**: Regular orders and supplier relationships
- **Invoicing**: Automated business documentation
- **Account Management**: Team access and budget controls

---

## 🔐 Security & Compliance

### Data Protection
- **GDPR Compliance**: Full user data rights and deletion capabilities
- **SSL/TLS Encryption**: All communications secured with HTTPS
- **Data Minimization**: Only collect necessary information
- **Regular Audits**: Quarterly security assessments

### Authentication & Authorization
- **Multi-factor Authentication**: SMS and email verification
- **Role-based Access Control**: Producer, Consumer, Business, Admin roles
- **Session Management**: Secure token handling with Laravel Sanctum
- **API Security**: Rate limiting and request validation

### Payment Security
- **PCI DSS Compliance**: Through Stripe integration
- **Fraud Detection**: Automated transaction monitoring
- **Secure Storage**: No sensitive payment data stored locally
- **Audit Trail**: Complete transaction logging

---

## 📊 Analytics & Monitoring

### Business Intelligence
- **Revenue Analytics**: Track commissions, subscriptions, and growth
- **Producer Metrics**: Performance, satisfaction, and retention
- **Consumer Behavior**: Purchasing patterns and preferences
- **Market Insights**: Category trends and seasonal patterns

### Technical Monitoring
- **Application Performance**: Response times and error rates
- **Infrastructure Health**: Server metrics and resource utilization
- **User Experience**: Page load times and conversion funnels
- **Security Events**: Failed logins and suspicious activity

### Quality Assurance
- **E2E Test Coverage**: Comprehensive Playwright test suite
- **API Testing**: Automated backend test validation
- **Performance Testing**: Load testing and capacity planning
- **User Acceptance Testing**: Regular stakeholder validation

---

## 🚦 Quality Gates & Standards

### Development Standards
- **Code Coverage**: Minimum 80% for critical paths
- **Type Safety**: Strict TypeScript configuration
- **Code Quality**: ESLint, Prettier, and PHPStan validation
- **Documentation**: All APIs documented with OpenAPI

### Release Criteria
- ✅ All tests passing (unit, integration, E2E)
- ✅ Security scan completion
- ✅ Performance benchmarks met
- ✅ Accessibility compliance (WCAG 2.1 AA)
- ✅ Mobile responsiveness validated

### Production Readiness
- ✅ Database migrations tested
- ✅ Environment configuration validated
- ✅ Monitoring and alerting configured
- ✅ Backup and recovery procedures tested

---

## 🗺️ Roadmap Integration

### Phase 1: Foundation (Completed ✅)
- Core marketplace functionality
- Producer and consumer onboarding
- Basic payment processing
- Essential security features

### Phase 2: Enhancement (Current)
- Advanced analytics dashboard
- Mobile app development
- Enhanced producer tools
- Community features expansion

### Phase 3: Scale (Planned)
- Multi-language support (English, German)
- International shipping
- B2B marketplace features
- API marketplace for third-party integrations

---

## 🔧 Feature Flags & Configuration

### Current Feature Toggles
```yaml
# Shipping Options
SHIPPING_ENABLE_LOCKERS: true
SHIPPING_ENABLE_COD: true
LOCKER_DISCOUNT_EUR: 2.50

# Payment Processing
PAYMENT_PROVIDER: "stripe"  # stripe|paypal|both

# Courier Integrations
COURIER_ACS_ENABLED: true
COURIER_GENIKI_ENABLED: false
COURIER_ELTA_ENABLED: true
```

### Environment Configuration
```yaml
# API Configuration
NEXT_PUBLIC_API_BASE_URL: "https://api.dixis.gr"
NEXT_PUBLIC_SITE_URL: "https://dixis.gr"

# Database
DATABASE_URL: "postgresql://user:pass@host:5432/dixis"
REDIS_URL: "redis://host:6379"

# External Services
STRIPE_PUBLIC_KEY: "pk_live_..."
STRIPE_SECRET_KEY: "sk_live_..."
```

---

## 📈 Success Metrics & KPIs

### User Engagement
- **Monthly Active Users (MAU)**: Target 25,000+ by Q4 2025
- **Producer Retention**: 85% monthly retention rate
- **Consumer Retention**: 70% quarterly retention rate
- **Average Session Duration**: 8+ minutes

### Business Performance
- **Gross Merchandise Value (GMV)**: €2.5M annually
- **Take Rate**: 5.8% blended commission rate
- **Customer Acquisition Cost (CAC)**: <€25
- **Customer Lifetime Value (CLV)**: €340

### Operational Excellence
- **Order Fulfillment Rate**: >99%
- **Average Delivery Time**: 2.3 days
- **Customer Support Response**: <2 hours
- **Platform Uptime**: 99.9%

---

## 🎯 Success Criteria

### Business Goals
- ✅ **Revenue Growth**: 15% month-over-month for 6 consecutive months
- ✅ **Market Penetration**: 500+ active producers by end of year
- ✅ **Customer Satisfaction**: >4.5/5.0 average rating
- ✅ **Regional Coverage**: All major Greek cities served

### Technical Goals
- ✅ **Performance**: Sub-3-second page loads maintained
- ✅ **Reliability**: Zero critical downtime events
- ✅ **Security**: No data breaches or security incidents
- ✅ **Scalability**: Handle 10x current traffic without degradation

---

## 🔄 Change Log vs Previous PRD

### Major Updates from v1

#### Technology Stack Modernization
- **Database**: Migrated from MySQL 8.0 to PostgreSQL 15 for better JSON handling and performance
- **Framework**: Upgraded Laravel 10.x to Laravel 11.45.2 with latest security features
- **Frontend**: Updated to Next.js 15.5.0 with React 19 and improved App Router
- **TypeScript**: Full strict mode implementation for better code quality

#### Architecture Improvements
- **Authentication**: Enhanced Laravel Sanctum implementation with MFA support
- **API Design**: RESTful API with OpenAPI documentation
- **Caching Strategy**: Redis implementation for session and data caching
- **Queue Management**: Laravel Horizon for reliable background job processing

#### Operational Enhancements
- **CI/CD Pipeline**: Comprehensive GitHub Actions with E2E testing
- **Monitoring**: Laravel Telescope integration for debugging and performance tracking
- **Feature Flags**: Environment-based configuration management
- **Security**: Regular security audits and automated vulnerability scanning

#### Business Model Evolution
- **Commission Structure**: Refined to 0% for businesses, 7% for consumers
- **Subscription Tiers**: Introduced Business, Professional, and Premium plans
- **Producer Services**: Expanded to include marketing and branding support
- **International Expansion**: Planned multi-language and currency support

#### User Experience Improvements
- **Mobile-First Design**: Responsive design with PWA capabilities
- **Accessibility**: WCAG 2.1 AA compliance implementation
- **Performance**: Sub-3-second load times across all pages
- **Personalization**: AI-driven product recommendations and discovery

---

**Document Maintained By**: Engineering Team
**Review Schedule**: Quarterly
**Next Review**: 2025-12-25

---

🎯 **Generated with Claude Code** — This PRD v2 reflects the current production state and operational reality of the Dixis platform, incorporating lessons learned from implementation and addressing configuration management challenges identified in recent health scans.