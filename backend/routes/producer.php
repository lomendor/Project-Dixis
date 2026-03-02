<?php

/**
 * Producer API Routes
 *
 * ARCH-FIX-04: Extracted from routes/api.php for maintainability.
 * All routes require Sanctum authentication and use prefix 'v1/producer'.
 *
 * Loaded by: routes/api.php via require __DIR__.'/producer.php'
 */

use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->prefix('v1/producer')->group(function () {
    // Producer Profile
    Route::get('me', [App\Http\Controllers\Api\ProducerController::class, 'me']);
    Route::patch('profile', [App\Http\Controllers\Api\ProducerController::class, 'updateProfile']);

    // Product management
    Route::get('products', [App\Http\Controllers\Api\ProducerController::class, 'getProducts']);
    Route::patch('products/{product}/toggle', [App\Http\Controllers\Api\ProducerController::class, 'toggleProduct']);
    Route::patch('products/{product}/stock', [App\Http\Controllers\Api\ProducerController::class, 'updateStock']);

    // Dashboard
    Route::get('dashboard/kpi', [App\Http\Controllers\Api\ProducerController::class, 'kpi']);
    Route::get('dashboard/top-products', [App\Http\Controllers\Api\ProducerController::class, 'topProducts']);

    // Messages
    Route::patch('messages/{message}/read', [App\Http\Controllers\Api\MessageController::class, 'markAsRead']);
    Route::post('messages/{message}/replies', [App\Http\Controllers\Api\MessageController::class, 'storeReply']);

    // Producer Analytics
    Route::prefix('analytics')->group(function () {
        Route::get('sales', [App\Http\Controllers\Api\Producer\ProducerAnalyticsController::class, 'sales'])
            ->middleware('throttle:60,1');
        Route::get('orders', [App\Http\Controllers\Api\Producer\ProducerAnalyticsController::class, 'orders'])
            ->middleware('throttle:60,1');
        Route::get('products', [App\Http\Controllers\Api\Producer\ProducerAnalyticsController::class, 'products'])
            ->middleware('throttle:60,1');
    });

    // Producer Settlements (PAYOUT-04)
    Route::get('settlements', [App\Http\Controllers\Api\Producer\ProducerSettlementController::class, 'index'])
        ->middleware('throttle:60,1');

    // Stripe Connect (STRIPE-CONNECT-01)
    Route::prefix('stripe')->group(function () {
        Route::post('onboard', [App\Http\Controllers\Api\Producer\StripeConnectController::class, 'onboard'])
            ->middleware('throttle:5,1');
        Route::get('status', [App\Http\Controllers\Api\Producer\StripeConnectController::class, 'status'])
            ->middleware('throttle:30,1');
        Route::get('dashboard', [App\Http\Controllers\Api\Producer\StripeConnectController::class, 'dashboard'])
            ->middleware('throttle:10,1');
        Route::get('onboard/refresh', [App\Http\Controllers\Api\Producer\StripeConnectController::class, 'refreshOnboarding'])
            ->middleware('throttle:5,1');
    });

    // Producer Order Management (AG126.1)
    Route::get('orders', [App\Http\Controllers\Api\Producer\ProducerOrderController::class, 'index'])
        ->middleware('throttle:60,1');
    Route::get('orders/export', [App\Http\Controllers\Api\Producer\ProducerOrderController::class, 'export'])
        ->middleware('throttle:10,1');
    Route::get('orders/{id}', [App\Http\Controllers\Api\Producer\ProducerOrderController::class, 'show'])
        ->middleware('throttle:60,1');
    Route::patch('orders/{id}/status', [App\Http\Controllers\Api\Producer\ProducerOrderController::class, 'updateStatus'])
        ->middleware('throttle:30,1');
});
