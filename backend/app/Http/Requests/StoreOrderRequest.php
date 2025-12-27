<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Public checkout allowed for now
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'user_id' => 'nullable|integer|exists:users,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'currency' => 'required|string|in:EUR,USD',
            'shipping_method' => 'required|string|in:HOME,PICKUP,COURIER',
            'notes' => 'nullable|string|max:1000',
            // Shipping address fields (Pass 44 - Architecture Reconciliation)
            'shipping_address' => 'nullable|array',
            'shipping_address.name' => 'nullable|string|max:255',
            'shipping_address.phone' => 'nullable|string|max:50',
            'shipping_address.email' => 'nullable|email|max:255',
            'shipping_address.line1' => 'nullable|string|max:255',
            'shipping_address.line2' => 'nullable|string|max:255',
            'shipping_address.city' => 'nullable|string|max:100',
            'shipping_address.postal_code' => 'nullable|string|max:20',
            'shipping_address.region' => 'nullable|string|max:100',
            'shipping_address.country' => 'nullable|string|max:100',
            // Payment method (optional, defaults to COD)
            'payment_method' => 'nullable|string|in:COD,CARD,BANK_TRANSFER',
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'items.required' => 'At least one item is required.',
            'items.min' => 'At least one item is required.',
            'items.*.product_id.required' => 'Each item must have a product_id.',
            'items.*.product_id.exists' => 'One or more products do not exist.',
            'items.*.quantity.required' => 'Each item must have a quantity.',
            'items.*.quantity.min' => 'Quantity must be at least 1.',
            'currency.in' => 'Currency must be EUR or USD.',
            'shipping_method.in' => 'Shipping method must be HOME, PICKUP, or COURIER.',
            'notes.max' => 'Notes cannot exceed 1000 characters.',
            'shipping_address.array' => 'Shipping address must be an object.',
            'shipping_address.email.email' => 'Invalid email address format.',
            'payment_method.in' => 'Payment method must be COD, CARD, or BANK_TRANSFER.',
        ];
    }
}
