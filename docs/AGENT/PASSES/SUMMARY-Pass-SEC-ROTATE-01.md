# Pass SEC-ROTATE-01 Summary

**Date**: 2026-01-15
**Status**: COMPLETE

## What We Did

1. **Generated New SSH Keypair**
   - Type: ed25519
   - Local path: ~/.ssh/dixis_prod_ed25519_20260115
   - Fingerprint: SHA256:MekIeMpn3V3e0wFMnG1M0NXj+914kZFZipBp9oFxqME

2. **Key Rotation on VPS**
   - Appended new key to authorized_keys
   - Tested new key login (SUCCESS)
   - Removed old keys (2 removed)
   - Created backup: authorized_keys.bak.20260115

3. **Lockdown Verified**
   - SSHD: permitrootlogin=without-password, passwordauthentication=no
   - fail2ban: active (19 total banned, 0 current)
   - Old key test: Permission denied (SUCCESS)

## Keys Removed

| Fingerprint | Comment | Status |
|-------------|---------|--------|
| SHA256:Y1NzLFQXzXvwaiPw7sqgkrMG43xSLFT8Oan55ewMUvw | dixis-main-key@kourkoutisp.gmail.com | REMOVED |
| SHA256:KrAQdzHHlh0/GUvONv3Y/5ULgz04h6C6VrC8cHDyy78 | dixis-prod-20251105 | REMOVED |

## Key Retained

| Fingerprint | Comment | Status |
|-------------|---------|--------|
| SHA256:MekIeMpn3V3e0wFMnG1M0NXj+914kZFZipBp9oFxqME | dixis-prod-20260115 | ACTIVE |

## Verification

```
NEW key login: SUCCESS
OLD key login: Permission denied (SUCCESS - rejected)
SSHD config: key-only access enforced
fail2ban: active
```

## Impact

- All previous SSH keys invalidated
- Only new key (dixis-prod-20260115) can access VPS
- Attack surface reduced after miner incident
