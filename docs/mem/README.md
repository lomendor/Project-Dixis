# 🧠 PROJECT-DIXIS MEMORY (MEM) PILOT

**Shared Knowledge Base for Claude/Codex/AI Agents**

## 📋 PURPOSE

The `docs/mem/` directory contains a structured knowledge base designed for AI agents to quickly access critical project information through MCP (Model Context Protocol) or direct file queries. This pilot system provides curated, summarized information from across the Project-Dixis codebase.

## 🏗️ STRUCTURE

```
docs/mem/
├── README.md                 ← This file
├── FILTERS.md                ← Privacy/security filters
├── prd/PRD.md               ← Product requirements digest
├── architecture/MAP.md      ← System architecture overview
├── flags/REGISTRY.md        ← Environment flags registry
├── runbooks/E2E.md          ← E2E testing procedures
├── rca/CI-RCA.md           ← CI failure root cause analysis
└── glossary/TESTIDS.md     ← Critical test selector catalog
```

## 🤖 USAGE IN PROMPTS

### 1. Checkout Test IDs & Selectors
```
Use MEM to fetch all checkout testIDs and their corresponding selectors.
Need: data-testid values for cart, shipping, payment flows.
```
**References**: [[TESTIDS]] → checkout-cta, shipping-name-input, continue-to-review-btn

### 2. Environment Flags Registry
```
Use MEM for registry of env flags and where they're consumed.
Need: flag names, defaults, consuming files/components.
```
**References**: [[REGISTRY]] → NEXT_PUBLIC_E2E, ALLOW_TEST_LOGIN, APP_ENV

### 3. Quick RCA on Flaky Checkout
```
Use MEM for quick RCA on flaky checkout (links to traces).
Need: common failure patterns, stabilization patches, test utilities.
```
**References**: [[CI-RCA]] → auth flow failures, timeout patterns, cart seeding issues

## 📖 KNOWLEDGE DOMAINS

| Domain | File | Content |
|--------|------|---------|
| **Product** | [[PRD]] | Goals, MVP scope, non-functional requirements |
| **Architecture** | [[MAP]] | FE/BE domains, ports, API flows |
| **Testing** | [[E2E]], [[TESTIDS]] | Test procedures, selectors, common fixes |
| **Operations** | [[CI-RCA]], [[REGISTRY]] | CI failures, env flags, debugging |
| **Security** | [[FILTERS]] | What NOT to expose in AI interactions |

## 🔍 SEARCH PATTERNS

**By Test ID**: `grep -r "data-testid" docs/mem/`
**By Flag**: `grep -r "NEXT_PUBLIC\|APP_ENV" docs/mem/`
**By Component**: `grep -r "checkout\|shipping\|cart" docs/mem/`

## 🎯 DESIGN PRINCIPLES

- **≤200 lines per file**: Digestible summaries, not full dumps
- **Wiki-links**: `[[page-name]]` for cross-references
- **Code references**: Link to actual files via relative paths
- **Filter-aware**: Respects privacy constraints in [[FILTERS]]
- **Version-stable**: Test IDs and core patterns, not implementation details

## 🚀 FUTURE ENHANCEMENTS

- **Interactive queries**: MCP-based semantic search
- **Auto-updates**: CI pipeline to refresh from source changes
- **Metrics**: Track which knowledge is most frequently accessed
- **Validation**: Automated checks that links/references stay current

## 🔗 EXTERNAL REFERENCES

- **Full PRD**: `../../PRD-Dixis-Τελικό.docx` (if exists)
- **API Docs**: `../../API.md`
- **CI Reports**: `../../reports/2025-09-*/`
- **E2E Tests**: `../../frontend/tests/e2e/`

---

**Generated**: 2025-09-27 | **Status**: PILOT | **Scope**: Repository-only