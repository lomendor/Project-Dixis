<?php

/**
 * Ops & Internal API Routes
 *
 * ARCH-FIX-04: Extracted from routes/api.php for maintainability.
 * These are operational/internal endpoints with token or IP-based auth.
 *
 * Loaded by: routes/api.php via require __DIR__.'/ops.php'
 */

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OpsDbController;
use App\Http\Controllers\Api\OrderCommissionPreviewController;

// === OPS: Commission preview (simple JSON) ===
// Pass CHECKOUT-TOKEN-FIX-01: Added throttle + hash_equals for timing-safe token comparison
Route::middleware('throttle:10,1')->get('/ops/commission/preview', function (\Illuminate\Http\Request $request) {
    // Timing-safe token auth (prevents timing side-channel attacks)
    $opsToken = (string) config('payments.ops_token', '');
    if (empty($opsToken) || !hash_equals($opsToken, (string) $request->header('x-ops-token', ''))) {
        abort(404);
    }

    $channel = $request->query('channel', 'b2c') === 'b2b' ? 'b2b' : 'b2c';
    $producerId = $request->integer('producerId') ?: null;
    $categoryId = $request->integer('categoryId') ?: null;

    // Option 1: By orderId
    if ($request->has('orderId')) {
        $orderId = (int)$request->query('orderId');
        $order = \App\Models\Order::find($orderId);

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        try {
            $service = app(\App\Services\CommissionService::class);
            $commission = $service->settleForOrder($order, $channel);
        } catch (\Throwable $e) {
            \Log::error('Commission preview calculation failed', ['order_id' => $orderId, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Commission calculation failed'], 500);
        }

        return response()->json([
            'orderId' => $orderId,
            'calc' => [
                'channel' => $commission->channel,
                'order_gross' => $commission->order_gross,
                'platform_fee' => $commission->platform_fee,
                'platform_fee_vat' => $commission->platform_fee_vat,
                'producer_payout' => $commission->producer_payout,
                'currency' => $commission->currency,
            ],
        ]);
    }

    // Option 2: By amount
    if ($request->has('amount')) {
        $amount = (float)$request->query('amount');

        $resolver = app(\App\Services\FeeResolver::class);
        $resolved = $resolver->resolve($producerId, $categoryId, $channel);

        $platformFee = round($amount * (float)$resolved['rate'], 2);
        $platformFeeVat = round($platformFee * (float)$resolved['fee_vat_rate'], 2);
        $producerPayout = round($amount - $platformFee - $platformFeeVat, 2);

        return response()->json([
            'amount' => $amount,
            'calc' => [
                'channel' => $channel,
                'rate' => $resolved['rate'],
                'fee_vat_rate' => $resolved['fee_vat_rate'],
                'platform_fee' => $platformFee,
                'platform_fee_vat' => $platformFeeVat,
                'producer_payout' => $producerPayout,
                'source' => $resolved['source'],
            ],
        ]);
    }

    return response()->json(['message' => 'Provide orderId or amount'], 400);
});

// Commission preview (read-only; feature-flagged, authenticated)
Route::get('/orders/{order}/commission-preview', [OrderCommissionPreviewController::class, 'show'])
    ->middleware('auth:sanctum');

// Ops: DB slow queries endpoint (guarded by X-Ops-Key in production)
// Pass CHECKOUT-TOKEN-FIX-01: Added throttle to prevent abuse
Route::get('/ops/db/slow-queries', [OpsDbController::class, 'slow'])
    ->middleware('throttle:10,1')
    ->name('ops.db.slow');

// Internal: AdminUser lookup for OTP email delivery (Next.js → Laravel)
// Only accessible from localhost (internal API call)
Route::get('/admin-user-lookup', function (\Illuminate\Http\Request $request) {
    // Only allow internal requests (from localhost)
    $clientIp = $request->ip();
    if (!in_array($clientIp, ['127.0.0.1', '::1'])) {
        abort(403, 'Internal only');
    }

    $phone = $request->query('phone');
    if (!$phone) {
        return response()->json(['message' => 'Phone required'], 400);
    }

    $admin = DB::table('AdminUser')
        ->where('phone', $phone)
        ->select(['email', 'isActive'])
        ->first();

    if (!$admin) {
        return response()->json(null, 404);
    }

    return response()->json([
        'email' => $admin->email,
        'isActive' => (bool) $admin->isActive,
    ]);
})->middleware('throttle:30,1');
