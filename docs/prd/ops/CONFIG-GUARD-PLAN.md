# CI Configuration Guard Plan

Purpose
- Prevent configuration drift across docs, CI, and code by enforcing canonical ports, environment variable names, and feature flags policy.

Scope
- Ports: canonical FE=3001, API=8001 (block :3000 and :3030 in repository config/docs/scripts).
- Env names: enforce `NEXT_PUBLIC_SITE_URL` as canonical (flag `NEXT_PUBLIC_APP_URL` as invalid).
- Flags: document policy for `NEXT_PUBLIC_E2E` (either implement and register, or remove) and maintain a FLAGS registry.

Proposed CI Job (pseudo-yaml)
```yaml
jobs:
  config-guard:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check canonical ports
        run: |
          set -euo pipefail
          # Flag any non-canonical dev ports in code/docs/scripts
          if grep -R --line-number -E ":3000|:3030" . ; then
            echo "Found non-canonical ports (:3000 or :3030). Use 3001 for FE and 8001 for API." >&2
            exit 1
          fi

      - name: Check canonical env names
        run: |
          set -euo pipefail
          if grep -R --line-number "NEXT_PUBLIC_APP_URL" . ; then
            echo "Use NEXT_PUBLIC_SITE_URL instead of NEXT_PUBLIC_APP_URL" >&2
            exit 1
          fi

      - name: Verify flags registry
        run: |
          set -euo pipefail
          test -f docs/prd/ops/FLAGS-REGISTRY.md || (echo "FLAGS-REGISTRY missing (docs/prd/ops/FLAGS-REGISTRY.md)" >&2; exit 1)
          # Optional policy check: ensure NEXT_PUBLIC_E2E is listed if used
          if rg -n "NEXT_PUBLIC_E2E" -S . >/dev/null ; then
            rg -n "^[-*] NEXT_PUBLIC_E2E\b" -S docs/prd/ops/FLAGS-REGISTRY.md >/dev/null || (echo "NEXT_PUBLIC_E2E used but not documented in FLAGS-REGISTRY" >&2; exit 1)
          fi

      - name: Secret scanning
        uses: zricethezav/gitleaks-action@v2
```

Failure Messages & Remediation
- Non-canonical ports found (3000/3030): align to FE=3001, API=8001 in config/docs/scripts. Update docs/reports and local scripts accordingly.
- NEXT_PUBLIC_APP_URL detected: replace with NEXT_PUBLIC_SITE_URL; update README/docs accordingly.
- FLAGS-REGISTRY missing: add `docs/prd/ops/FLAGS-REGISTRY.md` with bullet list of public flags (name, owner, purpose, default, lifecycle). Include `NEXT_PUBLIC_E2E` if used.
- NEXT_PUBLIC_E2E used but not documented: add it to FLAGS-REGISTRY or remove usage if policy decides to deprecate.
- Secret scanning violations: rotate and remove leaked tokens/secrets; add them to CI secrets store only.

Adoption Plan
- Land this plan as docs-only now. Wire the job in CI after E2E stabilization PRs (#235, #232) to avoid noise.
- Start as non-blocking (warn only), then promote to required check after 2 consecutive green weeks.
- Owners ensure docs/code alignment before flipping to required.

Owners
- @panagiotiskourkoutis
- @lomendor

