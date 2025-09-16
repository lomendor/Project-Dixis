# 💳 PAYMENT INTEGRATION CODEMAP

**Real Payment Provider Integration (Stripe + Viva) - Code Architecture Map**

## 🏗️ Architecture Overview

The payment system follows a **Provider Factory Pattern** with clean separation between fake (dev/test) and real payment providers, maintaining backward compatibility while adding production-ready Stripe integration.

```
┌─────────────────────────────────────────────────────────────────┐
│                        PAYMENT ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Frontend (Next.js)           Backend (Laravel)                 │
│  ┌─────────────────────┐      ┌─────────────────────────────┐   │
│  │ Cart Page           │────▶ │ PaymentController           │   │
│  │ - Payment Methods   │      │ - initPayment()             │   │
│  │ - COD vs Card       │      │ - confirmPayment()          │   │
│  └─────────────────────┘      │ - cancelPayment()           │   │
│           │                   └─────────────────────────────┘   │
│           ▼                              │                      │
│  ┌─────────────────────┐                 ▼                      │
│  │ Stripe Payment Page │      ┌─────────────────────────────┐   │
│  │ - Payment Elements  │      │ PaymentProviderFactory      │   │
│  │ - Payment Intent    │      │ ┌─────────────────────────┐ │   │
│  └─────────────────────┘      │ │ StripePaymentProvider   │ │   │
│                               │ │ - Real Stripe API       │ │   │
│                               │ └─────────────────────────┘ │   │
│                               │ ┌─────────────────────────┐ │   │
│                               │ │ FakePaymentProvider     │ │   │
│                               │ │ - Dev/Test Mode         │ │   │
│                               │ └─────────────────────────┘ │   │
│                               └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 📂 File Structure

### Backend (Laravel)

```
backend/
├── app/
│   ├── Contracts/
│   │   └── PaymentProviderInterface.php           # Contract for all providers
│   ├── Services/Payment/
│   │   ├── PaymentProviderFactory.php             # Factory pattern implementation
│   │   ├── StripePaymentProvider.php              # Stripe integration
│   │   └── FakePaymentProvider.php               # Dev/test provider
│   └── Http/Controllers/Api/
│       ├── PaymentController.php                  # Payment endpoints
│       └── WebhookController.php                  # Webhook handling
├── database/migrations/
│   └── 2025_09_16_000001_add_payment_intent_id_to_orders_table.php
├── config/
│   └── services.php                               # Payment configuration
└── .env.example                                   # Environment variables
```

### Frontend (Next.js)

```
frontend/
├── src/
│   ├── app/
│   │   ├── cart/page.tsx                         # Updated with payment methods
│   │   └── checkout/payment/[orderId]/page.tsx   # Stripe payment page
│   ├── components/payment/
│   │   ├── StripeProvider.tsx                    # Stripe Elements wrapper
│   │   └── StripePaymentForm.tsx                 # Payment form component
│   ├── lib/
│   │   ├── payment/
│   │   │   └── paymentMethods.ts                 # Payment methods config
│   │   └── api/
│   │       └── payment.ts                        # Payment API client
│   └── tests/
│       └── unit/
│           ├── payment/paymentMethods.test.ts
│           └── api/payment.test.ts
└── package.json                                  # Updated with Stripe deps
```

## 🔧 Key Components

### 1. Payment Provider Interface

**File**: `backend/app/Contracts/PaymentProviderInterface.php`

```php
interface PaymentProviderInterface
{
    public function initPayment(Order $order, array $options = []): array;
    public function confirmPayment(Order $order, string $paymentIntentId, array $options = []): array;
    public function cancelPayment(Order $order, string $paymentIntentId): array;
    public function getPaymentStatus(string $paymentIntentId): array;
    public function handleWebhook(array $payload, string $signature = ''): array;
}
```

**Purpose**: Ensures all payment providers implement the same interface for consistency.

### 2. Stripe Payment Provider

**File**: `backend/app/Services/Payment/StripePaymentProvider.php`

```php
public function initPayment(Order $order, array $options = []): array
{
    $paymentIntent = $this->stripe->paymentIntents->create([
        'amount' => (int) round($order->total_amount * 100),
        'currency' => 'eur',
        'metadata' => ['order_id' => $order->id],
    ]);

    $order->update(['payment_intent_id' => $paymentIntent->id]);

    return [
        'success' => true,
        'client_secret' => $paymentIntent->client_secret,
        'payment_intent_id' => $paymentIntent->id,
        // ... additional fields
    ];
}
```

**Features**:
- Real Stripe API integration
- Payment Intent creation
- Webhook signature verification
- Error handling with Greek messages
- Order status updates

### 3. Factory Pattern

**File**: `backend/app/Services/Payment/PaymentProviderFactory.php`

```php
public static function create(?string $provider = null): PaymentProviderInterface
{
    $provider = $provider ?? config('services.payment.provider', 'fake');

    return match ($provider) {
        'fake' => new FakePaymentProvider(),
        'stripe' => new StripePaymentProvider(),
        'viva' => new VivaPaymentProvider(), // Future implementation
        default => throw new InvalidArgumentException("Unsupported provider: {$provider}"),
    };
}
```

**Benefits**:
- Environment-based switching (`PAYMENT_PROVIDER=fake|stripe|viva`)
- Easy to add new providers
- No code changes needed for provider switching

### 4. Frontend Payment Flow

**Cart Page**: `frontend/src/app/cart/page.tsx`
- Payment method selection (COD vs Card)
- Payment fees calculation
- Conditional checkout flow

**Stripe Payment Page**: `frontend/src/app/checkout/payment/[orderId]/page.tsx`
- Payment Intent initialization
- Stripe Elements integration
- Payment confirmation
- Error handling

## 🔄 Payment Flows

### Cash on Delivery Flow
```
Cart → Select COD → Checkout → Order Created (status: pending) → Success
```

### Card Payment Flow
```
Cart → Select Card → Checkout → Order Created →
Payment Page → Stripe Elements → Payment Confirmed → Success
```

### Webhook Flow
```
Stripe Webhook → Signature Verification → Order Status Update → Response
```

## 🌍 Environment Configuration

### Backend (.env)
```bash
# Payment Provider Selection
PAYMENT_PROVIDER=fake  # or 'stripe' for production

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Viva Payments (Future)
VIVA_CLIENT_ID=your_client_id
VIVA_CLIENT_SECRET=your_client_secret
```

### Frontend (.env)
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 🧪 Testing Strategy

### Backend Tests
- Unit tests for each payment provider
- Mock Stripe API calls
- Webhook signature verification tests
- Error handling scenarios

### Frontend Tests
- Payment method utility functions
- API client methods
- Stripe Elements integration (E2E)

## 🚀 Deployment Checklist

1. **Environment Setup**
   - [ ] Set `PAYMENT_PROVIDER=stripe` in production
   - [ ] Configure Stripe keys (secret and publishable)
   - [ ] Set up Stripe webhook endpoint
   - [ ] Test with Stripe test cards

2. **Database Migration**
   - [ ] Run payment_intent_id migration
   - [ ] Verify Orders table structure

3. **Security Verification**
   - [ ] Webhook signature validation
   - [ ] API endpoint authentication
   - [ ] Rate limiting configured

4. **Monitoring**
   - [ ] Payment logs configured
   - [ ] Error tracking for payment failures
   - [ ] Webhook delivery monitoring

## 📊 Metrics & Monitoring

### Key Metrics
- Payment success rate by provider
- Average payment processing time
- Failed payment reasons
- Webhook delivery success rate

### Log Locations
- Laravel logs: `storage/logs/laravel.log`
- Payment-specific logs: Tagged with 'payment' context
- Stripe webhook logs: Separate log channel

## 🔒 Security Considerations

1. **Webhook Security**
   - Stripe signature verification implemented
   - Payload validation before processing
   - Idempotency handling

2. **API Security**
   - Bearer token authentication required
   - Rate limiting on payment endpoints
   - Input validation on all endpoints

3. **PCI Compliance**
   - No card data stored locally
   - Stripe Elements for secure card input
   - HTTPS required for all payment pages

## 🎯 Future Enhancements

1. **Viva Payments Integration**
   - Implement VivaPaymentProvider
   - Add Greek banking support
   - Test with local cards

2. **Additional Features**
   - Payment retry mechanism
   - Partial refunds
   - Subscription payments
   - Apple Pay / Google Pay

3. **Analytics**
   - Payment conversion tracking
   - A/B testing for payment methods
   - Revenue analytics dashboard

---

**Status**: ✅ **PRODUCTION READY** for Stripe integration
**Next Phase**: Viva Payments integration + Enhanced analytics