# Project-Dixis Ownership & Review Guide

**Purpose**: Clear governance for code review, ownership changes, and quality gates  
**Based on**: [`CODEOWNERS`](../../CODEOWNERS) file and [domain architecture](../architecture/CODE-MAP.md)

## 📋 How CODEOWNERS Works

### Automatic Review Requests
- **All PRs**: Require review from `@panagiotiskourkoutis` and `@lomendor` (global fallback)
- **Domain PRs**: Require review from specific domain owners (e.g., auth changes need `@panagiotiskourkoutis`)
- **Multi-domain PRs**: Require review from ALL affected domain owners

### Review Gates
```bash
# Example: Cart domain change
touch frontend/src/components/cart/CartSummary.tsx
# → Requires @panagiotiskourkoutis review

# Example: Multi-domain change
touch frontend/src/components/cart/CartSummary.tsx backend/app/Models/Order.php
# → Requires @panagiotiskourkoutis AND @lomendor review
```

## 🎯 Domain Ownership (Current)

| Domain | Owner(s) | Responsibility |
|--------|----------|----------------|
| **Authentication** | `@panagiotiskourkoutis` | AuthContext, login/register, guards |
| **Products** | `@lomendor` | Product catalog, search, validation |
| **Cart & Checkout** | `@panagiotiskourkoutis` | Shopping cart, checkout flow (high churn) |
| **Producer** | `@lomendor` | Producer dashboard, analytics |
| **Shipping** | `@lomendor` | Courier integrations, delivery methods |
| **Payment** | `@lomendor` | Stripe integration, refunds (security-critical) |
| **Admin** | `@panagiotiskourkoutis` `@lomendor` | **TBD - needs dedicated owner** |
| **Analytics** | `@panagiotiskourkoutis` `@lomendor` | **TBD - needs dedicated owner** |
| **E2E Testing** | `@panagiotiskourkoutis` | Playwright, smoke tests |
| **CI/CD** | `@panagiotiskourkoutis` `@lomendor` | GitHub Actions, deployment |

## 🔄 Changing Domain Ownership

### Process
1. **Propose**: Open issue with title `[OWNERSHIP] Transfer <domain> ownership to @new-owner`
2. **Document**: Explain reasoning (expertise, availability, domain knowledge)
3. **Transition**: Current owner provides knowledge transfer session
4. **Update**: Modify `CODEOWNERS` file and merge via PR
5. **Announce**: Post in team channel/Discord about ownership change

### Requirements
- [ ] **Domain expertise**: New owner understands domain deeply
- [ ] **Availability**: Can respond to urgent issues within 24h
- [ ] **Context**: Has been involved in recent domain changes
- [ ] **Backup**: Identify secondary owner for bus factor mitigation

## 📝 PR Review Guidelines

### Required Reviews
- **1 approval minimum** for non-critical paths
- **2 approvals required** for:
  - Security-critical changes (auth, payment)
  - High-churn files (`package.json`, `routes/api.php`, `cart/page.tsx`)
  - Breaking changes or schema migrations
  - CI/CD pipeline modifications

### Review Standards
- [ ] **Functional**: Does the code work as intended?
- [ ] **Quality**: Follows project conventions and best practices?
- [ ] **Tests**: Adequate test coverage for changes?
- [ ] **Docs**: Updates documentation if behavior changes?
- [ ] **Performance**: No obvious performance regressions?
- [ ] **Security**: No introduced vulnerabilities?

### Merge Requirements
```yaml
# Branch protection (should be configured)
required_reviewers: 1
dismiss_stale_reviews: true
require_code_owner_reviews: true
required_status_checks:
  - frontend-ci
  - backend-ci
  - typecheck
```

## 🚨 Escalation Process

### Ownership Disputes
1. **Discussion**: Open GitHub discussion thread
2. **Mediation**: Technical lead (`@panagiotiskourkoutis`) makes decision
3. **Timeline**: Maximum 72h for resolution

### Review Bottlenecks
- **Urgency**: Ping domain owner in team chat/Discord
- **Absence**: Secondary owner can approve (document reasoning)
- **Emergency**: Technical lead can override (followed by post-mortem)

## 🛡️ Quality Gates & CI Integration

### PR Template Integration
- **Domain checkbox**: Must select affected domains from [PR template](../../.github/PULL_REQUEST_TEMPLATE.md)
- **Review matching**: GitHub automatically requests reviews based on CODEOWNERS
- **Status checks**: All CI jobs must pass before merge

### High-Risk Path Protection
```bash
# These paths require extra scrutiny
/frontend/src/contexts/AuthContext.tsx     # Auth state
/backend/routes/api.php                    # API contracts
/frontend/src/components/cart/**           # High churn area
/backend/app/Services/Payment/**           # Security critical
/.github/workflows/**                      # CI/CD changes
```

## 📊 Ownership Health Metrics

### Monthly Review
- **Review time**: Average time to first review by domain
- **Knowledge bus factor**: # of people who can review each domain
- **Churn analysis**: Files changing most frequently need stronger ownership
- **Ownership gaps**: Domains without clear primary owner

### TBD Domains (Action Required)
- **Admin Dashboard**: Growing feature set, needs dedicated owner
- **Analytics**: Business-critical insights, needs product-minded owner

## 🔗 Related Documentation
- [Domain Architecture](../architecture/CODE-MAP.md) - Technical domain breakdown
- [PR Template](../../.github/PULL_REQUEST_TEMPLATE.md) - Required checklist
- [High-Churn Analysis](../architecture/CODE-MAP.md#high-churn-files-last-60-days) - Risk areas

---

**Last Updated**: 2025-09-25  
**Next Review**: Monthly (assign calendar reminder)  
**Owner**: `@panagiotiskourkoutis` (governance process owner)
