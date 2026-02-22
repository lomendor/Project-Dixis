'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'dixis-cookie-consent';

/**
 * Minimal cookie consent banner for Greek ePrivacy compliance (Law 4624/2019).
 * Only shows once — dismissed state stored in localStorage.
 * Dixis uses only essential cookies (session, auth) — no tracking/advertising.
 */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if user hasn't already accepted
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Ενημέρωση για cookies"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 shadow-lg px-4 py-3 sm:py-4"
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <p className="text-sm text-neutral-700 flex-1">
          Χρησιμοποιούμε μόνο απαραίτητα cookies λειτουργικότητας (σύνδεση, καλάθι).
          Δεν χρησιμοποιούμε cookies παρακολούθησης ή διαφήμισης.{' '}
          <Link
            href="/privacy"
            className="text-primary underline hover:text-primary/80"
          >
            Πολιτική Απορρήτου
          </Link>
        </p>
        <button
          onClick={handleAccept}
          className="shrink-0 bg-primary text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          data-testid="cookie-accept"
        >
          Κατάλαβα
        </button>
      </div>
    </div>
  );
}
