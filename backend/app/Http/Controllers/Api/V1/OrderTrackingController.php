<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;

/**
 * Pass TRACKING-DISPLAY-01: Public order tracking by token
 *
 * This endpoint allows customers to track their order status without authentication.
 * Returns limited information to protect customer privacy.
 */
class OrderTrackingController extends Controller
{
    /**
     * Get order status by public token.
     *
     * Returns minimal non-PII information:
     * - Order status
     * - Created date
     * - Items count
     * - Shipment info (if available)
     *
     * @param string $token UUID public token
     * @return JsonResponse
     */
    public function show(string $token): JsonResponse
    {
        // Validate token format (UUID v4)
        if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i', $token)) {
            return response()->json([
                'error' => 'Invalid token format',
            ], 400);
        }

        $order = Order::with(['shipment', 'orderItems'])
            ->where('public_token', $token)
            ->first();

        if (!$order) {
            return response()->json([
                'error' => 'Order not found',
            ], 404);
        }

        // Build response with minimal data (no PII)
        $response = [
            'id' => $order->id,
            'status' => $order->status,
            'payment_status' => $order->payment_status,
            'created_at' => $order->created_at?->toISOString(),
            'updated_at' => $order->updated_at?->toISOString(),
            'items_count' => $order->orderItems->count(),
            'total' => (float) ($order->total ?? $order->total_amount ?? 0),
        ];

        // Add shipment info if available
        if ($order->shipment) {
            $response['shipment'] = [
                'status' => $order->shipment->status,
                'carrier_code' => $order->shipment->carrier_code,
                'tracking_code' => $order->shipment->tracking_code,
                'tracking_url' => $this->getCarrierTrackingUrl(
                    $order->shipment->carrier_code,
                    $order->shipment->tracking_code
                ),
                'shipped_at' => $order->shipment->shipped_at?->toISOString(),
                'delivered_at' => $order->shipment->delivered_at?->toISOString(),
                'estimated_delivery' => $order->shipment->estimated_delivery?->toISOString(),
            ];
        }

        return response()->json([
            'ok' => true,
            'order' => $response,
        ]);
    }

    /**
     * Generate carrier-specific tracking URL.
     *
     * @param string|null $carrierCode
     * @param string|null $trackingCode
     * @return string|null
     */
    private function getCarrierTrackingUrl(?string $carrierCode, ?string $trackingCode): ?string
    {
        if (!$carrierCode || !$trackingCode) {
            return null;
        }

        // Greek carrier tracking URLs
        $carriers = [
            'acs' => 'https://www.acscourier.net/el/track-and-trace/?trackId={code}',
            'speedex' => 'https://www.speedex.gr/trackandtrace.asp?num={code}',
            'elta' => 'https://www.elta-courier.gr/track/?code={code}',
            'geniki' => 'https://www.taxydromiki.com/track/{code}',
            'courier_center' => 'https://www.courier.gr/track/?code={code}',
        ];

        $carrier = strtolower($carrierCode);
        if (!isset($carriers[$carrier])) {
            return null;
        }

        return str_replace('{code}', urlencode($trackingCode), $carriers[$carrier]);
    }
}
