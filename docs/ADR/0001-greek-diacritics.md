# ADR-0001: Greek diacritics in checkout validation
**Status:** Proposed (tests-only alignment), no production change  
**Context:** Current `CheckoutFormSchema` regex `/^[Α-Ωα-ωA-Za-z\s\-']+$/u` does **not** allow accented Greek (e.g. 'ά','ή').  
**Decision (now):** Keep production regex **as-is**. Adjust tests to unaccented data. Add tests documenting rejection of accented input.  
**Consequences:** Users with diacritics may see validation errors. Product decision required to normalize/allow accents later.  
**Next:** Open issue "Allow Greek diacritics via normalization (NFD → ASCII or whitelist)" with UX/i18n input.
