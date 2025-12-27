<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
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
            'product_id' => $this->product_id,
            'product_name' => $this->product_name ?? 'Product',
            'product_unit' => $this->product_unit ?? 'τεμ.',
            'quantity' => $this->quantity,
            'unit_price' => number_format((float) $this->unit_price, 2),
            'price' => number_format((float) $this->unit_price, 2), // Alias for frontend
            'total_price' => number_format((float) $this->total_price, 2),
            // Producer info for marketplace-style grouping
            'producer' => $this->whenLoaded('producer', function () {
                return [
                    'id' => $this->producer->id,
                    'name' => $this->producer->name,
                    'slug' => $this->producer->slug ?? null,
                ];
            }),
        ];
    }
}
