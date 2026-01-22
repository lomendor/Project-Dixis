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
        // Calculate total from subtotal + shipping if total is not set or is zero
        // Use ?: instead of ?? to handle 0 values (0 is falsy but not null)
        $subtotal = (float) ($this->subtotal ?? 0);
        $shippingCost = (float) ($this->shipping_cost ?? $this->shipping_amount ?? 0);
        $taxAmount = (float) ($this->tax_amount ?? 0);
        $calculatedTotal = $subtotal + $shippingCost + $taxAmount;

        // Prefer stored total if > 0, otherwise use calculated
        $total = ((float) $this->total > 0) ? $this->total
               : (((float) $this->total_amount > 0) ? $this->total_amount
               : $calculatedTotal);

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
            'status' => $this->status ?? 'pending',
            'payment_status' => $this->payment_status ?? 'pending',
            'payment_method' => $this->payment_method ?? 'cod', // Default: Cash on Delivery
            'payment_provider' => $this->payment_provider, // Pass 51: stripe, null for COD
            'payment_reference' => $this->payment_reference, // Pass 51: external session/transaction ID
            'shipping_method' => $shippingMethodCode,
            'shipping_method_label' => $shippingMethodLabels[$shippingMethodCode] ?? $shippingMethodCode,
            // Shipping address (structured object, null if not set)
            'shipping_address' => $this->shipping_address,
            // Delivery notes
            'notes' => $this->notes,
            // Financial fields - use both new and legacy field names for frontend compatibility
            'subtotal' => number_format((float) ($this->subtotal ?? 0), 2),
            'tax_amount' => number_format((float) ($this->tax_amount ?? 0), 2),
            'shipping_amount' => number_format((float) ($this->shipping_cost ?? $this->shipping_amount ?? 0), 2),
            'shipping_cost' => number_format((float) ($this->shipping_cost ?? $this->shipping_amount ?? 0), 2),
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
        ];
    }
}
