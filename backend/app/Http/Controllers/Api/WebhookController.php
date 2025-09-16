<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Payment\PaymentProviderFactory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    /**
     * Handle Stripe webhook events.
     */
    public function stripe(Request $request): JsonResponse
    {
        try {
            // Get the raw payload and signature
            $payload = $request->getContent();
            $signature = $request->header('Stripe-Signature');

            if (!$signature) {
                Log::warning('Stripe webhook received without signature');
                return response()->json(['error' => 'No signature provided'], 400);
            }

            // Decode payload to array
            $payloadArray = json_decode($payload, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('Stripe webhook: Invalid JSON payload');
                return response()->json(['error' => 'Invalid JSON'], 400);
            }

            // Get Stripe payment provider
            $stripeProvider = PaymentProviderFactory::create('stripe');
            $result = $stripeProvider->handleWebhook($payloadArray, $signature);

            if (!$result['success']) {
                Log::error('Stripe webhook processing failed', [
                    'error' => $result['error'] ?? 'unknown',
                    'message' => $result['error_message'] ?? 'Processing failed',
                ]);

                return response()->json([
                    'error' => $result['error'] ?? 'processing_failed',
                    'message' => $result['error_message'] ?? 'Webhook processing failed'
                ], 400);
            }

            Log::info('Stripe webhook processed successfully', [
                'event_type' => $result['event_type'] ?? 'unknown',
                'processed' => $result['processed'] ?? false,
                'order_id' => $result['order_id'] ?? null,
            ]);

            return response()->json([
                'message' => 'Webhook processed successfully',
                'event_type' => $result['event_type'],
                'processed' => $result['processed'],
            ]);

        } catch (\Exception $e) {
            Log::error('Stripe webhook processing exception', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'internal_server_error',
                'message' => 'Webhook processing failed'
            ], 500);
        }
    }

    /**
     * Handle Viva Payments webhook events (placeholder for future implementation).
     */
    public function viva(Request $request): JsonResponse
    {
        Log::info('Viva Payments webhook received (not yet implemented)');

        return response()->json([
            'message' => 'Viva Payments webhooks not yet implemented',
            'status' => 'not_implemented'
        ], 501);
    }

    /**
     * Handle generic payment webhook events.
     * Routes to specific provider based on configuration.
     */
    public function payment(Request $request): JsonResponse
    {
        try {
            $activeProvider = PaymentProviderFactory::getActiveProvider();

            switch ($activeProvider) {
                case 'stripe':
                    return $this->stripe($request);

                case 'viva':
                    return $this->viva($request);

                case 'fake':
                    // Fake provider webhooks for testing
                    $payload = json_decode($request->getContent(), true);
                    Log::info('Fake payment webhook received', ['payload' => $payload]);

                    return response()->json([
                        'message' => 'Fake webhook processed successfully',
                        'provider' => 'fake',
                        'event_type' => $payload['type'] ?? 'unknown',
                    ]);

                default:
                    Log::warning('Webhook received for unsupported provider', [
                        'provider' => $activeProvider,
                    ]);

                    return response()->json([
                        'error' => 'unsupported_provider',
                        'message' => "Webhooks not supported for provider: {$activeProvider}"
                    ], 400);
            }

        } catch (\Exception $e) {
            Log::error('Generic payment webhook processing failed', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'internal_server_error',
                'message' => 'Webhook processing failed'
            ], 500);
        }
    }
}