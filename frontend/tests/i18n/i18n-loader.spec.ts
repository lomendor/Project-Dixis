import { test, expect } from '@playwright/test';
import messages from '../../messages/el.json';

test('Greek messages load & are nested', async () => {
  expect(messages && typeof messages === 'object').toBeTruthy();

  // Δεν πρέπει να υπάρχουν flat keys με τελείες
  const hasDotKeys = Object.keys(messages as any).some(k => k.includes('.'));
  expect(hasDotKeys).toBeFalsy();

  // Ελάχιστα υποχρεωτικά nested keys
  const m: any = messages;
  expect(m?.home?.title).toBeTruthy();
  expect(m?.common?.submit).toBeTruthy();
  expect(m?.nav?.producers).toBeTruthy();
  expect(m?.products?.filters).toBeTruthy();
});
