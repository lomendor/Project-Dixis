<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Producer;
use App\Services\Payment\StripeConnectService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

/**
 * Pass STRIPE-CONNECT-01: Stripe Connect webhook handler.
 *
 * Separate endpoint for Connect-specific events (account.updated).
 * Uses a different webhook secret from the main Stripe webhook.
 */
class StripeConnectWebhookController extends Controller
{
    private StripeConnectService $connectService;

    public function __construct(StripeConnectService $connectService)
    {
        $this->connectService = $connectService;
    }

    /**
     * Handle incoming Stripe Connect webhook.
     *
     * POST /api/v1/webhooks/stripe-connect
     */
    public function handle(Request $request): Response
    {
        $webhookSecret = config('payments.stripe_connect.webhook_secret');

        if (empty($webhookSecret)) {
            Log::warning('Stripe Connect webhook received but no secret configured');
            return response('Connect webhook secret not configured', 503);
        }

        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');

        if (empty($sigHeader)) {
            return response('Missing signature', 400);
        }

        try {
            $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (\UnexpectedValueException $e) {
            Log::warning('Stripe Connect webhook invalid payload', ['error' => $e->getMessage()]);
            return response('Invalid payload', 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            Log::warning('Stripe Connect webhook signature failed', ['error' => $e->getMessage()]);
            return response('Invalid signature', 400);
        }

        Log::info('Stripe Connect webhook received', [
            'type' => $event->type,
            'id' => $event->id,
            'account' => $event->account ?? null,
        ]);

        switch ($event->type) {
            case 'account.updated':
                $this->handleAccountUpdated($event->data->object);
                break;

            default:
                Log::info('Stripe Connect webhook unhandled event', ['type' => $event->type]);
        }

        return response('OK', 200);
    }

    /**
     * Handle account.updated: sync producer's Stripe status.
     */
    private function handleAccountUpdated($account): void
    {
        $producer = Producer::where('stripe_connect_id', $account->id)->first();

        if (!$producer) {
            Log::warning('Stripe Connect account.updated: producer not found', [
                'account_id' => $account->id,
            ]);
            return;
        }

        $this->connectService->syncProducerStatus($producer, [
            'charges_enabled' => $account->charges_enabled ?? false,
            'payouts_enabled' => $account->payouts_enabled ?? false,
            'details_submitted' => $account->details_submitted ?? false,
        ]);
    }
}
