<?php

namespace App\Http\Controllers\Api;

use App\Services\TestSeedService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class TestSeedController
{
    private TestSeedService $seedService;

    public function __construct(TestSeedService $seedService)
    {
        $this->seedService = $seedService;
    }

    /**
     * Seed minimal shipping test data
     * ONLY active when ALLOW_TEST_LOGIN=true and not in production
     */
    public function seedShipping(Request $request): JsonResponse
    {
        // Security: Only allow in test environments with explicit flag
        if (!$this->isTestSeedAllowed()) {
            abort(404, 'Not Found');
        }

        try {
            Log::info('🌱 TestSeed: Starting shipping data seed...');

            $result = $this->seedService->seedShippingData();

            Log::info('🌱 TestSeed: Shipping seed completed', $result);

            return response()->json([
                'success' => true,
                'message' => 'Shipping test data seeded successfully',
                'data' => $result,
            ]);

        } catch (\Exception $e) {
            Log::error('🌱 TestSeed: Shipping seed failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to seed shipping test data',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reset (cleanup) test seeded data
     * ONLY active when ALLOW_TEST_LOGIN=true and not in production
     */
    public function resetSeed(Request $request): JsonResponse
    {
        // Security: Only allow in test environments with explicit flag
        if (!$this->isTestSeedAllowed()) {
            abort(404, 'Not Found');
        }

        try {
            Log::info('🧹 TestSeed: Starting test data cleanup...');

            $result = $this->seedService->resetTestData();

            Log::info('🧹 TestSeed: Cleanup completed', $result);

            return response()->json([
                'success' => true,
                'message' => 'Test data cleaned up successfully',
                'data' => $result,
            ]);

        } catch (\Exception $e) {
            Log::error('🧹 TestSeed: Cleanup failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to cleanup test data',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get current test seed status
     */
    public function status(Request $request): JsonResponse
    {
        if (!$this->isTestSeedAllowed()) {
            abort(404, 'Not Found');
        }

        $status = $this->seedService->getTestSeedStatus();

        return response()->json([
            'success' => true,
            'status' => $status,
        ]);
    }

    /**
     * Check if test seeding is allowed
     * Same security requirements as test login
     */
    private function isTestSeedAllowed(): bool
    {
        // Must have explicit flag
        if (!env('ALLOW_TEST_LOGIN', false)) {
            return false;
        }

        // Must not be in production
        $appEnv = app()->environment();
        if ($appEnv === 'production') {
            return false;
        }

        // Must be in testing, local, or CI environment
        $isCI = env('CI', false);

        return $appEnv === 'testing' || $appEnv === 'local' || $isCI;
    }
}