<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ShippingController extends Controller
{
    /**
     * Get shipping quote based on location and package details
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function quote(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'zip' => 'required|string|min:5|max:10',
            'city' => 'required|string|min:2|max:100',
            'weight' => 'required|numeric|min:0.1|max:100',
            'volume' => 'required|numeric|min:0.001|max:10'
        ]);

        $zip = $validated['zip'];
        $city = $validated['city'];
        $weight = $validated['weight'];
        $volume = $validated['volume'];

        // MVP: Hard-coded shipping zone logic
        $shippingZone = $this->determineShippingZone($zip);
        $carrier = $this->getCarrierForZone($shippingZone);
        $baseCost = $this->getBaseCostForZone($shippingZone);
        $weightMultiplier = $this->getWeightMultiplier($weight);
        $volumeMultiplier = $this->getVolumeMultiplier($volume);
        
        // Calculate final cost
        $cost = round($baseCost * $weightMultiplier * $volumeMultiplier, 2);
        $etaDays = $this->getEtaDaysForZone($shippingZone);

        return response()->json([
            'carrier' => $carrier,
            'cost' => $cost,
            'etaDays' => $etaDays,
            'zone' => $shippingZone, // For debugging/testing
            'details' => [
                'zip' => $zip,
                'city' => $city,
                'weight' => $weight,
                'volume' => $volume
            ]
        ]);
    }

    /**
     * Determine shipping zone based on postal code (MVP hard-coded logic)
     */
    private function determineShippingZone(string $zip): string
    {
        // Athens metro area (11XXX, 12XXX)
        if (preg_match('/^1[12]\d{3}$/', $zip)) {
            return 'athens_metro';
        }
        
        // Thessaloniki area (54XXX, 55XXX, 56XXX)
        if (preg_match('/^5[456]\d{3}$/', $zip)) {
            return 'thessaloniki';
        }
        
        // Major cities (20XXX-28XXX, 30XXX-38XXX)
        if (preg_match('/^[23][0-8]\d{3}$/', $zip)) {
            return 'major_cities';
        }
        
        // Islands (84XXX, 85XXX, 80XXX-83XXX)
        if (preg_match('/^8[0-5]\d{3}$/', $zip)) {
            return 'islands';
        }
        
        // Remote areas (everything else)
        return 'remote';
    }

    /**
     * Get carrier name for shipping zone
     */
    private function getCarrierForZone(string $zone): string
    {
        return match($zone) {
            'athens_metro' => 'Athens Express',
            'thessaloniki' => 'Northern Courier',
            'major_cities' => 'Greek Post',
            'islands' => 'Island Logistics',
            'remote' => 'Rural Delivery',
            default => 'Standard Shipping'
        };
    }

    /**
     * Get base cost for shipping zone (in euros)
     */
    private function getBaseCostForZone(string $zone): float
    {
        return match($zone) {
            'athens_metro' => 3.50,
            'thessaloniki' => 4.00,
            'major_cities' => 5.50,
            'islands' => 8.00,
            'remote' => 7.00,
            default => 5.00
        };
    }

    /**
     * Get weight multiplier (heavier packages cost more)
     */
    private function getWeightMultiplier(float $weight): float
    {
        if ($weight <= 2.0) return 1.0;
        if ($weight <= 5.0) return 1.2;
        if ($weight <= 10.0) return 1.5;
        return 2.0; // >10kg
    }

    /**
     * Get volume multiplier (larger packages cost more)
     */
    private function getVolumeMultiplier(float $volume): float
    {
        if ($volume <= 0.01) return 1.0;  // Small packages
        if ($volume <= 0.05) return 1.1;  // Medium packages
        return 1.3; // Large packages
    }

    /**
     * Get estimated delivery days for zone
     */
    private function getEtaDaysForZone(string $zone): int
    {
        return match($zone) {
            'athens_metro' => 1,
            'thessaloniki' => 2,
            'major_cities' => 2,
            'islands' => 4,
            'remote' => 3,
            default => 3
        };
    }
}