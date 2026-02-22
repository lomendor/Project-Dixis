<?php

/**
 * Pass 51: Payment configuration
 *
 * Card payments are disabled by default. Enable with PAYMENTS_CARD_FLAG=true
 */

return [
    /*
    |--------------------------------------------------------------------------
    | Card Payments Feature Flag
    |--------------------------------------------------------------------------
    |
    | When false, card payment endpoints return 503 Service Unavailable.
    | Set PAYMENTS_CARD_FLAG=true in .env to enable card payments.
    |
    */
    'card_enabled' => env('PAYMENTS_CARD_FLAG', false),

    /*
    |--------------------------------------------------------------------------
    | Stripe Configuration
    |--------------------------------------------------------------------------
    |
    | STRIPE_SECRET_KEY: Server-side secret key (sk_live_* or sk_test_*)
    | STRIPE_PUBLIC_KEY: Client-side publishable key (pk_live_* or pk_test_*)
    | STRIPE_WEBHOOK_SECRET: Webhook signing secret (whsec_*)
    |
    */
    'stripe' => [
        'secret_key' => env('STRIPE_SECRET_KEY'),
        'public_key' => env('STRIPE_PUBLIC_KEY'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),

        // Redirect URLs after checkout (will have ?id={order_id}&session_id={session} appended)
        'success_url' => env('STRIPE_SUCCESS_URL', env('FRONTEND_URL', 'https://dixis.gr') . '/thank-you'),
        'cancel_url' => env('STRIPE_CANCEL_URL', env('FRONTEND_URL', 'https://dixis.gr') . '/checkout'),
    ],

    /*
    |--------------------------------------------------------------------------
    | COD (Cash on Delivery) - Disabled
    |--------------------------------------------------------------------------
    |
    | COD removed: multi-producer marketplace makes flat COD fee impossible.
    | Each courier charges per-shipment COD, so 3 producers = 3 separate fees.
    | May be re-enabled when carrier integration provides exact COD pricing.
    |
    */
    'cod_enabled' => false,

    /*
    |--------------------------------------------------------------------------
    | Commission Engine
    |--------------------------------------------------------------------------
    |
    | Pass CHECKOUT-TOKEN-FIX-01: Moved from env() to config().
    | Controls Laravel Pennant feature flag 'commission_engine_v1'.
    | Default false — no commission deducted from producer payouts.
    |
    */
    'commission_engine_enabled' => env('COMMISSION_ENGINE_ENABLED', false),

    /*
    |--------------------------------------------------------------------------
    | Ops Token (Internal admin endpoints)
    |--------------------------------------------------------------------------
    |
    | Token for /ops/* endpoints. Compared with hash_equals() for timing safety.
    |
    */
    'ops_token' => env('OPS_TOKEN', ''),
];
