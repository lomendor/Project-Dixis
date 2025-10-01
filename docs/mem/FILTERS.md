# 🔒 MEMORY FILTERS & PRIVACY CONSTRAINTS

**Security Guidelines for AI Memory Retrieval**

## 🚨 CRITICAL: ALWAYS FILTER WHEN RETRIEVING VIA MEM

When retrieving information through the MEM system, **ALWAYS** apply these filtering rules to protect sensitive information.

## 🛡️ FILTERING RULES

### 1. **Access Tokens & API Keys**
- ❌ **NEVER EXPOSE**: JWT tokens, Bearer tokens, API keys, authentication secrets
- ❌ **PATTERNS TO HIDE**: `eyJ*`, `pk_*`, `sk_*`, `token=*`, `Bearer *`
- ✅ **SAFE ALTERNATIVE**: `[REDACTED_TOKEN]` or `***`

### 2. **Personal Identifiable Information (PII)**
- ❌ **NEVER EXPOSE**: Real email addresses, phone numbers, customer names
- ❌ **EXAMPLES**: `panagiotis@example.com`, `+30 210 1234567`, `Δημήτρης Παπαδόπουλος`
- ✅ **SAFE ALTERNATIVE**: `user@example.com`, `+XX XXX XXXXXX`, `Test User`

### 3. **Financial & Business Data**
- ❌ **NEVER EXPOSE**: Exact revenue figures, profit margins, pricing strategies
- ❌ **EXAMPLES**: `€15,247 monthly revenue`, `23% profit margin`
- ✅ **SAFE ALTERNATIVE**: `€XX,XXX revenue`, `XX% margin`

### 4. **Private Infrastructure Details**
- ❌ **NEVER EXPOSE**: Production URLs, private server IPs, internal domains
- ❌ **EXAMPLES**: `api.dixis.gr`, `172.16.0.1`, `internal-admin.company.com`
- ✅ **SAFE ALTERNATIVE**: `api.example.com`, `XXX.XXX.X.X`, `[PRIVATE_DOMAIN]`

### 5. **Database Credentials & Configs**
- ❌ **NEVER EXPOSE**: Database passwords, connection strings, env secrets
- ❌ **EXAMPLES**: `DB_PASSWORD=secret123`, `postgres://user:pass@host`
- ✅ **SAFE ALTERNATIVE**: `DB_PASSWORD=[REDACTED]`, `postgres://[CREDENTIALS]@host`

### 6. **Client & Partner Information**
- ❌ **NEVER EXPOSE**: Real client names, partner details, contract specifics
- ❌ **EXAMPLES**: Company XYZ contract, Partner ABC integration
- ✅ **SAFE ALTERNATIVE**: Client A, Partner B, [CLIENT_NAME]

### 7. **Security Vulnerabilities & Exploits**
- ❌ **NEVER EXPOSE**: Specific security holes, exploit details, vulnerability reports
- ❌ **EXAMPLES**: SQL injection vectors, authentication bypass methods
- ✅ **SAFE ALTERNATIVE**: Security issue (details omitted), Authentication fix applied

### 8. **Internal Process & Strategy**
- ❌ **NEVER EXPOSE**: Internal roadmaps, competitive analysis, strategic decisions
- ❌ **EXAMPLES**: "We're planning to undercut competitor X", "Internal goal: 50% market share"
- ✅ **SAFE ALTERNATIVE**: Business objectives (details private), Competitive positioning

## 🎯 IMPLEMENTATION GUIDELINES

### **When Responding to MEM Queries:**

1. **Scan output** for patterns matching the above rules
2. **Replace sensitive data** with safe alternatives
3. **Preserve context** while removing specifics
4. **Flag when filtering** is applied: `[FILTERED FOR PRIVACY]`

### **Example Filter Application:**

**❌ BEFORE FILTERING:**
```
Database connection: postgres://dixis_user:MySecret123@production-db.internal:5432/dixis_prod
Client: Acme Corp contract worth €250,000 annually
API_KEY=pk_live_51HyveH2eZvKYlo2CwJRFZPzk2qOlPO
```

**✅ AFTER FILTERING:**
```
Database connection: postgres://[USER]:[PASSWORD]@[HOST]:5432/[DATABASE]
Client: [CLIENT_NAME] contract worth €XXX,XXX annually [FILTERED FOR PRIVACY]
API_KEY=[REDACTED_TOKEN]
```

## 🔄 AUTO-FILTERING PATTERNS

### **Regex Patterns to Auto-Filter:**
```
# Tokens
/(eyJ[A-Za-z0-9-_+/]+={0,2})/g → [JWT_TOKEN]
/(pk_[a-zA-Z0-9]{32,})/g → [API_KEY]
/(sk_[a-zA-Z0-9]{32,})/g → [SECRET_KEY]

# Email addresses (preserve test domains)
/([a-zA-Z0-9._%+-]+@(?!(?:example|test|localhost))[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g → [EMAIL]

# URLs (preserve localhost/example)
/(https?:\/\/(?!(?:localhost|127\.0\.0\.1|example\.com))[a-zA-Z0-9.-]+)/g → [PRIVATE_URL]

# Currency amounts > €1000
/(€[0-9]{4,}[,.]?[0-9]*)/g → €[AMOUNT]
```

## 🔍 VALIDATION CHECKLIST

Before sharing MEM-retrieved information:

- [ ] No real tokens or API keys exposed
- [ ] No actual customer PII included
- [ ] No specific financial figures revealed
- [ ] No private infrastructure details shown
- [ ] No client/partner names mentioned
- [ ] No security vulnerability details exposed
- [ ] Context preserved despite filtering
- [ ] Filtering applied consistently

## ⚠️ ESCALATION

If uncertain about whether information should be filtered:
1. **ERR ON SIDE OF CAUTION** → Filter it
2. **Ask for clarification** if context is lost
3. **Document edge cases** for future rule updates

---

**Updated**: 2025-09-27 | **Applies to**: All MEM retrieval operations