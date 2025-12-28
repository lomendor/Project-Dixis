<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ShippingZone;
use App\Models\ShippingRate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Pass 50: Shipping quote API for zone-based pricing
 */
class ShippingQuoteController extends Controller
{
    // Fallback prices if zone lookup fails (backwards compatible with Pass 48)
    private const FALLBACK_PRICES = [
        'HOME' => 3.50,
        'COURIER' => 4.50,
        'PICKUP' => 0.00,
    ];

    // Free shipping threshold (€)
    private const FREE_SHIPPING_THRESHOLD = 35.00;

    // Default weight if not provided (kg)
    private const DEFAULT_WEIGHT_KG = 1.0;

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

        // Check free shipping threshold
        if ($subtotal >= self::FREE_SHIPPING_THRESHOLD) {
            return response()->json([
                'price_eur' => 0.00,
                'zone_name' => null,
                'method' => $method,
                'free_shipping' => true,
                'free_shipping_reason' => 'threshold',
                'threshold' => self::FREE_SHIPPING_THRESHOLD,
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
}
