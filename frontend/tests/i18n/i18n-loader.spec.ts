import { describe, it, expect } from '@jest/globals';
import messages from '../../messages/el.json';

describe('i18n messages structure', () => {
  it('should load Greek messages', () => {
    expect(messages).toBeDefined();
    expect(typeof messages).toBe('object');
  });

  it('should have nested home keys', () => {
    expect(messages.home).toBeDefined();
    expect(messages.home.title).toBe('Dixis — Φρέσκα τοπικά προϊόντα');
    expect(messages.home.subtitle).toContain('παραγωγούς');
  });

  it('should have nested nav keys', () => {
    expect(messages.nav).toBeDefined();
    expect(messages.nav.home).toBe('Αρχική');
    expect(messages.nav.products).toBe('Προϊόντα');
    expect(messages.nav.producers).toBe('Παραγωγοί');
  });

  it('should have products.filters keys', () => {
    expect(messages.products?.filters).toBeDefined();
    expect(messages.products.filters.title).toBe('Φίλτρα');
    expect(messages.products.filters.search).toBeDefined();
    expect(messages.products.filters.category).toBeDefined();
    expect(messages.products.filters.apply).toBe('Εφαρμογή');
  });

  it('should have products.pagination keys', () => {
    expect(messages.products?.pagination).toBeDefined();
    expect(messages.products.pagination.prev).toBe('Προηγούμενη');
    expect(messages.products.pagination.next).toBe('Επόμενη');
  });

  it('should have common keys', () => {
    expect(messages.common).toBeDefined();
    expect(messages.common.loading).toBe('Φόρτωση…');
    expect(messages.common.error).toBeDefined();
    expect(messages.common.submit).toBe('Υποβολή');
    expect(messages.common.cancel).toBe('Ακύρωση');
  });

  it('should not have flat keys with dots', () => {
    // Verify all top-level keys are proper namespaces, not dot-separated strings
    const keys = Object.keys(messages);
    keys.forEach(key => {
      expect(key).not.toContain('.');
    });
  });
});
