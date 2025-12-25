<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\CommissionService;
use Illuminate\Http\JsonResponse;
use Laravel\Pennant\Feature;

class OrderCommissionPreviewController extends Controller
{
    public function show(Order $order, CommissionService $service): JsonResponse
    {
        // Μη εκτεθειμένο αν το flag είναι OFF (μηδενικό ρίσκο)
        if (!Feature::active('commission_engine_v1')) {
            abort(404);
        }

        try {
            $payload = $service->calculateFee($order);

            return response()->json([
                'order_id' => $order->id,
                'commission_preview' => $payload, // { commission_cents, rule_id, breakdown }
            ]);
        } catch (\Exception $e) {
            // Log error but return 404 instead of 500 to avoid exposing internals
            \Log::error('Commission preview calculation failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
            abort(404);
        }
    }
}
