# CI — GitHub Actions

Τι τρέχει:
- **Playwright e2e** με αυτόματο `webServer` (build + start στη 3000).
- ENV για SQLite, bypass OTP, site URL, VAT/Shipping.
- Chromium μόνο (για ταχύτητα).

Συνήθη σφάλματα:
- Αν σπάσουν tests που διαβάζουν dev mailbox: ορίστε `DEV_MAIL_TO` σε ένα άδειο string ώστε να κάνουν skip.
- Αν αλλάξει port/baseURL, ενημέρωσε `playwright.config.ts` ή τα ENV του workflow.

Πράσινα checks ⇒ merge ασφαλές.
