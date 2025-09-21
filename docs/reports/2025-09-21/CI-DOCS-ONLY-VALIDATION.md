# CI Docs-only Validation (2025-09-21)

This file tests docs-only change behavior against main branch.

Expected behavior:
- **Without guardrails**: All workflows will run (current main)
- **With guardrails**: Workflows should skip due to paths-ignore

Test purpose: Validate paths-ignore functionality works correctly.

Created: 2025-09-21T12:00:57+03:00