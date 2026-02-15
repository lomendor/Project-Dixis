<?php

/**
 * Pass 53: Email notification configuration.
 * Feature flag controls whether emails are actually sent.
 */
return [
    /*
    |--------------------------------------------------------------------------
    | Email Notifications Feature Flag
    |--------------------------------------------------------------------------
    |
    | When false (default), no emails are sent. This ensures production safety
    | until the feature is explicitly enabled.
    |
    */
    'email_enabled' => env('EMAIL_NOTIFICATIONS_ENABLED', false),

    /*
    |--------------------------------------------------------------------------
    | Sender Configuration
    |--------------------------------------------------------------------------
    |
    | Default sender for all order notifications.
    |
    */
    'from' => [
        'address' => env('MAIL_FROM_ADDRESS', 'no-reply@dixis.gr'),
        'name' => env('MAIL_FROM_NAME', 'Dixis'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Queue Configuration
    |--------------------------------------------------------------------------
    |
    | Whether to queue emails or send synchronously.
    | When queue is enabled, emails are sent via the database queue.
    |
    */
    'queue_enabled' => env('EMAIL_QUEUE_ENABLED', false),
    'queue_name' => env('EMAIL_QUEUE_NAME', 'emails'),

    /*
    |--------------------------------------------------------------------------
    | Pass 55: Producer Weekly Digest Feature Flag
    |--------------------------------------------------------------------------
    |
    | When false (default), weekly digest emails are not sent.
    | Enable separately from transactional emails.
    |
    */
    'producer_digest_enabled' => env('PRODUCER_DIGEST_ENABLED', false),

    /*
    |--------------------------------------------------------------------------
    | Pass EMAIL-VERIFY-01: Email Verification Required
    |--------------------------------------------------------------------------
    |
    | When true, new users must verify their email before full access.
    | When false (default), users are auto-verified for backwards compatibility.
    |
    */
    'email_verification_required' => env('EMAIL_VERIFICATION_REQUIRED', false),

    /*
    |--------------------------------------------------------------------------
    | Pass ADMIN-NOTIFY-01: Admin Notification Email
    |--------------------------------------------------------------------------
    |
    | Email address that receives admin notifications for new orders.
    | Falls back to MAIL_FROM_ADDRESS if not set.
    |
    */
    'admin_notify_email' => env('ADMIN_NOTIFY_EMAIL', env('MAIL_FROM_ADDRESS', 'info@dixis.gr')),
];
