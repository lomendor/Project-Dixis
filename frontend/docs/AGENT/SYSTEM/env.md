# Environment Variables

## Authentication & Session

- **ADMIN_PHONES** — λίστα τηλεφώνων (comma-separated, E.164) με admin πρόσβαση.
  Αν δεν οριστεί (dev/CI), ο guard είναι permissive. Σε production **πρέπει** να οριστεί.

- **PRODUCER_PHONES** — λίστα τηλεφώνων (comma-separated, E.164) με producer πρόσβαση στο `/me/*`.
  Αν δεν οριστεί (dev/CI), ο guard είναι permissive (όλοι οι authenticated χρήστες έχουν πρόσβαση).
  Σε production, οριστε τα τηλέφωνα των παραγωγών για να περιορίσετε την πρόσβαση.
  Παράδειγμα: `PRODUCER_PHONES="+306912345678,+306987654321"`

## Email / SMTP

- **SMTP_HOST / SMTP_PORT / SMTP_SECURE / SMTP_USER / SMTP_PASS / SMTP_FROM** — ρυθμίσεις SMTP για αποστολή emails.
  Αν λείπουν → η αποστολή γίνεται **noop** (λογκάρει μόνο).
- **SMTP_DEV_MAILBOX**=1 — γράφει την τελευταία αποστολή σε `frontend/.tmp/last-mail.json` για γρήγορο έλεγχο.
- **DEV_MAIL_TO** — προαιρετικό default recipient σε dev.

## Orders & Admin

- ADMIN_ORDERS_PAGE_SIZE — default page size για pagination στο admin orders list (default: 20)

## Shipping

- SHIPPING_FLAT_EUR — flat fee για μεταφορικά (default: 3.5)
- SHIPPING_FREE_OVER_EUR — threshold για δωρεάν μεταφορικά (default: 35)

## Payment

- STRIPE_SECRET_KEY — Stripe secret key (future)
- STRIPE_PUBLISHABLE_KEY — Stripe publishable key (future)
