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

            // Pass PAYMENT-INIT-ORDER-ID-01: Canonical order ID for payment initialization
            // For multi-producer, use first child order ID (all share same PaymentIntent)
            'payment_order_id' => $this->when($this->relationLoaded('orders') && $this->orders->isNotEmpty(), function () {
                return $this->orders->first()->id;
            }),

            // Timestamps
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            // Child orders (each order goes to a different producer)
            $this->mergeWhen($this->relationLoaded('orders'), [
                'orders' => OrderResource::collection($this->orders ?? []),
            ]),

            // Pass PROD-CHECKOUT-SAFETY-01: Aggregate shipping_lines from all child orders
            // Flattens all shipping lines from N orders into a single array at checkout session level
            'shipping_lines' => $this->when($this->relationLoaded('orders'), function () {
                return $this->orders
                    ->filter(fn ($order) => $order->relationLoaded('shippingLines'))
                    ->flatMap(fn ($order) => $order->shippingLines->map(fn ($line) => [
                        'producer_id' => $line->producer_id,
                        'producer_name' => $line->producer_name,
                        'subtotal' => number_format((float) $line->subtotal, 2),
                        'shipping_cost' => number_format((float) $line->shipping_cost, 2),
                        'shipping_method' => $line->shipping_method,
                        'free_shipping_applied' => (bool) $line->free_shipping_applied,
                    ]))
                    ->values()
                    ->all();
            }, []),
        ];
    }
}
