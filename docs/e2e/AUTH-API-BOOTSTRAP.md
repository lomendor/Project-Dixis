---
title: E2E — API-first Auth (Laravel/Sanctum)
last_updated: 2025-09-30
---

# API-first Login (Laravel/Sanctum)

Στόχος: να γίνει bootstrap του auth μέσω API (χωρίς UI) ώστε τα E2E να χρησιμοποιούν storageState με έγκυρα cookies. Κλειδί: εναρμόνιση hosts σε 127.0.0.1 για FE και API.

## Προϋποθέσεις
- API host: `http://127.0.0.1:8001`
- FE host: `http://127.0.0.1:3030` (CI canonical) ή `3001` τοπικά.
- Το Laravel/Sanctum εκδίδει cookies: `XSRF-TOKEN`, `laravel_session`.

## Βασικά Βήματα με curl (cookie jar)
Χρησιμοποιούμε cookie jar για διατήρηση XSRF & session.

1) Απόκτηση CSRF cookie
   - `GET {API_BASE}/sanctum/csrf-cookie` → αναμένουμε `200` και cookie `XSRF-TOKEN` στο jar.
   - Παράδειγμα:
     - `curl -i -c jar.txt -b jar.txt "http://127.0.0.1:8001/sanctum/csrf-cookie"`

2) Login (δοκίμασε διαδοχικά endpoints)
   - Πρώτα: `POST {API_BASE}/login`
   - Εναλλακτικά: `POST {API_BASE}/api/v1/auth/login`
   - Header: `X-XSRF-TOKEN: <token>` (url-decoded από το cookie `XSRF-TOKEN`)
   - Body: `email=<...>&password=<...>` (form-encoded)
   - Παράδειγμα:
     - `curl -i -c jar.txt -b jar.txt -H "X-XSRF-TOKEN: <token>" -H "Content-Type: application/x-www-form-urlencoded" --data "email=<EMAIL>&password=<PASSWORD>" "http://127.0.0.1:8001/login"`
   - Αν το πρώτο endpoint δεν δώσει 2xx, δοκίμασε το δεύτερο.

3) Επιβεβαίωση cookies
   - Ελέγχουμε στο jar ότι υπάρχουν cookie names: `XSRF-TOKEN` και προαιρετικά `laravel_session`.
   - Τα ονόματα παραμένουν ίδια, οι τιμές διαφέρουν ανά run.

## Χαρτογράφηση προς storageState (για χρήση από E2E)
- Το `storageState` πρέπει να περιέχει τουλάχιστον τα cookies `XSRF-TOKEN` και, όπου ισχύει, `laravel_session` για το domain του API/FE.
- Ο Claude θα υλοποιήσει εξαγωγή cookies από το jar σε JSON (Playwright storage state) και φόρτωσή του πριν τα specs.

## Ερμηνεία Αποτυχίας
- Απουσία `XSRF-TOKEN`: πιθανό πρόβλημα στο `sanctum/csrf-cookie` (CORS/host/route).
- Απουσία `laravel_session` μετά από επιτυχές login: ελέγξτε endpoint/credentials/CSRF header.
- Redirect σε UI `/auth/login` κατά τα E2E: συνήθως λανθασμένο baseURL ή cookies σε διαφορετικό host από 127.0.0.1.

## Αυτοματοποιημένο βοήθημα
- Δείτε `scripts/curl-auth.sh` για αυτοματοποίηση των παραπάνω (cookie jar, XSRF extraction, fallback endpoints).

