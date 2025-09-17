<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment Providers Configuration
    |--------------------------------------------------------------------------
    */

    'payment' => [
        'provider' => env('PAYMENT_PROVIDER', 'fake'),
        'currency' => env('PAYMENT_CURRENCY', 'EUR'),
        'webhook_tolerance' => env('PAYMENT_WEBHOOK_TOLERANCE', 300), // 5 minutes
    ],

    'stripe' => [
        'secret_key' => env('STRIPE_SECRET_KEY'),
        'public_key' => env('STRIPE_PUBLIC_KEY'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
        'webhook_url' => env('APP_URL').'/api/webhooks/stripe',
    ],

    'viva' => [
        'merchant_id' => env('VIVA_MERCHANT_ID'),
        'api_key' => env('VIVA_API_KEY'),
        'client_id' => env('VIVA_CLIENT_ID'),
        'client_secret' => env('VIVA_CLIENT_SECRET'),
        'environment' => env('VIVA_ENVIRONMENT', 'demo'), // demo or live
        'webhook_verification_key' => env('VIVA_WEBHOOK_VERIFICATION_KEY'),
    ],

];
