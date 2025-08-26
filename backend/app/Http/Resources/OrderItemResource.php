<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'product_id' => $this->product_id,
            'product_name' => $this->product_name,
            'quantity' => $this->quantity,
            'unit_price' => number_format((float)$this->unit_price, 2),
            'total_price' => number_format((float)$this->total_price, 2),
        ];
    }
}