<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Producer;
use App\Models\Product;
use App\Models\ShippingZone;
use App\Models\ShippingRate;
use App\Services\ShippingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Pass 50: Shipping quote API for zone-based pricing
 * Pass ORDER-SHIPPING-SPLIT-01: Added per-producer cart quote endpoint
 * Pass PRODUCER-THRESHOLD-POSTALCODE-01: Per-producer free shipping threshold
 */
class ShippingQuoteController extends Controller
{
    private ShippingService $shippingService;

    public function __construct(ShippingService $shippingService)
    {
        $this->shippingService = $shippingService;
    }

    // Fallback prices if zone lookup fails (backwards compatible with Pass 48)
    private const FALLBACK_PRICES = [
        'HOME' => 3.50,
        'COURIER' => 4.50,
        'PICKUP' => 0.00,
    ];

    // Default weight if not provided (kg)
    private const DEFAULT_WEIGHT_KG = 1.0;

    /**
     * Get the free shipping threshold for a producer.
     * Pass PRODUCER-THRESHOLD-POSTALCODE-01: Per-producer threshold with fallback to config default.
     */
    private function getProducerThreshold(?Producer $producer): float
    {
        if ($producer && $producer->free_shipping_threshold_eur !== null) {
            return (float) $producer->free_shipping_threshold_eur;
        }
        return (float) config('shipping.default_free_shipping_threshold_eur', 35.00);
    }

    /**
     * Get the default free shipping threshold from config.
     */
    private function getDefaultThreshold(): float
    {
        return (float) config('shipping.default_free_shipping_threshold_eur', 35.00);
    }

    /**
     * POST /api/v1/shipping/quote
     *
     * Request body:
     * - postal_code: string (5 digits)
     * - method: string (HOME|COURIER|PICKUP)
     * - weight_kg?: number (optional, defaults to 1.0)
     * - subtotal?: number (optional, for free shipping check)
     */
    public function quote(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'postal_code' => 'required|string|regex:/^\d{5}$/',
            'method' => 'required|string|in:HOME,COURIER,PICKUP',
            'weight_kg' => 'nullable|numeric|min:0|max:100',
            'subtotal' => 'nullable|numeric|min:0',
        ]);

        $postalCode = $validated['postal_code'];
        $method = $validated['method'];
        $weightKg = $validated['weight_kg'] ?? self::DEFAULT_WEIGHT_KG;
        $subtotal = $validated['subtotal'] ?? 0;

        // PICKUP is always free
        if ($method === 'PICKUP') {
            return response()->json([
                'price_eur' => 0.00,
                'zone_name' => null,
                'method' => 'PICKUP',
                'free_shipping' => true,
                'source' => 'pickup',
            ]);
        }

        // Check free shipping threshold (uses system default for non-producer-specific quotes)
        $defaultThreshold = $this->getDefaultThreshold();
        if ($subtotal >= $defaultThreshold) {
            return response()->json([
                'price_eur' => 0.00,
                'zone_name' => null,
                'method' => $method,
                'free_shipping' => true,
                'free_shipping_reason' => 'threshold',
                'threshold' => $defaultThreshold,
                'source' => 'threshold',
            ]);
        }

        // Try zone-based pricing
        try {
            $zone = ShippingZone::findByPostalCode($postalCode);

            if ($zone) {
                $rate = ShippingRate::findRate($zone->id, $method, $weightKg);

                if ($rate) {
                    // Log successful quote (no PII)
                    Log::info('Shipping quote computed', [
                        'zone_id' => $zone->id,
                        'method' => $method,
                        'source' => 'zone',
                    ]);

                    return response()->json([
                        'price_eur' => (float) $rate->price_eur,
                        'zone_name' => $zone->name,
                        'zone_id' => $zone->id,
                        'method' => $method,
                        'weight_kg' => $weightKg,
                        'free_shipping' => false,
                        'source' => 'zone',
                    ]);
                }
            }
        } catch (\Exception $e) {
            // Log error but don't expose details
            Log::warning('Shipping quote zone lookup failed', [
                'error' => $e->getMessage(),
                'method' => $method,
            ]);
        }

        // Fallback to hardcoded prices (backwards compatible)
        $fallbackPrice = self::FALLBACK_PRICES[$method] ?? self::FALLBACK_PRICES['COURIER'];

        Log::info('Shipping quote using fallback', [
            'method' => $method,
            'source' => 'fallback',
        ]);

        return response()->json([
            'price_eur' => $fallbackPrice,
            'zone_name' => null,
            'method' => $method,
            'free_shipping' => false,
            'source' => 'fallback',
        ]);
    }

    /**
     * POST /api/v1/public/shipping/quote-cart
     *
     * Pass ORDER-SHIPPING-SPLIT-01: Per-producer shipping breakdown for cart
     *
     * Request body:
     * - postal_code: string (5 digits)
     * - method: string (HOME|COURIER|PICKUP)
     * - items: array of {product_id: int, quantity: int}
     *
     * Response:
     * - producers: array of {producer_id, producer_name, subtotal, shipping_cost, is_free, zone, weight_grams}
     * - total_shipping: float
     * - quoted_at: ISO timestamp
     * - currency: EUR
     */
    public function quoteCart(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'postal_code' => 'required|string|regex:/^\d{5}$/',
            'method' => 'required|string|in:HOME,COURIER,PICKUP',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $postalCode = $validated['postal_code'];
        $method = $validated['method'];
        $isPickup = $method === 'PICKUP';
        $quotedAt = now();

        // Fetch products with producer info
        $productIds = collect($validated['items'])->pluck('product_id')->toArray();
        $products = Product::with('producer')
            ->whereIn('id', $productIds)
            ->where('is_active', true)
            ->get()
            ->keyBy('id');

        // Validate all products exist
        $missingProducts = array_diff($productIds, $products->keys()->toArray());
        if (!empty($missingProducts)) {
            return response()->json([
                'error' => 'PRODUCTS_NOT_FOUND',
                'message' => 'Some products are not available',
                'missing_product_ids' => array_values($missingProducts),
            ], 400);
        }

        // Get zone for shipping calculation
        $zone = ShippingZone::findByPostalCode($postalCode);
        $zoneName = $zone?->name;
        $zoneCode = $this->shippingService->getZoneByPostalCode($postalCode);

        // Group items by producer
        $producerGroups = [];
        foreach ($validated['items'] as $item) {
            $product = $products[$item['product_id']];
            $producerId = $product->producer_id ?? 0;

            if (!isset($producerGroups[$producerId])) {
                $producer = $product->producer;
                $producerGroups[$producerId] = [
                    'producer_id' => $producerId,
                    'producer_name' => $producer?->name ?? 'Unknown Producer',
                    'producer' => $producer, // Store producer object for threshold lookup
                    'items' => [],
                    'subtotal' => 0,
                    'weight_grams' => 0,
                ];
            }

            $quantity = $item['quantity'];
            $itemTotal = $product->price * $quantity;
            $weightPerUnit = ($product->weight_per_unit ?? 0.5) * 1000; // Convert kg to grams

            $producerGroups[$producerId]['items'][] = [
                'product_id' => $product->id,
                'quantity' => $quantity,
                'unit_price' => $product->price,
                'total_price' => $itemTotal,
            ];
            $producerGroups[$producerId]['subtotal'] += $itemTotal;
            $producerGroups[$producerId]['weight_grams'] += (int) ($weightPerUnit * $quantity);
        }

        // Calculate shipping per producer
        $producersResult = [];
        $totalShipping = 0;
        $hasUnavailableZone = false;
        $unavailableProducers = [];

        foreach ($producerGroups as $producerId => $group) {
            // Skip items without producer (legacy data handling)
            if ($producerId === 0) {
                continue;
            }

            $subtotal = round($group['subtotal'], 2);
            $weightKg = $group['weight_grams'] / 1000;

            // Get per-producer threshold
            $producer = $group['producer'] ?? null;
            $threshold = $this->getProducerThreshold($producer);

            // PICKUP is always free
            if ($isPickup) {
                $producersResult[] = [
                    'producer_id' => $producerId,
                    'producer_name' => $group['producer_name'],
                    'subtotal' => $subtotal,
                    'shipping_cost' => 0.00,
                    'is_free' => true,
                    'free_reason' => 'pickup',
                    'threshold_eur' => $threshold,
                    'zone' => null,
                    'weight_grams' => $group['weight_grams'],
                ];
                continue;
            }

            // Free shipping if above threshold (per producer)
            if ($subtotal >= $threshold) {
                $producersResult[] = [
                    'producer_id' => $producerId,
                    'producer_name' => $group['producer_name'],
                    'subtotal' => $subtotal,
                    'shipping_cost' => 0.00,
                    'is_free' => true,
                    'free_reason' => 'threshold',
                    'threshold_eur' => $threshold,
                    'zone' => $zoneName,
                    'weight_grams' => $group['weight_grams'],
                ];
                continue;
            }

            // Calculate shipping using ShippingService
            try {
                $shippingResult = $this->shippingService->calculateShippingCost($weightKg, $zoneCode);
                $shippingCost = round($shippingResult['cost_eur'], 2);
            } catch (\Exception $e) {
                // Zone calculation failed - mark as unavailable
                $hasUnavailableZone = true;
                $unavailableProducers[] = $group['producer_name'];
                continue;
            }

            // Check if zone is unavailable (fail-safe for unknown zones)
            if ($zoneCode === 'UNKNOWN' && !$zone) {
                $hasUnavailableZone = true;
                $unavailableProducers[] = $group['producer_name'];
            }

            $producersResult[] = [
                'producer_id' => $producerId,
                'producer_name' => $group['producer_name'],
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'is_free' => $shippingCost === 0.0,
                'free_reason' => null,
                'threshold_eur' => $threshold,
                'zone' => $zoneName,
                'weight_grams' => $group['weight_grams'],
            ];

            $totalShipping += $shippingCost;
        }

        // Fail-safe: Block checkout if zone unavailable for any producer
        if ($hasUnavailableZone) {
            return response()->json([
                'error' => 'ZONE_UNAVAILABLE',
                'message' => 'Shipping is not available to your area for some producers',
                'unavailable_producers' => $unavailableProducers,
            ], 422);
        }

        // Log quote for audit (no PII)
        Log::info('Per-producer shipping quote', [
            'producer_count' => count($producersResult),
            'total_shipping' => $totalShipping,
            'zone' => $zoneName,
            'method' => $method,
        ]);

        return response()->json([
            'producers' => $producersResult,
            'total_shipping' => round($totalShipping, 2),
            'quoted_at' => $quotedAt->toIso8601String(),
            'currency' => 'EUR',
            'zone_name' => $zoneName,
            'method' => $method,
        ]);
    }
}
