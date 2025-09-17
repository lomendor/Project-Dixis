<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Shipment;
use App\Services\ShippingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ShippingController extends Controller
{
    private ShippingService $shippingService;

    public function __construct(ShippingService $shippingService)
    {
        $this->shippingService = $shippingService;
    }

    /**
     * Get shipping quote for cart items
     * POST /api/shipping/quote
     */
    public function getQuote(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'postal_code' => 'required|string|regex:/^\d{5}$/',
            'producer_profile' => 'nullable|string|in:flat_rate,free_shipping,premium_producer,local_producer',
        ]);

        try {
            // Create temporary order for shipping calculation
            $tempOrder = $this->createTemporaryOrder($validated['items']);

            $quote = $this->shippingService->getQuote(
                $tempOrder->id,
                $validated['postal_code'],
                $validated['producer_profile'] ?? null
            );

            // Clean up temporary order
            $tempOrder->delete();

            return response()->json([
                'success' => true,
                'data' => $quote,
            ]);

        } catch (\Exception $e) {
            Log::error('Shipping quote error', [
                'message' => $e->getMessage(),
                'items' => $validated['items'],
                'postal_code' => $validated['postal_code'],
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Αποτυχία υπολογισμού μεταφορικών',
            ], 500);
        }
    }

    /**
     * Create shipping label for order (Admin only)
     * POST /api/shipping/labels/{orderId}
     */
    public function createLabel(Order $order): JsonResponse
    {
        $this->authorize('admin-access'); // Admin only

        try {
            $label = $this->shippingService->createLabel($order->id);

            return response()->json([
                'success' => true,
                'data' => $label,
            ]);

        } catch (\Exception $e) {
            Log::error('Label creation error', [
                'order_id' => $order->id,
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Αποτυχία δημιουργίας ετικέτας',
            ], 500);
        }
    }

    /**
     * Get tracking information for shipment
     * GET /api/shipping/tracking/{trackingCode}
     */
    public function getTracking(string $trackingCode): JsonResponse
    {
        try {
            $shipment = Shipment::where('tracking_code', $trackingCode)->firstOrFail();

            // Check if user can access this shipment
            if (Auth::check() && $shipment->order->user_id !== Auth::id() && ! Auth::user()->can('admin-access')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Δεν έχετε πρόσβαση σε αυτή την αποστολή',
                ], 403);
            }

            $trackingData = [
                'tracking_code' => $shipment->tracking_code,
                'status' => $shipment->status,
                'carrier_code' => $shipment->carrier_code,
                'shipped_at' => $shipment->shipped_at?->toISOString(),
                'delivered_at' => $shipment->delivered_at?->toISOString(),
                'estimated_delivery' => $shipment->estimated_delivery?->toISOString(),
                'events' => $shipment->tracking_events ?? [],
            ];

            return response()->json([
                'success' => true,
                'data' => $trackingData,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Δεν βρέθηκε αποστολή με αυτόν τον κωδικό',
            ], 404);
        }
    }

    /**
     * Get shipment details for customer order
     * GET /api/orders/{orderId}/shipment
     */
    public function getOrderShipment(Order $order): JsonResponse
    {
        $this->authorize('view', $order);

        $shipment = $order->shipment;

        if (! $shipment) {
            return response()->json([
                'success' => false,
                'message' => 'Δεν βρέθηκαν στοιχεία αποστολής',
            ], 404);
        }

        $shipmentData = [
            'id' => $shipment->id,
            'tracking_code' => $shipment->tracking_code,
            'carrier_code' => $shipment->carrier_code,
            'status' => $shipment->status,
            'zone_code' => $shipment->zone_code,
            'shipping_cost_eur' => $shipment->shipping_cost_eur,
            'shipped_at' => $shipment->shipped_at?->toISOString(),
            'delivered_at' => $shipment->delivered_at?->toISOString(),
            'estimated_delivery' => $shipment->estimated_delivery?->toISOString(),
            'is_trackable' => $shipment->isTrackable(),
            'is_completed' => $shipment->isCompleted(),
        ];

        return response()->json([
            'success' => true,
            'data' => $shipmentData,
        ]);
    }

    /**
     * Create temporary order for shipping calculations
     */
    private function createTemporaryOrder(array $items): Order
    {
        $order = Order::create([
            'user_id' => Auth::id(), // Use NULL for guest quotes
            'status' => 'pending', // Use valid status instead of temp_quote
            'payment_status' => 'pending',
            'payment_method' => 'temp',
            'shipping_method' => 'temp',
            'currency' => 'EUR',
            'subtotal' => 0,
            'shipping_cost' => 0,
            'total' => 0,
        ]);

        foreach ($items as $item) {
            $product = \App\Models\Product::findOrFail($item['product_id']);
            $order->orderItems()->create([
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'unit_price' => $product->price,
                'total_price' => $product->price * $item['quantity'],
                'product_name' => $product->name,
                'product_unit' => $product->unit ?? 'piece',
            ]);
        }

        return $order;
    }
}
