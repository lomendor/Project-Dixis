<?php

namespace App\Http\Controllers\Api\Producer;

use App\Http\Controllers\Controller;
use App\Services\Payment\StripeConnectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

/**
 * Pass STRIPE-CONNECT-01: Producer Stripe Connect onboarding & management.
 *
 * Endpoints for producers to create Express accounts, complete KYC,
 * check status, and access the Stripe Express Dashboard.
 */
class StripeConnectController extends Controller
{
    private StripeConnectService $connectService;

    public function __construct(StripeConnectService $connectService)
    {
        $this->connectService = $connectService;
    }

    /**
     * Start Stripe Connect onboarding: create account + return onboarding URL.
     *
     * POST /api/v1/producer/stripe/onboard
     */
    public function onboard(): JsonResponse
    {
        if (!StripeConnectService::isEnabled()) {
            return response()->json(['error' => 'Stripe Connect is not enabled'], 503);
        }

        $producer = auth()->user()?->producer;
        if (!$producer) {
            return response()->json(['error' => 'Producer profile not found'], 404);
        }

        try {
            // Create account if not already created
            if (empty($producer->stripe_connect_id)) {
                $this->connectService->createConnectedAccount($producer);
                $producer->refresh();
            }

            // Generate onboarding link
            $url = $this->connectService->createAccountLink($producer);

            return response()->json([
                'onboarding_url' => $url,
                'account_id' => $producer->stripe_connect_id,
            ]);
        } catch (\Exception $e) {
            Log::error('Stripe Connect onboarding failed', [
                'producer_id' => $producer->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to start Stripe onboarding',
                'details' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get current Stripe Connect status.
     *
     * GET /api/v1/producer/stripe/status
     */
    public function status(): JsonResponse
    {
        $producer = auth()->user()?->producer;
        if (!$producer) {
            return response()->json(['error' => 'Producer profile not found'], 404);
        }

        if (empty($producer->stripe_connect_id)) {
            return response()->json([
                'connected' => false,
                'status' => 'not_connected',
                'charges_enabled' => false,
                'payouts_enabled' => false,
            ]);
        }

        try {
            // Sync latest status from Stripe
            $accountStatus = $this->connectService->getAccountStatus($producer->stripe_connect_id);
            $this->connectService->syncProducerStatus($producer, $accountStatus);
            $producer->refresh();

            return response()->json([
                'connected' => true,
                'status' => $producer->stripe_connect_status,
                'charges_enabled' => $producer->stripe_charges_enabled,
                'payouts_enabled' => $producer->stripe_payouts_enabled,
                'requirements' => $accountStatus['requirements'],
            ]);
        } catch (\Exception $e) {
            Log::error('Stripe Connect status check failed', [
                'producer_id' => $producer->id,
                'error' => $e->getMessage(),
            ]);

            // Return cached status on error
            return response()->json([
                'connected' => true,
                'status' => $producer->stripe_connect_status ?? 'unknown',
                'charges_enabled' => (bool) $producer->stripe_charges_enabled,
                'payouts_enabled' => (bool) $producer->stripe_payouts_enabled,
            ]);
        }
    }

    /**
     * Get Express Dashboard login link.
     *
     * GET /api/v1/producer/stripe/dashboard
     */
    public function dashboard(): JsonResponse
    {
        $producer = auth()->user()?->producer;
        if (!$producer || empty($producer->stripe_connect_id)) {
            return response()->json(['error' => 'No Stripe account connected'], 404);
        }

        try {
            $url = $this->connectService->createLoginLink($producer->stripe_connect_id);

            return response()->json(['dashboard_url' => $url]);
        } catch (\Exception $e) {
            Log::error('Stripe Express Dashboard link failed', [
                'producer_id' => $producer->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json(['error' => 'Failed to create dashboard link'], 500);
        }
    }

    /**
     * Get a fresh onboarding link (if previous expired).
     *
     * GET /api/v1/producer/stripe/onboard/refresh
     */
    public function refreshOnboarding(): JsonResponse
    {
        if (!StripeConnectService::isEnabled()) {
            return response()->json(['error' => 'Stripe Connect is not enabled'], 503);
        }

        $producer = auth()->user()?->producer;
        if (!$producer || empty($producer->stripe_connect_id)) {
            return response()->json(['error' => 'No Stripe account found. Start onboarding first.'], 404);
        }

        try {
            $url = $this->connectService->createAccountLink($producer);

            return response()->json(['onboarding_url' => $url]);
        } catch (\Exception $e) {
            Log::error('Stripe Connect onboarding refresh failed', [
                'producer_id' => $producer->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json(['error' => 'Failed to refresh onboarding link'], 500);
        }
    }
}
