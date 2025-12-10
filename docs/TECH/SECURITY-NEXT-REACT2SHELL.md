# Security Advisory: React2Shell (CVE-2025-55182 / CVE-2025-66478)

**Date Applied**: 2025-12-10
**Severity**: 🔴 CRITICAL (CVSS 10.0)
**Status**: ✅ PATCHED

---

## Summary

Applied security patches for **React2Shell** vulnerability (CVE-2025-55182 / CVE-2025-66478), a critical remote code execution (RCE) vulnerability in React Server Components and Next.js App Router.

This vulnerability allows **unauthenticated attackers** to execute arbitrary code on the server via insecure deserialization of malicious HTTP requests, with a near **100% success rate**. Active exploitation by China state-nexus threat groups was observed within hours of public disclosure on December 3, 2025.

---

## Vulnerability Details

### **CVE-2025-55182** (React Server Components)
- **Affected**: React 19.0.0, 19.1.0, 19.1.1, 19.2.0
- **Patched**: React 19.0.1, 19.1.2, 19.2.1
- **Impact**: Unsafe deserialization in React Flight allows unauthenticated RCE
- **CVSS**: 10.0 (Critical)
- **Disclosure**: December 3, 2025

### **CVE-2025-66478** (Next.js)
- **Affected**: Next.js 15.x, 16.x (pre-patch versions)
- **Patched**: 15.0.5, 15.1.9, 15.2.6, 15.3.6, 15.4.8, **15.5.7**, 16.0.7
- **Impact**: React Server Components vulnerability exploitable via Next.js App Router
- **Active Exploitation**: Crypto miners, Linux backdoors, reverse proxies deployed

---

## Dixis Project - Patch Applied

### **Before (VULNERABLE ⚠️)**
```json
{
  "next": "15.5.0",          // ❌ VULNERABLE
  "react": "19.1.0",         // ❌ VULNERABLE
  "react-dom": "19.1.0"      // ❌ VULNERABLE
}
```

### **After (PATCHED ✅)**
```json
{
  "next": "15.5.7",          // ✅ PATCHED (Dec 3, 2025)
  "react": "19.1.2",         // ✅ PATCHED (Dec 3, 2025)
  "react-dom": "19.1.2"      // ✅ PATCHED (Dec 3, 2025)
}
```

### **Upgrade Strategy**
- **Minimal jump**: Stayed within same minor version (15.5.x, 19.1.x)
- **Breaking changes**: NONE - Patch versions maintain full backward compatibility
- **Build status**: ✅ All checks passed (type-check, lint, build)
- **E2E tests**: Not run (VPS down, will verify after deployment)

---

## Verification Steps

### **Local Verification** ✅
1. **Dependencies installed**: `pnpm install` completed successfully
2. **TypeScript compilation**: `pnpm type-check` passed (no errors)
3. **ESLint validation**: `pnpm lint` passed (pre-existing warnings only)
4. **Production build**: `pnpm build` passed (103 routes compiled, 103 kB JS)

### **Post-Deployment Verification** (PENDING ⏳)
After VPS recovery/reinstall:
1. Deploy patched build to staging/production
2. Run E2E smoke tests: `pnpm e2e:smoke`
3. Monitor logs for 24h for:
   - Unexpected RCE attempts (401/403 responses)
   - Unusual CPU spikes
   - Unauthorized processes (`xmrig`, `bot.*`, etc.)
4. Verify with `npm list react react-dom next` on production server

---

## Timeline Context

### **Dixis Incident Timeline**
- **Dec 6, 2025**: DDoS incident + crypto miner detected on VPS
- **Dec 10, 2025 (early)**: Background build completed, VPS went down
- **Dec 10, 2025 (13:00 EET)**: Hostinger suspected malware detection, VPS stopped
- **Dec 10, 2025 (21:00 EET)**: **THIS PATCH APPLIED** (local repo)

### **CVE Timeline**
- **Nov 29, 2025**: Vulnerability responsibly disclosed to Meta
- **Dec 3, 2025**: Public disclosure + patches released
- **Dec 4, 2025**: Proof-of-concept exploits publicly available
- **Dec 4-10, 2025**: Widespread exploitation by threat actors

**Impact**: The Dixis VPS was likely compromised via React2Shell between Dec 6-10, explaining the persistent crypto miner and eventual VPS suspension.

---

## Threat Actor Activity (In-the-Wild)

Per security researchers (Huntress, AWS, Trend Micro):
- **Earth Lamia** (China-nexus APT)
- **Jackpot Panda** (China-nexus APT)
- **PeerBlight Linux Backdoor** deployed
- **Crypto miners** (xmrig, custom miners)
- **Reverse proxy tunnels** for persistence
- **Go-based post-exploitation implants**

---

## Future Upgrade Guidelines

### **For Next.js Upgrades:**
1. **Check security advisories** before upgrading:
   - https://nextjs.org/blog (official blog)
   - https://vercel.com/changelog (Vercel changelog)
   - https://github.com/vercel/next.js/security/advisories
2. **Stay within same major version** unless required (e.g., 15.x → 15.latest)
3. **Test thoroughly**:
   - `pnpm type-check`
   - `pnpm lint`
   - `pnpm build`
   - `pnpm e2e:smoke`
4. **Monitor for 24h** after production deployment

### **For React Upgrades:**
1. **Always match React + React-DOM versions** (e.g., both 19.1.2)
2. **Check React blog** for security releases: https://react.dev/blog
3. **Avoid pre-release versions** in production (e.g., RC, beta)
4. **Test RSC-specific features** (Server Components, Server Actions)

### **Security Best Practices:**
1. **Subscribe to security mailing lists**:
   - GitHub Security Advisories (watch repos)
   - CVE databases (NIST NVD)
   - Security researchers (Huntress, Wiz, etc.)
2. **Automated dependency scanning**:
   - GitHub Dependabot alerts (already enabled)
   - `npm audit` in CI/CD
   - Consider: Snyk, Socket.dev for real-time alerts
3. **Incident response plan**:
   - VPS monitoring (CPU, network, processes)
   - Automated alerts for suspicious activity
   - Backup/restore procedures
   - Clean reinstall checklist (see: `docs/OPS/INCIDENT-2025-12-DDOS-and-ChunkError.md`)

---

## References

### **Official Advisories**
- [React Blog: Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- [Vercel: Summary of CVE-2025-55182](https://vercel.com/changelog/cve-2025-55182)
- [NVD: CVE-2025-55182](https://nvd.nist.gov/vuln/detail/CVE-2025-55182)

### **Security Research**
- [Wiz: React2Shell (CVE-2025-55182) Critical Vulnerability](https://www.wiz.io/blog/critical-vulnerability-in-react-cve-2025-55182)
- [Wiz: React2Shell Deep Dive - Exploit Mechanics](https://www.wiz.io/blog/nextjs-cve-2025-55182-react2shell-deep-dive)
- [Datadog: CVE-2025-55182 - Remote Code Execution in React Server Components](https://securitylabs.datadoghq.com/articles/cve-2025-55182-react2shell-remote-code-execution-react-server-components/)
- [Huntress: PeerBlight Linux Backdoor Exploits React2Shell](https://www.huntress.com/blog/peerblight-linux-backdoor-exploits-react2shell)
- [Trend Micro: CVE-2025-55182 Analysis & In-the-Wild Exploitation](https://www.trendmicro.com/en_us/research/25/l/CVE-2025-55182-analysis-poc-itw.html)
- [AWS: China-nexus Groups Rapidly Exploit React2Shell Vulnerability](https://aws.amazon.com/blogs/security/china-nexus-cyber-threat-groups-rapidly-exploit-react2shell-vulnerability-cve-2025-55182/)

### **Tools & Utilities**
- [Official Patch Utility](https://github.com/vercel/next.js): `npx fix-react2shell-next`
- [JFrog: React2Shell - All You Need to Know](https://jfrog.com/blog/2025-55182-and-2025-66478-react2shell-all-you-need-to-know/)

---

## Related Documentation

- `docs/OPS/INCIDENT-2025-12-DDOS-and-ChunkError.md` - Dec 6-10 VPS incident report
- `docs/OPS/STATE.md` - Current production state
- `docs/AGENT/SUMMARY/Pass-AUTH-CORE-0.md` - Previous security pass (Dec 10)

---

**⚠️ CRITICAL REMINDER**: This patch must be deployed to production IMMEDIATELY after VPS recovery. Do not restart the VPS with vulnerable Next.js 15.5.0 code.

**Next Actions**:
1. ✅ Local patch applied (this document)
2. ⏳ VPS recovery/reinstall (Scenario A or B from incident plan)
3. ⏳ Deploy patched build to production
4. ⏳ Run post-deployment verification
5. ⏳ Monitor for 24h

---

**Document Version**: 1.0
**Last Updated**: 2025-12-10 21:30 EET
**Maintained By**: Dixis Security Team
