# ADR-002 — Error Handling
## Απόφαση
Typed errors (`AppError`) με κωδικούς `CHECKOUT_RATE_UNAVAILABLE`, `PAYMENT_DECLINED` κ.λπ., user-safe μηνύματα.
## Λόγοι
Σαφή observability & UX χωρίς διαρροή τεχνικών λεπτομερειών.
## Συνέπειες
Χαρτογράφηση σε HTTP + retries/backoff όπου ταιριάζει.
