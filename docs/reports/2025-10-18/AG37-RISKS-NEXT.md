# AG37-RISKS-NEXT — Admin CSV Smart Filename

**Date**: 2025-10-18
**Pass**: AG37
**Risk Assessment**: MINIMAL 🟢

---

## 🎯 CHANGE SUMMARY

Add dynamic CSV export filenames based on active filters (date, ordNo, method, status, etc.).

**Scope**: API route + UI component + E2E test
**LOC Changed**: ~90 lines (+40 API, +50 UI)
**Files Modified**: 2 existing, 1 new test

---

## 🔍 RISK ANALYSIS

### 1. Security Risks 🟢 MINIMAL

**Filename Injection Attack**
- **Risk**: Special characters in filter values could manipulate filename
- **Mitigation**: `safePart()` sanitizes all inputs (alphanumeric + dash/underscore/dot only)
- **Max Length**: Each part limited to 60 chars
- **Verdict**: 🟢 LOW RISK

**Path Traversal**
- **Risk**: Directory traversal via `../../` in filename
- **Mitigation**: `safePart()` removes slashes, `parseOrderNo()` validates format
- **Verdict**: 🟢 LOW RISK

**Header Injection**
- **Risk**: CRLF injection in Content-Disposition header
- **Mitigation**: `safePart()` removes newlines, Next.js Response API escapes headers
- **Verdict**: 🟢 LOW RISK

---

### 2. Performance Risks 🟢 MINIMAL

**Client-Side Filename Calculation**
- **Impact**: New useEffect runs on every filter change
- **Cost**: <1ms (simple string operations)
- **Verdict**: 🟢 NEGLIGIBLE

**Server-Side Filename Generation**
- **Impact**: +10 lines of string processing per export
- **Cost**: <1ms (executes after CSV generation)
- **Verdict**: 🟢 NEGLIGIBLE

---

### 3. Compatibility Risks 🟢 MINIMAL

**Browser Support**
- **Feature**: HTML5 download attribute
- **Support**: All modern browsers (Chrome 14+, Firefox 20+, Safari 10.1+)
- **Fallback**: Server Content-Disposition header (100% support)
- **Verdict**: 🟢 NO COMPATIBILITY ISSUES

**Filename Length**
- **Risk**: Some filesystems have max filename length (e.g., 255 chars)
- **Protection**: Each part limited to 60 chars, total unlikely to exceed 200 chars
- **Verdict**: 🟢 LOW RISK

---

### 4. Data Integrity Risks 🟢 NONE

**CSV Content**
- **Change**: NONE (only filename changed)
- **Data**: Identical CSV output
- **Verdict**: 🟢 NO RISK

**Export Accuracy**
- **Change**: NONE (filter logic unchanged)
- **Data**: Same rows exported
- **Verdict**: 🟢 NO RISK

---

### 5. UX Risks 🟢 MINIMAL

**Filename Too Long**
- **Risk**: Very long filenames if many filters applied
- **Example**: `orders_2025-10-18_courier_paid_q-john_pc-10431.csv` (53 chars)
- **Mitigation**: Each part limited to 60 chars
- **Verdict**: 🟢 LOW RISK

**Filename Confusion**
- **Risk**: Users might not understand filename format
- **Mitigation**: Consistent pattern, self-documenting (date + filters)
- **Verdict**: 🟢 LOW RISK (improvement over "orders.csv")

---

## 📊 RISK MATRIX

| Risk Category | Severity | Likelihood | Overall |
|---------------|----------|------------|---------|
| Security      | Low      | Very Low   | 🟢 MINIMAL |
| Performance   | Negligible | N/A     | 🟢 MINIMAL |
| Compatibility | Low      | Very Low   | 🟢 MINIMAL |
| Data Integrity| None     | None       | 🟢 NONE |
| UX            | Low      | Low        | 🟢 MINIMAL |

**Overall Risk Level**: 🟢 **MINIMAL** (Safe to merge)

---

## 🚀 NEXT STEPS

### Immediate Next Steps (After AG37 Merge)
1. ✅ Monitor first few exports for filename edge cases
2. ✅ Verify CI passes E2E test
3. ✅ No further action required

### Optional Future Enhancements (Not Urgent)
1. **Filename truncation UI hint**: Show calculated filename before export
2. **Custom filename input**: Allow admin to override filename
3. **Export history**: Track past exports with timestamps

**Priority**: 🔵 LOW (current implementation sufficient)

---

## 🔗 INTEGRATION RISKS

### AG33 Integration 🟢 COMPATIBLE
- **Feature**: Remember filters (URL + localStorage)
- **Impact**: Filename reflects persisted filters
- **Risk**: NONE (complementary features)

### AG36 Integration 🟢 COMPATIBLE
- **Feature**: Keyboard shortcuts
- **Impact**: Shortcuts change filters → filename updates
- **Risk**: NONE (expected behavior)

### AG36.1 Integration 🟢 COMPATIBLE
- **Feature**: 1-based pagination
- **Impact**: NONE (pagination not in filename)
- **Risk**: NONE (independent features)

---

## ✅ PRE-MERGE CHECKLIST

- [x] E2E test covers main use case (Order No filter)
- [x] Input sanitization (`safePart()`) implemented
- [x] Max length protection (60 chars per part)
- [x] Client-side logic mirrors server logic
- [x] Backward compatible (defaults to `orders.csv` if no filters)
- [x] No breaking changes to existing exports
- [x] CI will verify test passes

---

## 🎯 ROLLBACK PLAN (If Needed)

**Rollback Complexity**: 🟢 TRIVIAL

**Steps to Rollback**:
1. Revert API route changes (remove `safePart()` and filename logic)
2. Revert UI changes (remove `downloadName` state and effect)
3. Remove E2E test

**Impact**: NONE (feature only affects filename, not functionality)

**Estimated Time**: <5 minutes

---

## 📈 SUCCESS METRICS

### Post-Merge Validation
1. **E2E Test Pass**: Green in CI
2. **No User Reports**: Zero filename-related issues
3. **Admin Feedback**: Positive reception of descriptive filenames

### Monitoring (First Week)
- **CI Test Results**: 100% pass rate expected
- **Error Logs**: No filename-related errors expected
- **User Behavior**: No unusual export patterns

---

## 🔒 SECURITY POSTURE

**Current**: 🟢 SECURE
- Input sanitization: ✅ Implemented
- Path traversal protection: ✅ Implemented
- Header injection protection: ✅ Implicit (Next.js)
- Max length protection: ✅ Implemented

**Post-AG37**: 🟢 SECURE (no degradation)

---

**Risk Level**: 🟢 **MINIMAL - SAFE TO MERGE**

**Generated-by**: Claude Code (AG37 Protocol)
**Timestamp**: 2025-10-18
