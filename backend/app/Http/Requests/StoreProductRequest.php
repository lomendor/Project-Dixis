<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Authorization handled by ProductPolicy in controller
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $user = $this->user();

        return [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:products,slug',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0|lt:price',
            'weight_per_unit' => 'nullable|numeric|min:0',
            'unit' => 'nullable|string|max:50',
            'stock' => 'nullable|integer|min:0',
            'category' => 'nullable|string|max:100',
            'is_organic' => 'nullable|boolean',
            'is_seasonal' => 'nullable|boolean',
            'cultivation_type' => 'nullable|string|in:conventional,organic_certified,organic_transitional,biodynamic,traditional_natural,other',
            'cultivation_description' => 'nullable|string|max:1000',
            'image_url' => 'nullable|url|max:500',
            'status' => 'nullable|string|in:available,unavailable,discontinued',
            'is_active' => 'nullable|boolean',
            // producer_id: required for admin (can assign to any producer)
            // optional for producer (auto-set server-side to auth user's producer_id)
            'producer_id' => $user && $user->role === 'admin'
                ? 'required|exists:producers,id'
                : 'nullable|exists:producers,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'price.min' => 'Price must be greater than or equal to 0.',
            'discount_price.lt' => 'Discount price must be less than the regular price.',
            'producer_id.required' => 'A producer must be assigned to the product.',
            'producer_id.exists' => 'The selected producer does not exist.',
        ];
    }
}
