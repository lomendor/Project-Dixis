# ⚙️ DIXIS FLAGS & CONFIGURATION — Operational Control Center

**Last Updated**: 2025-09-25
**Version**: 2.0
**Status**: 🔄 Configuration Drift Remediation
**Priority**: 🚨 Critical Infrastructure

---

## 🎯 Configuration Management Philosophy

**Single Source of Truth**: Eliminate configuration drift through centralized management, automated validation, and drift detection. Every configuration change must be documented, validated, and monitored to prevent operational instability.

---

## 🚨 Current Configuration Drift Issues

### 📍 **IDENTIFIED DRIFT PROBLEMS** (from PROJECT-HEALTH-SCAN)

#### Port Configuration Drift
```yaml
❌ CURRENT INCONSISTENT STATE:
  Documentation: FE 3001, API 8001
  CI E2E Tests: Port 3000 (frontend-e2e.yml)
  CI Build Tests: Port 3030 (frontend-ci.yml e2e job)
  Playwright Config: Port 3001 (dev webServer)

✅ CANONICAL RESOLUTION:
  Development: 3001 (Next.js dev server)
  CI Testing: 3030 (isolated CI environment)
  Production: 443 (HTTPS) / 80 (HTTP redirect)
  Backend: 8001 (all environments)
```

#### Environment Variable Naming Drift
```yaml
❌ CURRENT INCONSISTENT STATE:
  Code Uses: NEXT_PUBLIC_SITE_URL
  Docs Reference: NEXT_PUBLIC_APP_URL
  Some Tests Use: Various ad-hoc URLs

✅ CANONICAL RESOLUTION:
  Primary: NEXT_PUBLIC_SITE_URL (frontend domain)
  API: NEXT_PUBLIC_API_BASE_URL (backend API endpoint)
  Deprecated: Remove all references to NEXT_PUBLIC_APP_URL
```

#### Feature Flag Drift
```yaml
❌ CURRENT INCONSISTENT STATE:
  NEXT_PUBLIC_E2E: Referenced in docs but not consumed in code
  Backend Flags: Documented in .env.example but no central registry
  Test Flags: Scattered across different config files

✅ CANONICAL RESOLUTION:
  Central Registry: This document becomes the SSOT
  Code Integration: env.ts consumption for all flags
  Documentation: Single canonical reference point
```

---

## 🔧 CANONICAL CONFIGURATION REGISTRY

### 🌐 Network & Service Configuration
```yaml
# =============================================================================
# NETWORK CONFIGURATION - CANONICAL PORTS
# =============================================================================

Development Ports:
  FRONTEND_DEV_PORT: 3001          # Next.js development server
  BACKEND_DEV_PORT: 8001           # Laravel development server
  DATABASE_PORT: 5432              # PostgreSQL
  REDIS_PORT: 6379                 # Redis cache

CI/Testing Ports:
  FRONTEND_CI_PORT: 3030           # Isolated CI testing
  BACKEND_CI_PORT: 8001            # Same as dev for consistency
  E2E_BASE_PORT: 3030              # Playwright webServer

Production Ports:
  HTTPS_PORT: 443                  # Production HTTPS
  HTTP_PORT: 80                    # Redirect to HTTPS
  API_PORT: 8001                   # Backend API (behind reverse proxy)

# =============================================================================
# URL CONFIGURATION - CANONICAL ENDPOINTS
# =============================================================================

Frontend URLs:
  NEXT_PUBLIC_SITE_URL: "https://dixis.gr"                    # Production
  NEXT_PUBLIC_SITE_URL_DEV: "http://localhost:3001"          # Development
  NEXT_PUBLIC_SITE_URL_CI: "http://localhost:3030"           # CI Testing

Backend URLs:
  NEXT_PUBLIC_API_BASE_URL: "https://api.dixis.gr"           # Production
  NEXT_PUBLIC_API_BASE_URL_DEV: "http://127.0.0.1:8001"      # Development
  NEXT_PUBLIC_API_BASE_URL_CI: "http://127.0.0.1:8001"       # CI Testing

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================

Production Database:
  DATABASE_URL: "postgresql://user:pass@host:5432/dixis_prod"
  DB_CONNECTION: "pgsql"
  DB_HOST: "production-db-host"
  DB_PORT: 5432
  DB_DATABASE: "dixis_production"

Development Database:
  DATABASE_URL: "postgresql://dixis:password@localhost:5432/dixis_dev"
  DB_CONNECTION: "pgsql"
  DB_HOST: "localhost"
  DB_PORT: 5432
  DB_DATABASE: "dixis_development"

Testing Database:
  DATABASE_URL: "postgresql://dixis:password@localhost:5432/dixis_test"
  DB_CONNECTION: "pgsql"
  DB_HOST: "localhost"
  DB_PORT: 5432
  DB_DATABASE: "dixis_testing"

# =============================================================================
# CACHE CONFIGURATION
# =============================================================================

Redis Configuration:
  REDIS_URL: "redis://host:6379"
  CACHE_DRIVER: "redis"
  SESSION_DRIVER: "redis"
  QUEUE_CONNECTION: "redis"
```

---

## 🚩 FEATURE FLAGS REGISTRY

### 🛒 E-Commerce Feature Flags
```yaml
# =============================================================================
# SHIPPING & LOGISTICS FLAGS
# =============================================================================

Shipping Options:
  SHIPPING_ENABLE_LOCKERS: true
    Description: Enable parcel locker delivery options
    Impact: Adds locker selection in checkout flow
    Owner: Logistics Team

  SHIPPING_ENABLE_COD: true
    Description: Enable Cash on Delivery payment option
    Impact: Adds COD payment method in checkout
    Owner: Payments Team

  LOCKER_DISCOUNT_EUR: 2.50
    Description: Discount amount for choosing locker delivery
    Impact: Applied automatically in price calculation
    Owner: Business Team

# =============================================================================
# COURIER INTEGRATION FLAGS
# =============================================================================

Courier Services:
  COURIER_ACS_ENABLED: true
    Description: ACS Courier integration for shipping
    Impact: Shows ACS as shipping option
    Owner: Logistics Integration Team

  COURIER_GENIKI_ENABLED: false
    Description: Geniki Tachydromos courier integration
    Impact: Shows Geniki as shipping option
    Owner: Logistics Integration Team

  COURIER_ELTA_ENABLED: true
    Description: ELTA (Hellenic Post) integration
    Impact: Shows ELTA as shipping option
    Owner: Logistics Integration Team

# =============================================================================
# PAYMENT PROCESSING FLAGS
# =============================================================================

Payment Configuration:
  PAYMENT_PROVIDER: "stripe"
    Description: Primary payment processor
    Options: stripe|paypal|both
    Impact: Determines available payment methods
    Owner: Payments Team

  PAYMENT_ENABLE_APPLE_PAY: false
    Description: Enable Apple Pay integration
    Impact: Shows Apple Pay button in checkout
    Owner: Mobile Team

  PAYMENT_ENABLE_GOOGLE_PAY: false
    Description: Enable Google Pay integration
    Impact: Shows Google Pay button in checkout
    Owner: Mobile Team

# =============================================================================
# USER EXPERIENCE FLAGS
# =============================================================================

Frontend Features:
  FEATURE_ENABLE_DARK_MODE: false
    Description: Enable dark mode theme toggle
    Impact: Adds theme switcher to UI
    Owner: Frontend Team

  FEATURE_ENABLE_PWA: true
    Description: Enable Progressive Web App features
    Impact: Adds PWA manifest and service worker
    Owner: Mobile Team

  FEATURE_ENABLE_NOTIFICATIONS: true
    Description: Enable push notifications
    Impact: Shows notification permission requests
    Owner: Frontend Team
```

### 🧪 Testing & Development Flags
```yaml
# =============================================================================
# TESTING ENVIRONMENT FLAGS
# =============================================================================

E2E Testing:
  NEXT_PUBLIC_E2E: true
    Description: Enable E2E testing mode with special behaviors
    Impact: Adds data-testid attributes, disables rate limiting
    Code Integration: ✅ Must be consumed in env.ts
    Owner: QA Team

  E2E_ENABLE_AUTH_BYPASS: true
    Description: Allow authentication bypass for testing
    Impact: Enables test login functionality
    Environment: Testing only
    Owner: QA Team

  E2E_ENABLE_DEBUG_LOGGING: false
    Description: Enable detailed logging during E2E tests
    Impact: Verbose console output for debugging
    Owner: QA Team

# =============================================================================
# DEVELOPMENT & DEBUGGING FLAGS
# =============================================================================

Development Tools:
  APP_DEBUG: false
    Description: Enable Laravel debug mode
    Environment: Development/Testing only
    Impact: Shows detailed error pages and debug information
    Owner: Backend Team

  LOG_LEVEL: "info"
    Description: Application logging level
    Options: debug|info|notice|warning|error|critical|alert|emergency
    Impact: Controls log verbosity
    Owner: DevOps Team

  TELESCOPE_ENABLED: false
    Description: Enable Laravel Telescope debugging dashboard
    Environment: Development/Staging only
    Impact: Provides detailed application insights
    Owner: Backend Team
```

### 🔒 Security & Compliance Flags
```yaml
# =============================================================================
# SECURITY FEATURE FLAGS
# =============================================================================

Authentication & Security:
  AUTH_ENABLE_2FA: false
    Description: Enable two-factor authentication
    Impact: Adds 2FA setup and verification flows
    Owner: Security Team

  AUTH_ENABLE_SOCIAL_LOGIN: true
    Description: Enable social media login options
    Impact: Shows Google/Facebook login buttons
    Owner: Authentication Team

  SECURITY_ENABLE_RATE_LIMITING: true
    Description: Enable API rate limiting
    Impact: Throttles API requests per user/IP
    Owner: Security Team

  GDPR_STRICT_MODE: true
    Description: Enable strict GDPR compliance mode
    Impact: Additional consent flows and data protection
    Owner: Compliance Team

# =============================================================================
# CONTENT & MODERATION FLAGS
# =============================================================================

Content Management:
  CONTENT_ENABLE_AUTO_MODERATION: false
    Description: Enable automated content moderation
    Impact: Automatic review of user-generated content
    Owner: Content Team

  CONTENT_ENABLE_IMAGE_OPTIMIZATION: true
    Description: Enable automatic image optimization
    Impact: Compresses and optimizes uploaded images
    Owner: Performance Team
```

---

## 🔄 CONFIGURATION DRIFT PREVENTION

### 🛡️ Automated Drift Detection
```yaml
# =============================================================================
# CI/CD DRIFT GUARDS
# =============================================================================

GitHub Actions Guard Jobs:
  config-drift-check:
    Trigger: Every PR
    Validates:
      - Port consistency across all config files
      - Environment variable naming standards
      - Feature flag documentation sync
    Fails PR if: Any drift detected

  environment-validation:
    Trigger: Before deployment
    Validates:
      - All required environment variables present
      - No deprecated variables in use
      - Flag values within acceptable ranges
    Blocks deployment if: Validation fails

# =============================================================================
# RUNTIME DRIFT MONITORING
# =============================================================================

Application Health Checks:
  /api/health/config:
    Purpose: Validate configuration consistency
    Checks:
      - Database connectivity with expected parameters
      - Cache connectivity with expected settings
      - External service endpoints reachable
      - Feature flags loaded correctly
    Response: Configuration health status

  Frontend Config Validation:
    Location: app/config/validation.ts
    Purpose: Validate client-side configuration
    Checks:
      - API base URL accessibility
      - Required environment variables present
      - Feature flags properly loaded
    Alerts: Console warnings for missing config
```

### 📋 Configuration Change Control Process
```yaml
# =============================================================================
# CHANGE MANAGEMENT WORKFLOW
# =============================================================================

Configuration Change Request:
  1. Update This Document: All config changes must update this registry first
  2. Code Implementation: Update env.ts and relevant application code
  3. Testing Validation: Verify changes work in CI environment
  4. Documentation Update: Update deployment guides and runbooks
  5. Staged Rollout: Deploy to staging environment first
  6. Production Deployment: Apply changes with rollback plan ready

Required Approvals:
  Minor Changes (flag toggles): Tech Lead approval
  Major Changes (new services): Architecture approval + Security review
  Infrastructure Changes: DevOps approval + Business stakeholder sign-off

Change Documentation:
  What: Specific configuration parameter changed
  Why: Business justification for the change
  Impact: Systems and users affected by the change
  Rollback: Plan to revert if issues arise
  Testing: Validation performed before deployment
```

---

## 🔧 ENVIRONMENT-SPECIFIC CONFIGURATIONS

### 🏠 Local Development
```yaml
# =============================================================================
# LOCAL DEVELOPMENT ENVIRONMENT
# =============================================================================

Required Environment Variables:
  NEXT_PUBLIC_SITE_URL: "http://localhost:3001"
  NEXT_PUBLIC_API_BASE_URL: "http://127.0.0.1:8001"
  DATABASE_URL: "postgresql://dixis:password@localhost:5432/dixis_dev"
  REDIS_URL: "redis://localhost:6379"

Development-Only Flags:
  APP_DEBUG: true
  TELESCOPE_ENABLED: true
  LOG_LEVEL: "debug"
  NEXT_PUBLIC_E2E: false

Optional Development Tools:
  MAIL_DRIVER: "log"                    # Email debugging
  QUEUE_CONNECTION: "sync"              # Synchronous queue processing
  CACHE_DRIVER: "array"                 # In-memory cache for development
```

### 🧪 CI/Testing Environment
```yaml
# =============================================================================
# CONTINUOUS INTEGRATION ENVIRONMENT
# =============================================================================

CI-Specific Configuration:
  NEXT_PUBLIC_SITE_URL: "http://localhost:3030"
  NEXT_PUBLIC_API_BASE_URL: "http://127.0.0.1:8001"
  DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/dixis_test"
  REDIS_URL: "redis://localhost:6379"

CI-Only Flags:
  APP_DEBUG: false
  TELESCOPE_ENABLED: false
  LOG_LEVEL: "error"
  NEXT_PUBLIC_E2E: true
  E2E_ENABLE_AUTH_BYPASS: true

Testing Optimizations:
  QUEUE_CONNECTION: "sync"              # Synchronous processing for tests
  MAIL_DRIVER: "array"                  # Email testing without sending
  CACHE_DRIVER: "array"                 # Fast in-memory cache
```

### 🚀 Production Environment
```yaml
# =============================================================================
# PRODUCTION ENVIRONMENT
# =============================================================================

Production Configuration:
  NEXT_PUBLIC_SITE_URL: "https://dixis.gr"
  NEXT_PUBLIC_API_BASE_URL: "https://api.dixis.gr"
  DATABASE_URL: "[ENCRYPTED_IN_DEPLOYMENT_SYSTEM]"
  REDIS_URL: "[ENCRYPTED_IN_DEPLOYMENT_SYSTEM]"

Production-Only Settings:
  APP_DEBUG: false
  TELESCOPE_ENABLED: false
  LOG_LEVEL: "warning"
  NEXT_PUBLIC_E2E: false

Security Flags (Production):
  SECURITY_ENABLE_RATE_LIMITING: true
  GDPR_STRICT_MODE: true
  AUTH_ENABLE_2FA: true

Performance Flags (Production):
  CONTENT_ENABLE_IMAGE_OPTIMIZATION: true
  CACHE_DRIVER: "redis"
  QUEUE_CONNECTION: "redis"
```

---

## 🔍 CONFIGURATION VALIDATION SCRIPTS

### 🤖 Automated Validation Tools
```bash
#!/bin/bash
# =============================================================================
# CONFIG VALIDATION SCRIPT - scripts/validate-config.sh
# =============================================================================

echo "🔍 Validating Dixis Configuration..."

# Validate port consistency
echo "📍 Checking port configuration..."
grep -r "3000\|3001\|3030" .github/workflows/ package.json playwright.config.ts
if [ $? -eq 0 ]; then
  echo "❌ Port configuration drift detected!"
  echo "   Standard: Dev=3001, CI=3030, Production=443"
  exit 1
fi

# Validate environment variable naming
echo "🌐 Checking environment variable consistency..."
grep -r "NEXT_PUBLIC_APP_URL" . --exclude-dir=node_modules
if [ $? -eq 0 ]; then
  echo "❌ Deprecated NEXT_PUBLIC_APP_URL found!"
  echo "   Use: NEXT_PUBLIC_SITE_URL instead"
  exit 1
fi

# Validate feature flag documentation
echo "🚩 Checking feature flag documentation sync..."
flags_in_code=$(grep -r "SHIPPING_ENABLE\|COURIER_\|PAYMENT_" backend/config frontend/src/env --count)
flags_in_docs=$(grep -r "SHIPPING_ENABLE\|COURIER_\|PAYMENT_" docs/prd/ops --count)

if [ "$flags_in_code" -ne "$flags_in_docs" ]; then
  echo "❌ Feature flag documentation out of sync!"
  echo "   Code flags: $flags_in_code, Docs flags: $flags_in_docs"
  exit 1
fi

echo "✅ Configuration validation passed!"
```

### 📊 Configuration Health Dashboard
```typescript
// =============================================================================
// CONFIGURATION HEALTH CHECK - frontend/src/lib/config-health.ts
// =============================================================================

export interface ConfigHealth {
  status: 'healthy' | 'warning' | 'critical'
  checks: ConfigCheck[]
  timestamp: string
}

export interface ConfigCheck {
  name: string
  status: 'pass' | 'fail' | 'warn'
  message: string
  impact: 'low' | 'medium' | 'high'
}

export async function validateConfiguration(): Promise<ConfigHealth> {
  const checks: ConfigCheck[] = []

  // Validate API connectivity
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/api/health`)
    checks.push({
      name: 'API Connectivity',
      status: response.ok ? 'pass' : 'fail',
      message: response.ok ? 'API accessible' : `API returned ${response.status}`,
      impact: 'high'
    })
  } catch (error) {
    checks.push({
      name: 'API Connectivity',
      status: 'fail',
      message: 'API unreachable',
      impact: 'high'
    })
  }

  // Validate required environment variables
  const requiredVars = ['NEXT_PUBLIC_SITE_URL', 'NEXT_PUBLIC_API_BASE_URL']
  requiredVars.forEach(varName => {
    const value = process.env[varName]
    checks.push({
      name: `Environment Variable: ${varName}`,
      status: value ? 'pass' : 'fail',
      message: value ? 'Variable set' : 'Missing required variable',
      impact: 'high'
    })
  })

  // Validate deprecated variables
  const deprecatedVars = ['NEXT_PUBLIC_APP_URL']
  deprecatedVars.forEach(varName => {
    const value = process.env[varName]
    if (value) {
      checks.push({
        name: `Deprecated Variable: ${varName}`,
        status: 'warn',
        message: 'Deprecated variable in use',
        impact: 'medium'
      })
    }
  })

  const failedChecks = checks.filter(c => c.status === 'fail')
  const warningChecks = checks.filter(c => c.status === 'warn')

  return {
    status: failedChecks.length > 0 ? 'critical' :
            warningChecks.length > 0 ? 'warning' : 'healthy',
    checks,
    timestamp: new Date().toISOString()
  }
}
```

---

## 🚨 IMMEDIATE REMEDIATION TASKS

### 📅 Phase 1: Critical Drift Resolution (Week 1)
```yaml
High Priority Fixes:
  ✅ Port Standardization:
    - Update frontend-e2e.yml to use port 3030
    - Update frontend-ci.yml to use port 3030
    - Update documentation to reflect 3001/3030 standard
    - Update Playwright config validation

  ✅ Environment Variable Cleanup:
    - Global find/replace NEXT_PUBLIC_APP_URL → NEXT_PUBLIC_SITE_URL
    - Update all documentation references
    - Add validation to prevent regression

  ✅ Feature Flag Integration:
    - Implement NEXT_PUBLIC_E2E consumption in env.ts
    - Create central flag registry in code
    - Update flag documentation in this document
```

### 📅 Phase 2: Drift Prevention (Week 2)
```yaml
Medium Priority Enhancements:
  🔄 CI Validation Guards:
    - Add config-drift-check job to GitHub Actions
    - Implement environment validation script
    - Create PR template checklist for config changes

  🔄 Runtime Monitoring:
    - Implement /api/health/config endpoint
    - Add frontend config validation
    - Create configuration health dashboard

  🔄 Documentation Automation:
    - Auto-generate config docs from code
    - Flag usage tracking and reporting
    - Configuration change impact analysis
```

### 📅 Phase 3: Advanced Management (Week 3-4)
```yaml
Future Enhancements:
  📅 Feature Flag Management:
    - Consider LaunchDarkly or similar service
    - Implement percentage-based rollouts
    - Create business user flag management interface

  📅 Configuration as Code:
    - Terraform/IaC for infrastructure config
    - GitOps workflow for configuration changes
    - Automated rollback on configuration failures

  📅 Observability:
    - Configuration change tracking
    - Performance impact monitoring of flag changes
    - Business metrics correlation with config changes
```

---

## 📚 Configuration Best Practices

### ✅ DO's
```yaml
Configuration Standards:
  ✅ Always update this document first before code changes
  ✅ Use environment-specific configuration files
  ✅ Validate all configuration changes in CI
  ✅ Document the business reason for each flag
  ✅ Use descriptive names with consistent prefixing
  ✅ Set sensible defaults for all configuration
  ✅ Encrypt sensitive configuration in production
  ✅ Version control all configuration documentation
```

### ❌ DON'Ts
```yaml
Configuration Anti-patterns:
  ❌ Never hardcode configuration values in application code
  ❌ Don't create new environment variables without documentation
  ❌ Don't deploy configuration changes without testing
  ❌ Don't use different variable names across environments
  ❌ Don't skip approval process for configuration changes
  ❌ Don't leave deprecated configuration in place
  ❌ Don't forget to clean up temporary feature flags
  ❌ Don't modify production config without proper review
```

---

## 🔄 Review & Maintenance Schedule

### 📅 Regular Reviews
```yaml
Weekly Reviews (Fridays):
  - Configuration drift check
  - New feature flag documentation
  - Deprecated flag cleanup assessment
  - CI configuration validation

Monthly Reviews (First Monday):
  - Full configuration audit
  - Performance impact analysis of flag changes
  - Security review of configuration practices
  - Documentation completeness check

Quarterly Reviews:
  - Configuration architecture assessment
  - Tool evaluation (feature flag services, etc.)
  - Process improvement recommendations
  - Training needs assessment
```

### 🎯 Success Metrics
```yaml
Configuration Health KPIs:
  - Configuration drift incidents: 0 per month
  - Configuration-related production incidents: 0
  - Time to resolve configuration issues: <30 minutes
  - Configuration documentation coverage: 100%
  - Automated validation coverage: >95%
```

---

**Document Owner**: DevOps & Engineering Leadership
**Review Schedule**: Weekly tactical, Monthly strategic
**Next Critical Review**: 2025-10-02 (Post-drift-remediation)

---

🎯 **Generated with Claude Code** — This configuration registry serves as the canonical source of truth for all Dixis operational parameters, providing operational guards against configuration drift while enabling rapid feature development through systematic flag management.