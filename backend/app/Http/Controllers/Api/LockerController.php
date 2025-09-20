<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Shipping\LockerResource;
use App\Services\Lockers\LockerProvider;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class LockerController extends Controller
{
    private LockerProvider $lockerProvider;

    public function __construct(LockerProvider $lockerProvider)
    {
        $this->lockerProvider = $lockerProvider;
    }

    /**
     * Search for lockers by postal code.
     */
    public function search(Request $request): JsonResponse
    {
        // Check if lockers are enabled
        if (!config('shipping.enable_lockers', false)) {
            return response()->json([
                'success' => false,
                'message' => 'Lockers are not available'
            ], 404);
        }

        // Validate postal code
        try {
            $validated = $request->validate([
                'postal_code' => 'required|string|regex:/^\d{5}$/'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid postal code format',
                'errors' => $e->errors()
            ], 422);
        }

        $postalCode = $validated['postal_code'];

        // Check if provider is available
        if (!$this->lockerProvider->isAvailable()) {
            return response()->json([
                'success' => false,
                'message' => 'Locker service is temporarily unavailable'
            ], 503);
        }

        // Search for lockers
        $lockers = $this->lockerProvider->searchByPostalCode($postalCode);

        return response()->json([
            'success' => true,
            'data' => LockerResource::collection(collect($lockers))
        ], 200);
    }
}