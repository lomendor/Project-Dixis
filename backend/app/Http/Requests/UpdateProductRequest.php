<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
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
        $productId = $this->route('product') ? $this->route('product')->id ?? $this->route('product') : null;

        return [
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:products,slug,'.$productId,
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
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
            'producer_id' => 'nullable|exists:producers,id',
        ];
    }

    /**
     * Configure validation for discount_price relative to price
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if ($this->has('discount_price') && $this->discount_price !== null) {
                $price = $this->price ?? $this->route('product')?->price;
                if ($price && $this->discount_price >= $price) {
                    $validator->errors()->add('discount_price', 'Discount price must be less than the regular price.');
                }
            }
        });
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
            'producer_id.exists' => 'The selected producer does not exist.',
        ];
    }
}
