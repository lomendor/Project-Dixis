<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\ShippingService;
use Illuminate\Http\JsonResponse;

class ShippingController extends Controller
{
    private ShippingService $shippingService;

    public function __construct(ShippingService $shippingService)
    {
        $this->shippingService = $shippingService;
    }

    public function getRates(): JsonResponse
    {
        $ratesPath = base_path('config/shipping/rates.gr.json');
        $remotePostalCodesPath = base_path('config/shipping/remote_postal_codes.json');

        if (! file_exists($ratesPath) || ! file_exists($remotePostalCodesPath)) {
            return response()->json([
                'error' => 'Shipping configuration files not found'
            ], 500);
        }

        $ratesData = json_decode(file_get_contents($ratesPath), true);
        $remotePostalCodesData = json_decode(file_get_contents($remotePostalCodesPath), true);

        return response()->json([
            'rates' => $ratesData,
            'remote_postal_codes' => $remotePostalCodesData,
            'status' => 'loaded',
            'last_updated' => $ratesData['metadata']['last_updated'] ?? 'unknown'
        ]);
    }

    public function getZoneInfo(): JsonResponse
    {
        $zonesPath = base_path('config/shipping/gr_zones.json');

        if (! file_exists($zonesPath)) {
            return response()->json([
                'error' => 'Zones configuration file not found'
            ], 500);
        }

        $zonesData = json_decode(file_get_contents($zonesPath), true);

        return response()->json([
            'zones' => $zonesData['zones'] ?? [],
            'volumetric_factor' => $zonesData['volumetric_factor'] ?? 5000,
            'currency' => $zonesData['currency'] ?? 'EUR',
            'weight_unit' => $zonesData['weight_unit'] ?? 'kg'
        ]);
    }

    public function simulateQuote(): JsonResponse
    {
        $testScenarios = [
            [
                'description' => 'Athens - Light package (1kg)',
                'postal_code' => '10551',
                'weight_kg' => 1.0,
                'dimensions_cm' => ['length' => 20, 'width' => 15, 'height' => 10]
            ],
            [
                'description' => 'Thessaloniki - Medium package (3kg)',
                'postal_code' => '54621',
                'weight_kg' => 3.0,
                'dimensions_cm' => ['length' => 30, 'width' => 25, 'height' => 15]
            ],
            [
                'description' => 'Crete - Heavy package (8kg)',
                'postal_code' => '71201',
                'weight_kg' => 8.0,
                'dimensions_cm' => ['length' => 40, 'width' => 30, 'height' => 25]
            ],
            [
                'description' => 'Remote area - Kythira (2kg)',
                'postal_code' => '19007',
                'weight_kg' => 2.0,
                'dimensions_cm' => ['length' => 25, 'width' => 20, 'height' => 12]
            ],
        ];

        $results = [];

        foreach ($testScenarios as $scenario) {
            $dimensions = $scenario['dimensions_cm'];
            $volumetricWeight = $this->shippingService->computeVolumetricWeight(
                $dimensions['length'],
                $dimensions['width'],
                $dimensions['height']
            );

            $billableWeight = $this->shippingService->computeBillableWeight(
                $scenario['weight_kg'],
                $volumetricWeight
            );

            $zoneCode = $this->shippingService->getZoneByPostalCode($scenario['postal_code']);
            $shippingCost = $this->shippingService->calculateShippingCost($billableWeight, $zoneCode);

            $results[] = [
                'scenario' => $scenario['description'],
                'input' => [
                    'postal_code' => $scenario['postal_code'],
                    'actual_weight_kg' => $scenario['weight_kg'],
                    'dimensions_cm' => $dimensions,
                ],
                'calculation' => [
                    'volumetric_weight_kg' => $volumetricWeight,
                    'billable_weight_kg' => $billableWeight,
                    'zone_code' => $zoneCode,
                ],
                'result' => $shippingCost
            ];
        }

        return response()->json([
            'test_scenarios' => $results,
            'timestamp' => now()->toISOString()
        ]);
    }
}