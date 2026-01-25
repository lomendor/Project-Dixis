<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Pass MP-ORDERS-SPLIT-01: CheckoutSession Resource
 *
 * Represents a multi-producer checkout session with N child orders.
 */
class CheckoutSessionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => 'checkout_session',
            'status' => $this->status,
            'is_multi_producer' => $this->order_count > 1,
            'order_count' => $this->order_count,

            // Financial totals (sum of all child orders)
            'subtotal' => number_format((float) $this->subtotal, 2),
            'shipping_total' => number_format((float) $this->shipping_total, 2),
            'total' => number_format((float) $this->total, 2),
            'currency' => $this->currency ?? 'EUR',

            // Stripe payment (will be set in Phase 3)
            'stripe_payment_intent_id' => $this->stripe_payment_intent_id,

            // Timestamps
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            // Child orders (each order goes to a different producer)
            $this->mergeWhen($this->relationLoaded('orders'), [
                'orders' => OrderResource::collection($this->orders ?? []),
            ]),
        ];
    }
}
