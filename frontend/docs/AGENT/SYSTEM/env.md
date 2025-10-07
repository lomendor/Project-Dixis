# Environment Variables

## Authentication & Session

- ADMIN_PHONES — λίστα τηλεφώνων (comma-separated, E.164) με admin πρόσβαση.  
  Αν δεν οριστεί (dev/CI), ο guard είναι permissive. Σε production **πρέπει** να οριστεί.

## Orders & Admin

- ADMIN_ORDERS_PAGE_SIZE — default page size για pagination στο admin orders list (default: 20)

## Shipping

- SHIPPING_FLAT_EUR — flat fee για μεταφορικά (default: 3.5)
- SHIPPING_FREE_OVER_EUR — threshold για δωρεάν μεταφορικά (default: 35)

## Payment

- STRIPE_SECRET_KEY — Stripe secret key (future)
- STRIPE_PUBLISHABLE_KEY — Stripe publishable key (future)
