# PR #213 Status Report (2025-09-20)

**PR**: https://github.com/lomendor/Project-Dixis/pull/213
**Branch**: ci/consolidate-workflows
**Status**: ❌ FAILURES DETECTED

## Check Results Summary

| Check | Status | Link |
|-------|--------|------|
| frontend-tests | ⏭️ SKIPPED | [frontend-tests](https://github.com/lomendor/Project-Dixis/actions/runs/17879976357/job/50846394606) |
| e2e-tests | ⏭️ SKIPPED | [e2e-tests](https://github.com/lomendor/Project-Dixis/actions/runs/17879976357/job/50846394661) |
| lighthouse | ❌ FAILURE | [lighthouse](https://github.com/lomendor/Project-Dixis/actions/runs/17879976329/job/50846390677) |
| e2e-tests | ❌ FAILURE | [e2e-tests](https://github.com/lomendor/Project-Dixis/actions/runs/17879976315/job/50846390678) |
| type-check | ❌ FAILURE | [type-check](https://github.com/lomendor/Project-Dixis/actions/runs/17879976357/job/50846390745) |
| danger | ✅ SUCCESS | [danger](https://github.com/lomendor/Project-Dixis/actions/runs/17879976317/job/50846390686) |

## Failing Jobs

- **lighthouse**: https://github.com/lomendor/Project-Dixis/actions/runs/17879976329/job/50846390677
- **e2e-tests**: https://github.com/lomendor/Project-Dixis/actions/runs/17879976315/job/50846390678
- **type-check**: https://github.com/lomendor/Project-Dixis/actions/runs/17879976357/job/50846390745

## Next Steps
- Review failing job logs
- Fix issues found in CI checks
- Re-run workflows after fixes
- Only merge after all required checks pass ✅
