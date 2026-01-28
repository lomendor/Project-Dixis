<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProducerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // TODO: Implement proper authorization logic
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $producerId = $this->route('producer') ? $this->route('producer')->id ?? $this->route('producer') : null;

        return [
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:producers,slug,'.$producerId,
            'business_name' => 'nullable|string|max:255',
            'tax_id' => 'nullable|string|max:20',
            'tax_office' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'region' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'social_media' => 'nullable|array',
            'social_media.*' => 'string|max:255',
            'verified' => 'nullable|boolean',
            'is_verified' => 'nullable|boolean',
            'uses_custom_shipping_rates' => 'nullable|boolean',
            // Pass PRODUCER-THRESHOLD-POSTALCODE-01: Per-producer free shipping threshold
            'free_shipping_threshold_eur' => 'nullable|numeric|min:0|max:9999.99',
            'status' => 'nullable|string|in:active,inactive,pending',
            'is_active' => 'nullable|boolean',
            'user_id' => 'nullable|exists:users,id',
        ];
    }
}
