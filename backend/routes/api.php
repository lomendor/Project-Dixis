<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

Route::get('/health', function () {
    try {
        // Test database connection
        DB::connection()->getPdo();
        $dbStatus = 'connected';
    } catch (\Exception $e) {
        $dbStatus = 'failed: ' . $e->getMessage();
    }

    return response()->json([
        'status' => 'ok',
        'database' => $dbStatus,
        'timestamp' => now()->toISOString(),
        'version' => app()->version(),
    ]);
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Public API v1 routes
Route::prefix('v1')->group(function () {
    // Products (public)
    Route::get('products', [App\Http\Controllers\Api\ProductController::class, 'index']);
    Route::get('products/{product}', [App\Http\Controllers\Api\ProductController::class, 'show']);
    
    // Orders (authenticated)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('orders', [App\Http\Controllers\Api\OrderController::class, 'index']);
        Route::post('orders', [App\Http\Controllers\Api\OrderController::class, 'store']);
        Route::get('orders/{order}', [App\Http\Controllers\Api\OrderController::class, 'show']);
    });
});

// Producer API routes
Route::middleware('auth:sanctum')->prefix('v1/producer')->group(function () {
    // Product management
    Route::patch('products/{product}/toggle', [App\Http\Controllers\Api\ProducerController::class, 'toggleProduct']);
    
    // Dashboard
    Route::get('dashboard/kpi', [App\Http\Controllers\Api\ProducerController::class, 'kpi']);
    
    // Messages
    Route::patch('messages/{message}/read', [App\Http\Controllers\Api\MessageController::class, 'markAsRead']);
    Route::post('messages/{message}/replies', [App\Http\Controllers\Api\MessageController::class, 'storeReply']);
});