<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * B2B PIVOT: Subscription endpoints for approved businesses.
 */
class SubscriptionController extends Controller
{
    public function __construct(private SubscriptionService $service) {}

    public function status(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user || ! $user->isApprovedBusiness()) {
            return response()->json(['message' => 'Business approval required'], 403);
        }

        $business = $user->business;
        $active = $business->subscriptions()->active()->first();

        return response()->json([
            'has_active_subscription' => (bool) $active,
            'price_cents' => $this->service->getPriceCents(),
            'subscription' => $active ? [
                'id' => $active->id,
                'status' => $active->status,
                'starts_at' => $active->starts_at?->toISOString(),
                'expires_at' => $active->expires_at?->toISOString(),
                'amount_cents' => $active->amount_cents,
            ] : null,
        ]);
    }

    public function checkout(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user || ! $user->isApprovedBusiness()) {
            return response()->json(['message' => 'Business approval required'], 403);
        }

        $business = $user->business;
        if ($this->service->hasActiveSubscription($business)) {
            return response()->json(['message' => 'Έχετε ήδη ενεργή συνδρομή'], 409);
        }

        try {
            $result = $this->service->createCheckout($business);
            return response()->json($result);
        } catch (\Exception $e) {
            report($e);
            return response()->json(['message' => 'Αποτυχία δημιουργίας πληρωμής'], 500);
        }
    }
}
