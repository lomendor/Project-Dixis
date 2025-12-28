# Pass 53 - Order Email Notifications

**Date**: 2025-12-28
**Status**: COMPLETE
**PR**: (pending)

## Problem Statement

Users and producers receive no email confirmation when an order is placed. This creates uncertainty about order status and makes it harder for producers to track incoming orders.

## Solution

### Feature Flag Approach
Email notifications are behind a feature flag (`EMAIL_NOTIFICATIONS_ENABLED=false` by default). This ensures:
- Production safety until SMTP is configured
- No runtime crashes if mail config is missing
- Can be enabled per-environment

### Two Email Types

1. **Consumer Order Confirmation** (`ConsumerOrderPlaced`)
   - Sent to buyer after successful checkout
   - Greek content (EL-first market)
   - Contains: order summary, items, totals, shipping info, payment method

2. **Producer New Order Notification** (`ProducerNewOrder`)
   - Sent to each producer with items in the order
   - Contains ONLY that producer's items (privacy/relevance)
   - Includes shipping address, customer name, item details

### Idempotency
- `order_notifications` table tracks sent notifications
- Unique key: (order_id, recipient_type, recipient_id, event)
- Prevents double-sends on retries/webhook replays

### Graceful Failure
- Missing email addresses are logged, not thrown
- Email failures don't crash order creation
- Order is always created even if email fails

## Files Changed

| File | Type | Description |
|------|------|-------------|
| `database/migrations/2025_12_28_180000_...` | New | Idempotency table |
| `config/notifications.php` | New | Feature flag + mail config |
| `app/Mail/ConsumerOrderPlaced.php` | New | Consumer confirmation mailable |
| `app/Mail/ProducerNewOrder.php` | New | Producer notification mailable |
| `app/Models/OrderNotification.php` | New | Idempotency model |
| `app/Services/OrderEmailService.php` | New | Email sending logic |
| `resources/views/emails/orders/consumer-placed.blade.php` | New | Consumer email template |
| `resources/views/emails/orders/producer-new-order.blade.php` | New | Producer email template |
| `app/Http/Controllers/Api/V1/OrderController.php` | Modified | Hook email service after commit |
| `backend/.env.example` | Modified | Add EMAIL_NOTIFICATIONS_ENABLED |
| `tests/Feature/OrderEmailNotificationTest.php` | New | 8 tests |

## How to Enable

### Backend (.env)
```bash
# Enable email notifications
EMAIL_NOTIFICATIONS_ENABLED=true

# Configure SMTP (or use Resend/other provider)
MAIL_MAILER=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=your-username
MAIL_PASSWORD=your-password
MAIL_FROM_ADDRESS=no-reply@dixis.gr
MAIL_FROM_NAME=Dixis
```

### Optional: Queue Emails
```bash
EMAIL_QUEUE_ENABLED=true
EMAIL_QUEUE_NAME=emails

# Run queue worker
php artisan queue:work --queue=emails
```

## Testing

### Unit Tests (8 tests, 15 assertions)
- Feature flag disables sending
- Consumer confirmation sent
- Producer notification sent
- Idempotency prevents double-sends
- Multiple producers each get email
- Missing consumer email handled gracefully
- Missing producer email handled gracefully
- Producer email contains only their items

### Manual Testing
```bash
# Enable in .env
EMAIL_NOTIFICATIONS_ENABLED=true
MAIL_MAILER=log  # Logs to storage/logs/laravel.log

# Create order and check logs
php artisan tinker
> App\Models\Order::latest()->first()->id  # Get latest order ID
# Check storage/logs/laravel.log for email content
```

## Email Content (Greek)

### Consumer Email
- Subject: "Επιβεβαίωση Παραγγελίας #123 - Dixis"
- Header: "Ευχαριστούμε για την παραγγελία σας!"
- Sections: Order details, items, shipping, totals
- Footer: Dixis branding

### Producer Email
- Subject: "Νέα Παραγγελία #123 - Dixis"
- Header: "Νέα Παραγγελία!"
- Sections: Items for this producer only, shipping info
- Alert: "Παρακαλούμε ετοιμάστε τα προϊόντα για αποστολή"

## Risks

| Risk | Mitigation |
|------|------------|
| Email provider failure | Graceful failure, order still created |
| Double-sends | Idempotency table prevents |
| Missing emails | Logged warning, no crash |
| SMTP not configured | Feature flag OFF by default |

## Next Passes

- **Pass 54**: Order status update emails (shipped, delivered)
- **Pass 55**: Weekly digest for producers

---
Generated-by: Claude (Pass 53)
