<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    try {
        // Test database connection
        DB::connection()->getPdo();
        $dbStatus = 'connected';
    } catch (\Exception $e) {
        $dbStatus = 'failed: '.$e->getMessage();
    }

    // Pass 52: Payment configuration status (no secrets exposed)
    $cardEnabled = config('payments.card_enabled', false);
    $stripeKeySet = !empty(config('payments.stripe.secret_key'));
    $stripePublicSet = !empty(config('payments.stripe.public_key'));
    $stripeWebhookSet = !empty(config('payments.stripe.webhook_secret'));

    $paymentsStatus = [
        'cod' => 'enabled',
        'card' => [
            'flag' => $cardEnabled ? 'enabled' : 'disabled',
            'stripe_configured' => $cardEnabled && $stripeKeySet && $stripePublicSet,
            'keys_present' => [
                'secret' => $stripeKeySet,
                'public' => $stripePublicSet,
                'webhook' => $stripeWebhookSet,
            ],
        ],
    ];

    // Pass 60: Email configuration status (no secrets exposed)
    // Pass 60.1: Added from_configured field
    $emailEnabled = config('notifications.email_enabled', false);
    $mailer = config('mail.default', 'log');
    $resendKeySet = !empty(config('services.resend.key'));
    $smtpHostSet = !empty(config('mail.mailers.smtp.host')) && config('mail.mailers.smtp.host') !== '127.0.0.1';
    $smtpUserSet = !empty(config('mail.mailers.smtp.username'));

    // Check FROM address configuration (fallback to info@dixis.gr is applied in mail.php)
    $fromAddress = config('mail.from.address', 'info@dixis.gr');
    $fromConfigured = !empty($fromAddress) && $fromAddress !== 'hello@example.com';

    // Determine if email is properly configured based on mailer type
    $emailConfigured = false;
    if ($emailEnabled) {
        if ($mailer === 'resend') {
            $emailConfigured = $resendKeySet;
        } elseif ($mailer === 'smtp') {
            $emailConfigured = $smtpHostSet && $smtpUserSet;
        } elseif (in_array($mailer, ['log', 'array'])) {
            $emailConfigured = true; // Dev/test mailers always "configured"
        }
    }

    $emailStatus = [
        'flag' => $emailEnabled ? 'enabled' : 'disabled',
        'mailer' => $mailer,
        'configured' => $emailConfigured,
        'from_configured' => $fromConfigured,
        'keys_present' => [
            'resend' => $resendKeySet,
            'smtp_host' => $smtpHostSet,
            'smtp_user' => $smtpUserSet,
        ],
    ];

    return response()->json([
        'status' => 'ok',
        'database' => $dbStatus,
        'payments' => $paymentsStatus,
        'email' => $emailStatus,
        'timestamp' => now()->toISOString(),
        'version' => app()->version(),
    ]);
});

// Alias for /health (smoke tests use /healthz)
Route::get('/healthz', function () {
    try {
        DB::connection()->getPdo();
        $dbStatus = 'connected';
    } catch (\Exception $e) {
        $dbStatus = 'failed: '.$e->getMessage();
    }

    // Pass 52: Payment configuration status (no secrets exposed)
    $cardEnabled = config('payments.card_enabled', false);
    $stripeKeySet = !empty(config('payments.stripe.secret_key'));
    $stripePublicSet = !empty(config('payments.stripe.public_key'));
    $stripeWebhookSet = !empty(config('payments.stripe.webhook_secret'));

    $paymentsStatus = [
        'cod' => 'enabled',
        'card' => [
            'flag' => $cardEnabled ? 'enabled' : 'disabled',
            'stripe_configured' => $cardEnabled && $stripeKeySet && $stripePublicSet,
            'keys_present' => [
                'secret' => $stripeKeySet,
                'public' => $stripePublicSet,
                'webhook' => $stripeWebhookSet,
            ],
        ],
    ];

    // Pass 60: Email configuration status (no secrets exposed)
    // Pass 60.1: Added from_configured field
    $emailEnabled = config('notifications.email_enabled', false);
    $mailer = config('mail.default', 'log');
    $resendKeySet = !empty(config('services.resend.key'));
    $smtpHostSet = !empty(config('mail.mailers.smtp.host')) && config('mail.mailers.smtp.host') !== '127.0.0.1';
    $smtpUserSet = !empty(config('mail.mailers.smtp.username'));

    // Check FROM address configuration (fallback to info@dixis.gr is applied in mail.php)
    $fromAddress = config('mail.from.address', 'info@dixis.gr');
    $fromConfigured = !empty($fromAddress) && $fromAddress !== 'hello@example.com';

    // Determine if email is properly configured based on mailer type
    $emailConfigured = false;
    if ($emailEnabled) {
        if ($mailer === 'resend') {
            $emailConfigured = $resendKeySet;
        } elseif ($mailer === 'smtp') {
            $emailConfigured = $smtpHostSet && $smtpUserSet;
        } elseif (in_array($mailer, ['log', 'array'])) {
            $emailConfigured = true; // Dev/test mailers always "configured"
        }
    }

    $emailStatus = [
        'flag' => $emailEnabled ? 'enabled' : 'disabled',
        'mailer' => $mailer,
        'configured' => $emailConfigured,
        'from_configured' => $fromConfigured,
        'keys_present' => [
            'resend' => $resendKeySet,
            'smtp_host' => $smtpHostSet,
            'smtp_user' => $smtpUserSet,
        ],
    ];

    return response()->json([
        'status' => 'ok',
        'database' => $dbStatus,
        'payments' => $paymentsStatus,
        'email' => $emailStatus,
        'timestamp' => now()->toISOString(),
        'version' => app()->version(),
    ]);
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Test-only login endpoint (E2E testing)
// SECURITY: NEVER allow in production, even if ALLOW_TEST_LOGIN is set
if (!app()->environment('production')) {
    if (env('ALLOW_TEST_LOGIN', false) && (app()->environment('testing', 'local') || env('CI', false))) {
        Route::post('v1/test/login', [App\Http\Controllers\Api\TestLoginController::class, 'login'])
            ->middleware('throttle:30,1');
    }
}

// Authentication routes
Route::prefix('v1/auth')->group(function () {
    // Pass SEC-AUTH-RL-02: Rate limit auth endpoints to prevent brute force
    Route::post('register', [App\Http\Controllers\Api\AuthController::class, 'register'])
        ->middleware('throttle:auth-register'); // 5 requests per minute per IP
    Route::post('login', [App\Http\Controllers\Api\AuthController::class, 'login'])
        ->middleware('throttle:auth-login'); // 10 requests per minute per IP+email

    // Pass EMAIL-AUTH-01: Password reset routes (throttled to prevent abuse)
    Route::post('password/forgot', [App\Http\Controllers\Api\PasswordResetController::class, 'forgot'])
        ->middleware('throttle:5,1'); // 5 requests per minute
    Route::post('password/reset', [App\Http\Controllers\Api\PasswordResetController::class, 'reset'])
        ->middleware('throttle:5,1'); // 5 requests per minute

    // Pass EMAIL-VERIFY-01: Email verification routes (throttled)
    Route::post('email/verify', [App\Http\Controllers\Api\EmailVerificationController::class, 'verify'])
        ->middleware('throttle:10,1'); // 10 requests per minute
    Route::post('email/resend', [App\Http\Controllers\Api\EmailVerificationController::class, 'resend'])
        ->middleware('throttle:3,1'); // 3 requests per minute (stricter for resend)

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [App\Http\Controllers\Api\AuthController::class, 'logout']);
        Route::post('logout-all', [App\Http\Controllers\Api\AuthController::class, 'logoutAll']);
        Route::get('profile', [App\Http\Controllers\Api\AuthController::class, 'profile']);
        // Pass PRODUCER-THRESHOLD-POSTALCODE-01: Get user's default shipping address for checkout
        Route::get('shipping-address', [App\Http\Controllers\Api\AuthController::class, 'shippingAddress']);
    });
});

// Public API v1 routes
Route::prefix('v1')->group(function () {
    // Products (public, read-only) — T4: rate-limited to prevent scraping/DDoS
    Route::get('products', [App\Http\Controllers\Api\V1\ProductController::class, 'index'])->name('api.v1.products.index')
        ->middleware('throttle:120,1');
    Route::get('products/{product}', [App\Http\Controllers\Api\V1\ProductController::class, 'show'])->name('api.v1.products.show')
        ->middleware('throttle:120,1');

    // Products CRUD (authenticated)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('products', [App\Http\Controllers\Api\V1\ProductController::class, 'store'])->name('api.v1.products.store');
        Route::patch('products/{product}', [App\Http\Controllers\Api\V1\ProductController::class, 'update'])->name('api.v1.products.update');
        Route::delete('products/{product}', [App\Http\Controllers\Api\V1\ProductController::class, 'destroy'])->name('api.v1.products.destroy');
    });

    // S1-02: Authenticated reviews (create)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('products/{productId}/reviews', [App\Http\Controllers\Api\V1\ReviewController::class, 'store'])
            ->middleware('throttle:10,1');
    });

    // DEPRECATED: Legacy OrderController routes removed (Pass CHECKOUT-TOKEN-FIX-01)
    // These used flat 10% tax, no multi-producer support, no stock locking.
    // All order creation now goes through V1\OrderController at POST /public/orders.
    // User order listing migrated to V1\OrderController::index (line above).

    // Producers (public, read-only) — T4: rate-limited
    Route::get('producers', [App\Http\Controllers\Api\V1\ProducerController::class, 'index'])->name('api.v1.producers.index')
        ->middleware('throttle:120,1');
    Route::get('producers/{producer}', [App\Http\Controllers\Api\V1\ProducerController::class, 'show'])->name('api.v1.producers.show')
        ->middleware('throttle:120,1');

    // Enhanced Public Products API — T4: rate-limited group
    Route::prefix('public')->middleware('throttle:120,1')->group(function () {
        Route::get('products', [App\Http\Controllers\Public\ProductController::class, 'index']);
        Route::get('products/{id}', [App\Http\Controllers\Public\ProductController::class, 'show']);

        // S1-02: Public Reviews API
        Route::get('products/{productId}/reviews', [App\Http\Controllers\Api\V1\ReviewController::class, 'index']);
        Route::get('products/{productId}/reviews/summary', [App\Http\Controllers\Api\V1\ReviewController::class, 'summary']);

        // Public Producers API
        Route::get('producers', [App\Http\Controllers\Public\ProducerController::class, 'index']);
        Route::get('producers/{id}', [App\Http\Controllers\Public\ProducerController::class, 'show']);

        // SECURITY FIX: Removed public GET orders endpoints (data leak — exposed ALL orders)
        // Orders are only accessible via:
        //   - Authenticated user: GET /api/v1/orders (scoped to user)
        //   - Public tracking: GET /api/v1/public/orders/track/{token}
        //   - Public by-token: GET /api/v1/public/orders/by-token/{token} (full details, UUID-gated)

        // Public order creation (guest checkout supported)
        // Pass 52 fix: auth.optional captures user_id when logged in, allows guest checkout
        Route::post('orders', [App\Http\Controllers\Api\V1\OrderController::class, 'store'])->name('api.v1.public.orders.store')
            ->middleware(['auth.optional', 'throttle:10,1']);

        // Public order lookup by token (for thank-you page, email links)
        Route::get('orders/by-token/{token}', [App\Http\Controllers\Api\V1\OrderController::class, 'showByToken'])
            ->name('api.v1.public.orders.show-by-token')
            ->middleware('throttle:30,1');

        // Pass TRACKING-DISPLAY-01: Public order tracking by token (no auth required)
        Route::get('orders/track/{token}', [App\Http\Controllers\Api\V1\OrderTrackingController::class, 'show'])
            ->name('api.v1.public.orders.track')
            ->middleware('throttle:60,1'); // 60 tracking requests per minute

        // Pass 50: Zone-based shipping quote (simpler than /api/shipping/quote)
        Route::post('shipping/quote', [App\Http\Controllers\Api\V1\ShippingQuoteController::class, 'quote'])
            ->name('api.v1.public.shipping.quote')
            ->middleware('throttle:60,1'); // 60 quote requests per minute

        // Pass ORDER-SHIPPING-SPLIT-01: Per-producer shipping quote for cart
        Route::post('shipping/quote-cart', [App\Http\Controllers\Api\V1\ShippingQuoteController::class, 'quoteCart'])
            ->name('api.v1.public.shipping.quote-cart')
            ->middleware('throttle:30,1'); // 30 cart quote requests per minute (heavier endpoint)
    });

    // Cart (authenticated)
    Route::middleware('auth:sanctum')->prefix('cart')->group(function () {
        Route::get('items', [App\Http\Controllers\Api\CartController::class, 'index']);
        Route::post('items', [App\Http\Controllers\Api\CartController::class, 'store'])
            ->middleware('throttle:30,1'); // 30 requests per minute for cart additions
        Route::patch('items/{cartItem}', [App\Http\Controllers\Api\CartController::class, 'update']);
        Route::delete('items/{cartItem}', [App\Http\Controllers\Api\CartController::class, 'destroy']);
        Route::post('sync', [App\Http\Controllers\Api\CartController::class, 'sync'])
            ->middleware('throttle:10,1'); // 10 syncs per minute (login-triggered)
    });

    // Shipping routes
    Route::prefix('shipping')->group(function () {
        // Public quote endpoint
        Route::post('quote', [App\Http\Controllers\Api\ShippingController::class, 'getQuote'])
            ->middleware('throttle:60,1'); // 60 quote requests per minute

        // Public tracking endpoint
        Route::get('tracking/{trackingCode}', [App\Http\Controllers\Api\ShippingController::class, 'getTracking'])
            ->middleware('throttle:60,1'); // 60 tracking requests per minute

        // Admin-only label creation (jwt.admin + admin = same auth as other admin routes)
        Route::post('labels/{order}', [App\Http\Controllers\Api\ShippingController::class, 'createLabel'])
            ->middleware(['jwt.admin', 'admin', 'throttle:10,1']);

        // Admin-only label PDF download
        Route::get('labels/{order}/download', [App\Http\Controllers\Api\ShippingController::class, 'downloadLabel'])
            ->middleware(['jwt.admin', 'admin', 'throttle:30,1']);

        // Admin-only label PDF download
        Route::get('labels/{order}/download', [App\Http\Controllers\Api\ShippingController::class, 'downloadLabel'])
            ->middleware(['jwt.admin', 'admin', 'throttle:30,1']);

        // Public locker search endpoint (feature-flagged)
        Route::get('lockers/search', [App\Http\Controllers\Api\LockerController::class, 'search'])
            ->middleware('throttle:60,1'); // 60 locker search requests per minute
    });

    // FIX-CUSTOMER-ORDERS-01 + 02: Authenticated user's own orders
    // Previously removed as public endpoint (security fix), now restored as auth-scoped
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('orders', [App\Http\Controllers\Api\V1\OrderController::class, 'myOrders'])
            ->name('api.v1.orders.my')
            ->middleware('throttle:30,1'); // 30 requests per minute
        // FIX-CUSTOMER-ORDERS-02: Single order detail (ownership-checked)
        Route::get('orders/{id}', [App\Http\Controllers\Api\V1\OrderController::class, 'myOrder'])
            ->name('api.v1.orders.my.show')
            ->where('id', '[0-9]+')
            ->middleware('throttle:30,1');
    });

    // Order shipment details (authenticated users)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('orders/{order}/shipment', [App\Http\Controllers\Api\ShippingController::class, 'getOrderShipment']);
    });

    // Payment methods (public - no auth required)
    Route::get('payment/methods', [App\Http\Controllers\Api\PaymentController::class, 'getPaymentMethods']);

    // Payments (authenticated)
    Route::middleware('auth:sanctum')->prefix('payments')->group(function () {
        Route::post('orders/{order}/init', [App\Http\Controllers\Api\PaymentController::class, 'initPayment'])
            ->middleware('throttle:10,1'); // 10 payment inits per minute
        Route::post('orders/{order}/confirm', [App\Http\Controllers\Api\PaymentController::class, 'confirmPayment'])
            ->middleware('throttle:20,1'); // 20 confirmations per minute
        Route::post('orders/{order}/cancel', [App\Http\Controllers\Api\PaymentController::class, 'cancelPayment'])
            ->middleware('throttle:10,1'); // 10 cancellations per minute
        Route::get('orders/{order}/status', [App\Http\Controllers\Api\PaymentController::class, 'getPaymentStatus'])
            ->middleware('throttle:30,1'); // 30 status checks per minute
    });

    // Refunds (admin only) — T2.5-01: added 'admin' middleware
    Route::middleware(['jwt.admin', 'admin'])->prefix('refunds')->group(function () {
        Route::get('orders', [App\Http\Controllers\Api\RefundController::class, 'index'])
            ->middleware('throttle:60,1'); // 60 requests per minute
        Route::post('orders/{order}', [App\Http\Controllers\Api\RefundController::class, 'create'])
            ->middleware('throttle:5,1'); // 5 refunds per minute
        Route::get('orders/{order}', [App\Http\Controllers\Api\RefundController::class, 'show'])
            ->middleware('throttle:30,1'); // 30 status checks per minute
    });

    // Notifications (authenticated users)
    Route::middleware('auth:sanctum')->prefix('notifications')->group(function () {
        Route::get('/', [App\Http\Controllers\Api\NotificationController::class, 'index'])
            ->middleware('throttle:100,1'); // 100 requests per minute
        Route::get('unread-count', [App\Http\Controllers\Api\NotificationController::class, 'unreadCount'])
            ->middleware('throttle:120,1'); // 120 requests per minute
        Route::get('latest', [App\Http\Controllers\Api\NotificationController::class, 'latest'])
            ->middleware('throttle:60,1'); // 60 requests per minute
        Route::patch('{notification}/read', [App\Http\Controllers\Api\NotificationController::class, 'markAsRead'])
            ->middleware('throttle:60,1'); // 60 requests per minute
        Route::patch('read-all', [App\Http\Controllers\Api\NotificationController::class, 'markAllAsRead'])
            ->middleware('throttle:10,1'); // 10 requests per minute
    });

    // Admin Analytics — T2.5-01: added 'admin' middleware
    Route::middleware(['jwt.admin', 'admin'])->prefix('admin/analytics')->group(function () {
        Route::get('sales', [App\Http\Controllers\Api\Admin\AnalyticsController::class, 'sales'])
            ->middleware('throttle:60,1'); // 60 requests per minute
        Route::get('orders', [App\Http\Controllers\Api\Admin\AnalyticsController::class, 'orders'])
            ->middleware('throttle:60,1'); // 60 requests per minute
        Route::get('products', [App\Http\Controllers\Api\Admin\AnalyticsController::class, 'products'])
            ->middleware('throttle:60,1'); // 60 requests per minute
        Route::get('producers', [App\Http\Controllers\Api\Admin\AnalyticsController::class, 'producers'])
            ->middleware('throttle:60,1'); // 60 requests per minute
        Route::get('dashboard', [App\Http\Controllers\Api\Admin\AnalyticsController::class, 'dashboard'])
            ->middleware('throttle:120,1'); // 120 requests per minute for dashboard
    });

    // Admin Product Moderation (Pass 24) — T2.5-01: added 'admin' middleware
    Route::middleware(['jwt.admin', 'admin'])->prefix('admin/products')->group(function () {
        Route::get('pending', [App\Http\Controllers\Api\Admin\AdminProductController::class, 'pending'])
            ->middleware('throttle:60,1'); // 60 requests per minute
        Route::patch('{product}/moderate', [App\Http\Controllers\Api\Admin\AdminProductController::class, 'moderate'])
            ->middleware('throttle:30,1'); // 30 moderation actions per minute
        // FIX-ADMIN-PRODUCT-UPDATE-01: Admin product update via jwt.admin auth
        // The regular PATCH /v1/products/{id} requires auth:sanctum (user/producer token).
        // Admin panel uses OTP JWT which only jwt.admin middleware understands.
        Route::patch('{product}', [App\Http\Controllers\Api\V1\ProductController::class, 'update'])
            ->middleware('throttle:30,1'); // 30 updates per minute
    });

    // Admin Order Management (Pass 25 + Pass 61) — T2.5-01: added 'admin' middleware
    Route::middleware(['jwt.admin', 'admin'])->prefix('admin/orders')->group(function () {
        Route::get('/', [App\Http\Controllers\Api\Admin\AdminOrderController::class, 'index'])
            ->middleware('throttle:60,1'); // 60 requests per minute (Pass 61)
        Route::patch('{order}/status', [App\Http\Controllers\Api\Admin\AdminOrderController::class, 'updateStatus'])
            ->middleware('throttle:60,1'); // 60 status updates per minute
        // Pass COD-COMPLETE: Admin confirm COD payment received
        Route::patch('{order}/payment/confirm', [App\Http\Controllers\Api\Admin\AdminOrderController::class, 'confirmPayment'])
            ->middleware('throttle:30,1'); // 30 payment confirms per minute
    });

    // Admin Shipping (read-only rate tables interface) — T2.5-01: added 'admin' middleware
    Route::middleware(['jwt.admin', 'admin'])->prefix('admin/shipping')->group(function () {
        Route::get('rates', [App\Http\Controllers\Api\Admin\ShippingController::class, 'getRates'])
            ->middleware('throttle:60,1'); // 60 requests per minute
        Route::get('zones', [App\Http\Controllers\Api\Admin\ShippingController::class, 'getZoneInfo'])
            ->middleware('throttle:60,1'); // 60 requests per minute
        Route::get('simulate', [App\Http\Controllers\Api\Admin\ShippingController::class, 'simulateQuote'])
            ->middleware('throttle:30,1'); // 30 simulations per minute
    });

    // PRODUCER-ONBOARD-01: Admin Producer Management — T2.5-01: added 'admin' middleware
    Route::middleware(['jwt.admin', 'admin'])->prefix('admin/producers')->group(function () {
        Route::get('/', [App\Http\Controllers\Api\Admin\AdminProducerController::class, 'index'])
            ->middleware('throttle:60,1');
        Route::patch('{producer}/approve', [App\Http\Controllers\Api\Admin\AdminProducerController::class, 'approve'])
            ->middleware('throttle:30,1');
        Route::patch('{producer}/reject', [App\Http\Controllers\Api\Admin\AdminProducerController::class, 'reject'])
            ->middleware('throttle:30,1');
        Route::patch('{producer}', [App\Http\Controllers\Api\Admin\AdminProducerController::class, 'update'])
            ->middleware('throttle:30,1');
    });

    // B2B PIVOT: Admin Business Management
    Route::middleware(['jwt.admin', 'admin'])->prefix('admin/businesses')->group(function () {
        Route::get('/', [App\Http\Controllers\Api\Admin\AdminBusinessController::class, 'index'])
            ->middleware('throttle:60,1');
        Route::get('{business}', [App\Http\Controllers\Api\Admin\AdminBusinessController::class, 'show'])
            ->middleware('throttle:60,1');
        Route::patch('{business}/approve', [App\Http\Controllers\Api\Admin\AdminBusinessController::class, 'approve'])
            ->middleware('throttle:30,1');
        Route::patch('{business}/reject', [App\Http\Controllers\Api\Admin\AdminBusinessController::class, 'reject'])
            ->middleware('throttle:30,1');
    });

    // Admin Commission Rules CRUD — T2.5-01: added 'admin' middleware
    Route::middleware(['jwt.admin', 'admin'])->prefix('admin/commission-rules')->group(function () {
        Route::get('/', [App\Http\Controllers\Api\Admin\AdminCommissionController::class, 'index'])
            ->middleware('throttle:60,1');
        Route::post('/', [App\Http\Controllers\Api\Admin\AdminCommissionController::class, 'store'])
            ->middleware('throttle:30,1');
        Route::patch('{id}', [App\Http\Controllers\Api\Admin\AdminCommissionController::class, 'update'])
            ->middleware('throttle:30,1');
        Route::post('{id}/toggle', [App\Http\Controllers\Api\Admin\AdminCommissionController::class, 'toggleActive'])
            ->middleware('throttle:30,1');
        Route::get('preview', [App\Http\Controllers\Api\Admin\AdminCommissionController::class, 'preview'])
            ->middleware('throttle:60,1');
    });

    // Pass PAYOUT-03 + PAYOUT-05: Admin Settlement Dashboard + CSV Export — T2.5-01: added 'admin' middleware
    Route::middleware(['jwt.admin', 'admin'])->prefix('admin/settlements')->group(function () {
        Route::get('summary', [App\Http\Controllers\Api\Admin\AdminSettlementController::class, 'summary'])
            ->middleware('throttle:60,1');
        Route::get('export', [App\Http\Controllers\Api\Admin\SettlementExportController::class, 'exportCsv'])
            ->middleware('throttle:10,1'); // 10 exports per minute
        Route::get('/', [App\Http\Controllers\Api\Admin\AdminSettlementController::class, 'index'])
            ->middleware('throttle:60,1');
        Route::get('{id}', [App\Http\Controllers\Api\Admin\AdminSettlementController::class, 'show'])
            ->middleware('throttle:60,1');
        Route::post('{id}/pay', [App\Http\Controllers\Api\Admin\AdminSettlementController::class, 'markPaid'])
            ->middleware('throttle:30,1');
        Route::post('{id}/cancel', [App\Http\Controllers\Api\Admin\AdminSettlementController::class, 'markCancelled'])
            ->middleware('throttle:30,1');
    });

    // Pass COMM-ENGINE-TOGGLE-01: Admin toggle for commission feature flag — T2.5-01: added 'admin' middleware
    Route::middleware(['jwt.admin', 'admin'])->prefix('admin/settings')->group(function () {
        Route::get('commission-engine', function (Illuminate\Http\Request $request) {
            if ($request->user()?->role !== 'admin') {
                return response()->json(['message' => 'Forbidden'], 403);
            }
            return response()->json([
                'enabled' => \Laravel\Pennant\Feature::active('commission_engine_v1'),
            ]);
        })->middleware('throttle:60,1');

        Route::post('commission-engine', function (Illuminate\Http\Request $request) {
            if ($request->user()?->role !== 'admin') {
                return response()->json(['message' => 'Forbidden'], 403);
            }
            $enabled = (bool) $request->input('enabled', false);
            if ($enabled) {
                \Laravel\Pennant\Feature::activate('commission_engine_v1');
            } else {
                \Laravel\Pennant\Feature::deactivate('commission_engine_v1');
            }
            return response()->json([
                'success' => true,
                'enabled' => \Laravel\Pennant\Feature::active('commission_engine_v1'),
            ]);
        })->middleware('throttle:10,1');
    });

});

// B2B PIVOT: Subscription endpoints (approved businesses only)
Route::middleware('auth:sanctum')->prefix('v1/subscription')->group(function () {
    Route::get('status', [App\Http\Controllers\Api\SubscriptionController::class, 'status'])
        ->middleware('throttle:30,1');
    Route::post('checkout', [App\Http\Controllers\Api\SubscriptionController::class, 'checkout'])
        ->middleware('throttle:5,1');
});

// Pass 51: Card payment checkout (authenticated)
Route::middleware('auth:sanctum')->prefix('v1/public/payments')->group(function () {
    Route::post('checkout', [App\Http\Controllers\Api\V1\PaymentCheckoutController::class, 'createCheckoutSession'])
        ->middleware('throttle:10,1'); // 10 payment initiations per minute
});

// Webhook routes (no authentication - verified by signature)
Route::prefix('v1/webhooks')->group(function () {
    // Pass 51: Stripe webhook (signature verified in controller)
    Route::post('stripe', [App\Http\Controllers\Api\V1\StripeWebhookController::class, 'handle']);
    // Pass STRIPE-CONNECT-01: Connect account events (separate secret)
    Route::post('stripe-connect', [App\Http\Controllers\Api\V1\StripeConnectWebhookController::class, 'handle']);
});

// Legacy webhook routes (for backwards compatibility)
Route::prefix('webhooks')->group(function () {
    Route::post('stripe', [App\Http\Controllers\Api\WebhookController::class, 'stripe']);
    Route::post('viva', [App\Http\Controllers\Api\WebhookController::class, 'viva']);
    Route::post('payment', [App\Http\Controllers\Api\WebhookController::class, 'payment']);
});


// ARCH-FIX-04b: OpenAPI spec extracted to routes/openapi.php (569 lines → separate file)
require __DIR__.'/openapi.php';


// ARCH-FIX-04: Route files extracted for maintainability
// Producer API routes (19 routes: profile, products, dashboard, analytics, orders, settlements)
require __DIR__.'/producer.php';

// Ops & Internal routes (commission preview, slow queries, admin lookup)
require __DIR__.'/ops.php';
