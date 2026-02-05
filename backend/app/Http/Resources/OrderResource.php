<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Extract financial fields, preferring non-zero stored values
        $subtotal = (float) ($this->subtotal ?? 0);
        $taxAmount = (float) ($this->tax_amount ?? 0);

        // Shipping: prefer whichever field has a positive value
        // shipping_cost is the new field, shipping_amount is legacy
        $storedShippingCost = (float) ($this->shipping_cost ?? 0);
        $storedShippingAmount = (float) ($this->shipping_amount ?? 0);
        $shippingCost = ($storedShippingCost > 0) ? $storedShippingCost
                      : (($storedShippingAmount > 0) ? $storedShippingAmount : 0);

        // Total: prefer stored if > 0
        $storedTotal = (float) ($this->total ?? 0);
        $storedTotalAmount = (float) ($this->total_amount ?? 0);
        $calculatedTotal = $subtotal + $shippingCost + $taxAmount;

        // Check for legacy orders with hidden shipping in total
        // If stored total > calculated breakdown AND shipping shows 0, infer the hidden shipping
        $total = ($storedTotal > 0) ? $storedTotal
               : (($storedTotalAmount > 0) ? $storedTotalAmount : $calculatedTotal);

        // Invariant check: if total doesn't match breakdown, shipping may be hidden in total
        // Infer the actual shipping to maintain invariant: total = subtotal + tax + shipping
        $breakdownTotal = $subtotal + $taxAmount + $shippingCost;
        $impliedShipping = $shippingCost;
        if (abs($total - $breakdownTotal) > 0.01 && $shippingCost == 0) {
            // Legacy order: shipping was added to total but not stored separately
            $impliedShipping = $total - $subtotal - $taxAmount;
            if ($impliedShipping < 0) {
                $impliedShipping = 0; // Sanity check
            }
        }

        // Shipping method labels (Greek)
        $shippingMethodLabels = [
            'HOME' => 'Παράδοση στο σπίτι',
            'PICKUP' => 'Παραλαβή από κατάστημα',
            'COURIER' => 'Μεταφορική εταιρεία',
        ];
        $shippingMethodCode = $this->shipping_method ?? 'HOME';

        return [
            'id' => $this->id,
            'order_number' => 'ORD-'.str_pad($this->id, 6, '0', STR_PAD_LEFT),
            // Pass TRACKING-DISPLAY-01: Public token for customer tracking
            'public_token' => $this->public_token,
            // Pass MP-ORDERS-SPLIT-01: Child order indicator
            'checkout_session_id' => $this->checkout_session_id,
            'is_child_order' => (bool) $this->is_child_order,
            'status' => $this->status ?? 'pending',
            'payment_status' => $this->payment_status ?? 'pending',
            'payment_method' => $this->payment_method ?? 'cod', // Default: Cash on Delivery
            'payment_provider' => $this->payment_provider, // Pass 51: stripe, null for COD
            'payment_reference' => $this->payment_reference, // Pass 51: external session/transaction ID
            'shipping_method' => $shippingMethodCode,
            'shipping_method_label' => $shippingMethodLabels[$shippingMethodCode] ?? $shippingMethodCode,
            // PII: shipping_address removed from public API responses (GDPR/security)
            // Delivery notes
            'notes' => $this->notes,
            // Financial fields - use both new and legacy field names for frontend compatibility
            // Use implied shipping to maintain invariant: total = subtotal + tax + shipping
            'subtotal' => number_format($subtotal, 2),
            'tax_amount' => number_format($taxAmount, 2),
            'shipping_amount' => number_format($impliedShipping, 2),
            'shipping_cost' => number_format($impliedShipping, 2),
            'total' => number_format((float) $total, 2),
            'total_amount' => number_format((float) $total, 2), // Alias for frontend compatibility
            'currency' => $this->currency ?? 'EUR',
            'created_at' => $this->created_at?->toISOString(),
            'items_count' => $this->order_items_count ?? $this->orderItems?->count() ?? 0,
            // Always include items when loaded
            $this->mergeWhen($this->relationLoaded('orderItems'), [
                'items' => OrderItemResource::collection($this->orderItems ?? []),
                'order_items' => OrderItemResource::collection($this->orderItems ?? []), // Alias
            ]),
            // Pass MP-ORDERS-SHIPPING-V1-02: Include per-producer shipping breakdown
            $this->mergeWhen($this->relationLoaded('shippingLines'), [
                'shipping_lines' => $this->shippingLines->map(fn ($line) => [
                    'producer_id' => $line->producer_id,
                    'producer_name' => $line->producer_name,
                    'subtotal' => number_format((float) $line->subtotal, 2),
                    'shipping_cost' => number_format((float) $line->shipping_cost, 2),
                    'shipping_method' => $line->shipping_method,
                    'free_shipping_applied' => (bool) $line->free_shipping_applied,
                ]),
                'shipping_total' => number_format(
                    $this->shippingLines->sum('shipping_cost'),
                    2
                ),
                'is_multi_producer' => $this->shippingLines->count() > 1,
            ]),
        ];
    }
}
