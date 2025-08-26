<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
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
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => number_format((float)$this->price, 2),
            'discount_price' => $this->discount_price ? number_format((float)$this->discount_price, 2) : null,
            'has_discount' => $this->discount_price ? true : false,
            'effective_price' => $this->discount_price ? number_format((float)$this->discount_price, 2) : number_format((float)$this->price, 2),
            'weight_per_unit' => $this->weight_per_unit,
            'unit' => $this->unit,
            'stock' => $this->stock,
            'category' => $this->category,
            'is_organic' => $this->is_organic,
            'is_seasonal' => $this->is_seasonal,
            'image_url' => $this->image_url,
            'status' => $this->status,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'producer' => $this->when($this->relationLoaded('producer') && $this->producer, [
                'id' => $this->producer?->id,
                'name' => $this->producer?->name,
                'slug' => $this->producer?->slug,
                'business_name' => $this->producer?->business_name,
                'location' => $this->producer?->location,
            ]),
        ];
    }
}