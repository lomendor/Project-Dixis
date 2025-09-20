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
        return [
            'id' => $this->id,
            'order_number' => 'ORD-'.str_pad($this->id, 6, '0', STR_PAD_LEFT),
            'status' => $this->status,
            'total' => number_format((float) ($this->total ?? $this->total_amount ?? 0), 2),
            'currency' => $this->currency ?? 'EUR', // Use order currency or default to EUR
            'created_at' => $this->created_at?->toISOString(),
            'items_count' => $this->order_items_count ?? $this->orderItems?->count() ?? 0,
            $this->mergeWhen($this->relationLoaded('orderItems'), [
                'items' => OrderItemResource::collection($this->orderItems ?? []),
            ]),
        ];
    }
}
