# PROJECT DIXIS - ARCHITECTURAL DECISIONS

## 🎯 Strategic Decisions Log

### Integration Test Strategy
**Decision**: Integration cookie expiry normalization moved to separate PR  
**Context**: PR-88c-2A focuses on API client + unit tests. Integration layer has cookie timestamp issues.  
**Rationale**: Keep PRs focused and ≤300 LOC. Unit tests + MSW smoke tests provide sufficient coverage.  
**Impact**: Smoke tests remain green with MSW. Integration issues tracked separately.  
**Next**: Follow-up issue "E2E integration cookie expiry normalization"  

### Testing Layer Strategy  
**Decision**: MSW for smoke tests, comprehensive unit tests for API validation  
**Context**: Need stable CI without backend dependency  
**Rationale**: MSW provides deterministic mocking, unit tests ensure validation coverage  
**Impact**: 16/16 unit tests passing, smoke tests green, no backend flakiness  
**Outcome**: Zero CI failures related to backend timing issues  

### Greek Market Localization
**Decision**: Embedded Greek validation in core API client  
**Context**: Target Greek marketplace with postal codes, currencies, error messages  
**Rationale**: First-class Greek support from core rather than addon  
**Impact**: Native 5-digit postal code validation, Greek error messages, EUR formatting  
**Benefit**: Production-ready for Greek market deployment  

### Checkout API Architecture  
**Decision**: Zod-first validation with `ValidatedApiResponse<T>` pattern  
**Context**: Need type-safe validation with runtime error handling  
**Rationale**: Single source of truth for validation, consistent error handling  
**Impact**: Compile-time + runtime safety, Greek locale error messages  
**Outcome**: Zero TypeScript errors, comprehensive validation coverage  

**Last Updated**: 2025-09-06 20:36:00 UTC