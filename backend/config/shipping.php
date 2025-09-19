<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Shipping Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for shipping services, providers, and delivery options.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Default Provider
    |--------------------------------------------------------------------------
    |
    | The default shipping provider to use for rate calculations.
    |
    */
    'default_provider' => env('SHIPPING_DEFAULT_PROVIDER', 'internal'),

    /*
    |--------------------------------------------------------------------------
    | Delivery Options
    |--------------------------------------------------------------------------
    |
    | Configuration for various delivery options including home delivery
    | and locker delivery services.
    |
    */
    'enable_lockers' => env('SHIPPING_ENABLE_LOCKERS', false),
    'locker_discount_eur' => env('LOCKER_DISCOUNT_EUR', 0),

    /*
    |--------------------------------------------------------------------------
    | Cash on Delivery (COD)
    |--------------------------------------------------------------------------
    |
    | Configuration for Cash on Delivery payment method.
    | When enabled, adds COD fee to shipping quotes.
    |
    */
    'enable_cod' => env('SHIPPING_ENABLE_COD', false),
    'cod_fee_eur' => env('SHIPPING_COD_FEE_EUR', 4.00),

    /*
    |--------------------------------------------------------------------------
    | Rate Tables
    |--------------------------------------------------------------------------
    |
    | Path to the shipping rate configuration files.
    |
    */
    'rate_tables' => [
        'greece' => config_path('shipping/rates.gr.json'),
        'zones' => config_path('shipping/gr_zones.json'),
        'profiles' => config_path('shipping/profiles.json'),
        'remote_postal_codes' => config_path('shipping/remote_postal_codes.json'),
    ],

    /*
    |--------------------------------------------------------------------------
    | API Rate Limiting
    |--------------------------------------------------------------------------
    |
    | Rate limiting configuration for shipping-related API endpoints.
    |
    */
    'api' => [
        'locker_search_rate_limit' => env('SHIPPING_LOCKER_RATE_LIMIT', '60,1'), // 60 per minute
    ],
];