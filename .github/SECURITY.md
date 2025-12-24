# Security Policy

## Secrets Management

### CRITICAL: No Secrets in Logs/Output

**NEVER** print, echo, grep, or display secrets in:
- Terminal output
- Log files
- CI/CD workflow logs
- Documentation
- Git commits

### Protected Environment Variables

The following variables contain sensitive data and must NEVER be exposed:

- `DATABASE_URL` / `DATABASE_URL_PRODUCTION`
- `NEON_DATABASE_PASSWORD`
- Any variable containing credentials, tokens, or API keys

### Safe Practices

✅ **DO:**
- Use placeholders: `<DB_URL_REDACTED>`, `<PASSWORD_REDACTED>`
- Store secrets in GitHub Secrets (repository or environment level)
- Use `sed -i` for in-place .env updates without printing
- Verify secrets are not in diffs before committing

❌ **DON'T:**
- `cat .env` or `grep DATABASE_URL .env`
- `echo $DATABASE_URL` or similar commands
- Include connection strings in error messages
- Commit `.env` files to version control

### Incident Response

If a secret is exposed:
1. **IMMEDIATE**: Rotate the credential (change password/regenerate key)
2. Update all systems using the old credential
3. Update GitHub Secrets with new value
4. Document the incident and mitigation in `docs/OPS/STATE.md`

### Database Connection Security

**Neon PostgreSQL Connection:**
- Always use **direct endpoint** (without `-pooler`) for production
- Direct endpoint format: `ep-{name}.{region}.aws.neon.tech`
- Pooled endpoint causes `SELECT FOR UPDATE` transaction failures
- Connection string stored in GitHub Secret: `DATABASE_URL_PRODUCTION`

## Vulnerability Reporting

If you discover a security vulnerability, please email: [security contact here]

Do NOT open a public GitHub issue for security vulnerabilities.
