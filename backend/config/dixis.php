<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Dixis Platform Fee Configuration
    |--------------------------------------------------------------------------
    |
    | Default commission rates and VAT settings for the Dixis marketplace.
    | These values are fallbacks when no DB-driven rules exist in fee_rules
    | or dixis_settings tables.
    |
    */

    'fees' => [
        // Default B2C commission rate (12%)
        'b2c' => env('DIXIS_FEE_B2C', 0.12),

        // Default B2B commission rate (7%)
        'b2b' => env('DIXIS_FEE_B2B', 0.07),

        // VAT rate applied to platform fees (24% Greek VAT)
        'fee_vat_rate' => env('DIXIS_FEE_VAT_RATE', 0.24),
    ],

    /*
    |--------------------------------------------------------------------------
    | Data Hygiene Settings
    |--------------------------------------------------------------------------
    |
    | Controls for seed/test account handling in production.
    |
    */

    // Block seed users (is_seed=true) from logging in
    // Set to true after running `php artisan users:mark-seed` to mark seed accounts
    'block_seed_logins' => env('DIXIS_BLOCK_SEED_LOGINS', false),
];
