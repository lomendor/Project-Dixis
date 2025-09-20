<?php

namespace App\Http\Resources\Shipping;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LockerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource['id'],
            'name' => $this->resource['name'],
            'address' => $this->resource['address'],
            'provider' => $this->resource['provider'],
            'lat' => (float) $this->resource['lat'],
            'lng' => (float) $this->resource['lng'],
            'postal_code' => $this->resource['postal_code'],
            'distance' => isset($this->resource['distance']) ? (float) $this->resource['distance'] : null,
            'operating_hours' => $this->resource['operating_hours'] ?? null,
            'notes' => $this->resource['notes'] ?? null,
        ];
    }
}