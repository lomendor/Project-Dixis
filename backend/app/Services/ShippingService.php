<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Shipment;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ShippingService
{
    private array $zones;
    private array $profiles;
    private array $carrierSettings;

    public function __construct()
    {
        $this->loadConfiguration();
    }

    /**
     * Load shipping configuration from JSON files
     */
    private function loadConfiguration(): void
    {
        $zonesPath = base_path('config/shipping/gr_zones.json');
        $profilesPath = base_path('config/shipping/profiles.json');

        if (!file_exists($zonesPath) || !file_exists($profilesPath)) {
            throw new \Exception('Shipping configuration files not found');
        }

        $zonesData = json_decode(file_get_contents($zonesPath), true);
        $profilesData = json_decode(file_get_contents($profilesPath), true);

        $this->zones = $zonesData['zones'] ?? [];
        $this->profiles = $profilesData;
        $this->carrierSettings = $profilesData['carrier_settings'] ?? [];
    }

    /**
     * Compute volumetric weight in kg
     * Formula: (Length × Width × Height) / volumetric_factor
     */
    public function computeVolumetricWeight(float $lengthCm, float $widthCm, float $heightCm): float
    {
        $volumetricFactor = 5000; // Standard factor for domestic shipping
        $volumetricWeight = ($lengthCm * $widthCm * $heightCm) / $volumetricFactor;

        return round($volumetricWeight, 2);
    }

    /**
     * Compute billable weight (higher of actual or volumetric weight)
     */
    public function computeBillableWeight(float $actualWeightKg, float $volumetricWeightKg): float
    {
        return max($actualWeightKg, $volumetricWeightKg);
    }

    /**
     * Determine shipping zone based on postal code
     */
    public function getZoneByPostalCode(string $postalCode): ?string
    {
        foreach ($this->zones as $zoneCode => $zone) {
            foreach ($zone['postal_codes'] as $pattern) {
                $regex = '/^' . str_replace('*', '\d*', $pattern) . '$/';
                if (preg_match($regex, $postalCode)) {
                    return $zoneCode;
                }
            }
        }

        return null;
    }

    /**
     * Calculate shipping cost for given parameters
     */
    public function calculateShippingCost(float $billableWeightKg, string $zoneCode): array
    {
        if (!isset($this->zones[$zoneCode])) {
            throw new \Exception("Unknown shipping zone: {$zoneCode}");
        }

        $zone = $this->zones[$zoneCode];
        $cost = 0;

        if ($billableWeightKg <= 2) {
            $cost = $zone['base_rate_0_2kg'];
        } elseif ($billableWeightKg <= 5) {
            $cost = $zone['base_rate_2_5kg'];
        } else {
            $extraWeight = $billableWeightKg - 5;
            $cost = $zone['base_rate_2_5kg'] + ($extraWeight * $zone['per_kg_rate_above_5kg']);
        }

        return [
            'cost_cents' => round($cost * 100), // Convert to cents
            'cost_eur' => round($cost, 2),
            'zone_code' => $zoneCode,
            'zone_name' => $zone['name'],
            'estimated_delivery_days' => $zone['estimated_delivery_days'],
            'breakdown' => [
                'base_rate' => $billableWeightKg <= 2 ? $zone['base_rate_0_2kg'] : $zone['base_rate_2_5kg'],
                'extra_weight_kg' => $billableWeightKg > 5 ? $billableWeightKg - 5 : 0,
                'extra_cost' => $billableWeightKg > 5 ? ($billableWeightKg - 5) * $zone['per_kg_rate_above_5kg'] : 0,
                'billable_weight_kg' => $billableWeightKg
            ]
        ];
    }

    /**
     * Get shipping quote for an order
     */
    public function getQuote(int $orderId, string $postalCode, ?string $producerProfile = null): array
    {
        $order = Order::with('orderItems.product')->findOrFail($orderId);

        // Calculate total weight and dimensions
        $totalWeight = 0;
        $totalVolume = 0;

        foreach ($order->orderItems as $item) {
            $product = $item->product;
            $itemWeight = ($product->weight_per_unit ?? 0.5) * $item->quantity; // Default 0.5kg if not set
            $totalWeight += $itemWeight;

            // Estimate dimensions if not provided (fallback)
            $estimatedVolume = $itemWeight * 1000; // 1 liter per kg assumption
            $totalVolume += $estimatedVolume;
        }

        // Calculate volumetric weight (assuming cubic packaging)
        $estimatedDimension = pow($totalVolume, 1/3); // Cube root for cubic package
        $volumetricWeight = $this->computeVolumetricWeight(
            $estimatedDimension,
            $estimatedDimension,
            $estimatedDimension
        );

        $billableWeight = $this->computeBillableWeight($totalWeight, $volumetricWeight);

        // Determine zone
        $zoneCode = $this->getZoneByPostalCode($postalCode);
        if (!$zoneCode) {
            throw new \Exception("Unable to determine shipping zone for postal code: {$postalCode}");
        }

        // Calculate base cost
        $shippingCost = $this->calculateShippingCost($billableWeight, $zoneCode);

        // Apply producer profile adjustments
        if ($producerProfile && isset($this->profiles['producer_profiles'][$producerProfile])) {
            $profile = $this->profiles['producer_profiles'][$producerProfile];
            $shippingCost = $this->applyProfileAdjustments($shippingCost, $profile, $order);
        }

        return [
            'cost_cents' => $shippingCost['cost_cents'],
            'cost_eur' => $shippingCost['cost_eur'],
            'zone_code' => $shippingCost['zone_code'],
            'zone_name' => $shippingCost['zone_name'],
            'carrier_code' => $shippingCost['carrier_code'] ?? 'ELTA',
            'estimated_delivery_days' => $shippingCost['estimated_delivery_days'],
            'breakdown' => [
                'base_cost_cents' => $shippingCost['breakdown']['base_rate_cents'] ?? $shippingCost['cost_cents'],
                'weight_adjustment_cents' => $shippingCost['breakdown']['weight_adjustment_cents'] ?? 0,
                'volume_adjustment_cents' => 0, // For now, as per audit
                'zone_multiplier' => $shippingCost['breakdown']['zone_multiplier'] ?? 1.0,
                'actual_weight_kg' => $totalWeight,
                'volumetric_weight_kg' => $volumetricWeight,
                'postal_code' => $postalCode,
                'profile_applied' => $producerProfile
            ]
        ];
    }

    /**
     * Apply producer profile adjustments to shipping cost
     */
    private function applyProfileAdjustments(array $shippingCost, array $profile, Order $order): array
    {
        $adjustedCost = $shippingCost;

        // Apply zone multiplier if available
        if (isset($profile['zone_multiplier'])) {
            $multiplier = $profile['zone_multiplier'];
            $adjustedCost['cost_eur'] *= $multiplier;
            $adjustedCost['cost_cents'] = round($adjustedCost['cost_eur'] * 100);
            $adjustedCost['breakdown']['zone_multiplier'] = $multiplier;
        }

        // Check for free shipping threshold
        if (isset($profile['free_shipping_threshold'])) {
            $orderTotal = floatval($order->subtotal);
            if ($orderTotal >= $profile['free_shipping_threshold']) {
                $adjustedCost['cost_eur'] = 0;
                $adjustedCost['cost_cents'] = 0;
                $adjustedCost['breakdown']['free_shipping_applied'] = true;
                $adjustedCost['breakdown']['threshold_met'] = $profile['free_shipping_threshold'];
            }
        }

        return $adjustedCost;
    }

    /**
     * Create shipping label (PDF stub)
     */
    public function createLabel(int $orderId): array
    {
        $order = Order::with(['orderItems.product', 'user'])->findOrFail($orderId);

        // Idempotency check: if label already exists, return existing
        $existingShipment = Shipment::where('order_id', $orderId)->first();
        if ($existingShipment && $existingShipment->label_url) {
            return [
                'tracking_code' => $existingShipment->tracking_code,
                'label_url' => $existingShipment->label_url,
                'carrier_code' => $existingShipment->carrier_code,
                'status' => $existingShipment->status
            ];
        }

        // Generate tracking code
        $trackingCode = $this->generateTrackingCode();

        // Map default carrier key to short code
        $defaultCarrierKey = $this->carrierSettings['default_carrier'] ?? 'ELTA_COURIER';
        $carrierCode = $this->mapCarrierKeyToCode($defaultCarrierKey);

        // Create or update shipment record
        $shipment = Shipment::firstOrCreate(
            ['order_id' => $orderId],
            [
                'carrier_code' => $carrierCode,
                'tracking_code' => $trackingCode,
                'status' => 'labeled',
                'label_url' => null, // Will be set after PDF generation
            ]
        );

        // Generate PDF label (stub implementation)
        $pdfContent = $this->generateLabelPdf($order, $shipment);

        // Store PDF file
        $filename = "shipping_label_{$orderId}_{$trackingCode}.pdf";
        $stored = Storage::disk('local')->put("shipping/labels/{$filename}", $pdfContent);

        if ($stored) {
            $shipment->update([
                'label_url' => "storage/shipping/labels/{$filename}",
                'status' => 'labeled'
            ]);
        }

        Log::info("Shipping label created", [
            'order_id' => $orderId,
            'tracking_code' => $trackingCode,
            'filename' => $filename
        ]);

        return [
            'tracking_code' => $trackingCode,
            'label_url' => $shipment->label_url,
            'carrier_code' => $shipment->carrier_code,
            'status' => $shipment->status
        ];
    }

    /**
     * Map carrier key to short code
     */
    private function mapCarrierKeyToCode(string $carrierKey): string
    {
        $carrierMapping = [
            'ELTA_COURIER' => 'ELTA',
            'ACS_COURIER' => 'ACS',
            'SPEEDEX_COURIER' => 'SPEEDEX',
            'ELTA' => 'ELTA',
            'ACS' => 'ACS',
            'SPEEDEX' => 'SPEEDEX'
        ];

        return $carrierMapping[$carrierKey] ?? 'ELTA';
    }

    /**
     * Generate tracking code
     */
    private function generateTrackingCode(): string
    {
        $prefix = 'DX'; // Dixis prefix
        $timestamp = substr(time(), -6); // Last 6 digits of timestamp
        $random = str_pad(mt_rand(0, 9999), 4, '0', STR_PAD_LEFT);

        return $prefix . $timestamp . $random;
    }

    /**
     * Generate PDF label content (stub implementation)
     */
    private function generateLabelPdf(Order $order, Shipment $shipment): string
    {
        // This is a stub implementation that generates a simple text-based "PDF"
        // In production, you would use a proper PDF library like TCPDF or DomPDF

        $labelContent = "
=== SHIPPING LABEL ===

Tracking Code: {$shipment->tracking_code}
Carrier: {$shipment->carrier_code}
Order ID: {$order->id}

FROM:
Project Dixis Marketplace
Κεντρική Διεύθυνση
Athens, 10551
Greece
Tel: +30 210 1234567

TO:
{$order->user->name}
{$order->shipping_address}
{$order->city}, {$order->postal_code}
Greece

ORDER DETAILS:
Total Items: {$order->orderItems->count()}
Total Weight: " . $order->orderItems->sum(function($item) {
    return ($item->product->weight_per_unit ?? 0.5) * $item->quantity;
}) . " kg
Order Value: €{$order->total}

BARCODE: *{$shipment->tracking_code}*

Generated: " . now()->format('Y-m-d H:i:s') . "
Label Format: PDF Stub v1.0

=== END LABEL ===
        ";

        return $labelContent;
    }

    /**
     * Update shipment status
     */
    public function updateShipmentStatus(string $trackingCode, string $status): bool
    {
        $shipment = Shipment::where('tracking_code', $trackingCode)->first();

        if (!$shipment) {
            return false;
        }

        $shipment->update(['status' => $status]);

        Log::info("Shipment status updated", [
            'tracking_code' => $trackingCode,
            'status' => $status,
            'order_id' => $shipment->order_id
        ]);

        return true;
    }

    /**
     * Get tracking information
     */
    public function getTrackingInfo(string $trackingCode): ?array
    {
        $shipment = Shipment::with('order')->where('tracking_code', $trackingCode)->first();

        if (!$shipment) {
            return null;
        }

        $carrier = $this->carrierSettings['carriers'][$shipment->carrier_code] ?? null;
        $trackingUrl = null;

        if ($carrier && isset($carrier['tracking_url_template'])) {
            $trackingUrl = str_replace('{tracking_code}', $trackingCode, $carrier['tracking_url_template']);
        }

        return [
            'tracking_code' => $trackingCode,
            'status' => $shipment->status,
            'carrier_code' => $shipment->carrier_code,
            'carrier_name' => $carrier['name'] ?? $shipment->carrier_code,
            'tracking_url' => $trackingUrl,
            'order_id' => $shipment->order_id,
            'created_at' => $shipment->created_at,
            'updated_at' => $shipment->updated_at
        ];
    }
}