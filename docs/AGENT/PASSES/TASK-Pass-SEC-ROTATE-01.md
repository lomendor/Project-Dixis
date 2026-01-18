# Pass SEC-ROTATE-01 — SSH Key Rotation + Lockdown

**When**: 2026-01-15

## Goal

Rotate SSH keys after miner incident. Remove unknown access paths, enforce key-only access.

## Why

Post-incident security hygiene. Old keys may have been compromised or exposed. Fresh keys reduce attack surface.

## How

1. **Generated new ed25519 keypair locally**
   - Key: dixis_prod_ed25519_20260115
   - Comment: dixis-prod-20260115

2. **Installed new public key on VPS**
   - Appended to /root/.ssh/authorized_keys
   - Tested login with new key (SUCCESS)

3. **Removed old keys**
   - Backed up: authorized_keys.bak.20260115
   - Kept only: dixis-prod-20260115 fingerprint
   - Old keys removed:
     - dixis-main-key@kourkoutisp.gmail.com
     - dixis-prod-20251105

4. **Verified lockdown**
   - SSHD config: permitrootlogin=without-password, passwordauthentication=no
   - fail2ban: active (sshd jail)
   - Old key: rejected (Permission denied)

## Definition of Done

- [x] New ed25519 keypair generated locally
- [x] New public key installed on VPS
- [x] Login with NEW key verified
- [x] Old keys removed from authorized_keys
- [x] OLD key rejected (Permission denied)
- [x] SSHD config: key-only, no password
- [x] Docs: STATE + NEXT-7D + SUMMARY updated

## PRs

| PR | Title | Status |
|----|-------|--------|
| TBD | docs(security): Pass SEC-ROTATE-01 SSH key rotation | PENDING |
