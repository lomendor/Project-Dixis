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
            // Core order data
            'user_id' => 'nullable|integer|exists:users,id',
            'items' => 'required|array|min:1|max:50',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1|max:999',
            
            // Payment & Currency
            'payment_method' => 'required|string|max:50',
            'currency' => 'required|string|in:EUR,USD',
            
            // Shipping Information  
            'shipping_method' => 'required|string|in:HOME,PICKUP,COURIER',
            'shipping_address' => 'required|string|min:5|max:200',
            'shipping_cost' => 'required|numeric|min:0|max:999.99',
            'shipping_carrier' => 'required|string|max:100',
            'shipping_eta_days' => 'required|integer|min:0|max:90',
            
            // Address Details
            'postal_code' => 'required|string|regex:/^\d{5}$/',
            'city' => 'required|string|min:2|max:50|regex:/^[\p{L}\s\-\'\.]+$/u',
            
            // Optional fields
            'notes' => 'nullable|string|max:500',
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            // Items validation
            'items.required' => 'Τουλάχιστον ένα προϊόν είναι υποχρεωτικό.',
            'items.min' => 'Τουλάχιστον ένα προϊόν είναι υποχρεωτικό.',
            'items.max' => 'Το καλάθι περιέχει πολλά προϊόντα (μέγιστο 50).',
            'items.*.product_id.required' => 'Κάθε προϊόν πρέπει να έχει ID.',
            'items.*.product_id.exists' => 'Ένα ή περισσότερα προϊόντα δεν υπάρχουν.',
            'items.*.quantity.required' => 'Κάθε προϊόν πρέπει να έχει ποσότητα.',
            'items.*.quantity.min' => 'Η ποσότητα πρέπει να είναι τουλάχιστον 1.',
            'items.*.quantity.max' => 'Η ποσότητα είναι πολύ υψηλή (μέγιστο 999).',
            
            // Payment & Currency
            'payment_method.required' => 'Η μέθοδος πληρωμής είναι υποχρεωτική.',
            'payment_method.max' => 'Η μέθοδος πληρωμής είναι πολύ μεγάλη.',
            'currency.required' => 'Το νόμισμα είναι υποχρεωτικό.',
            'currency.in' => 'Το νόμισμα πρέπει να είναι EUR ή USD.',
            
            // Shipping Information
            'shipping_method.required' => 'Η μέθοδος παράδοσης είναι υποχρεωτική.',
            'shipping_method.in' => 'Η μέθοδος παράδοσης πρέπει να είναι HOME, PICKUP ή COURIER.',
            'shipping_address.required' => 'Η διεύθυνση παράδοσης είναι υποχρεωτική.',
            'shipping_address.min' => 'Η διεύθυνση παράδοσης πρέπει να έχει τουλάχιστον 5 χαρακτήρες.',
            'shipping_address.max' => 'Η διεύθυνση παράδοσης είναι πολύ μεγάλη.',
            'shipping_cost.required' => 'Το κόστος παράδοσης είναι υποχρεωτικό.',
            'shipping_cost.numeric' => 'Το κόστος παράδοσης πρέπει να είναι αριθμός.',
            'shipping_cost.min' => 'Το κόστος παράδοσης δεν μπορεί να είναι αρνητικό.',
            'shipping_cost.max' => 'Το κόστος παράδοσης είναι πολύ υψηλό.',
            'shipping_carrier.required' => 'Ο μεταφορέας είναι υποχρεωτικός.',
            'shipping_carrier.max' => 'Το όνομα του μεταφορέα είναι πολύ μεγάλο.',
            'shipping_eta_days.required' => 'Οι εκτιμώμενες ημέρες παράδοσης είναι υποχρεωτικές.',
            'shipping_eta_days.integer' => 'Οι εκτιμώμενες ημέρες πρέπει να είναι ακέραιος αριθμός.',
            'shipping_eta_days.min' => 'Οι εκτιμώμενες ημέρες δεν μπορούν να είναι αρνητικές.',
            'shipping_eta_days.max' => 'Οι εκτιμώμενες ημέρες είναι πολλές (μέγιστο 90).',
            
            // Address Details
            'postal_code.required' => 'Ο ταχυδρομικός κώδικας είναι υποχρεωτικός.',
            'postal_code.regex' => 'Ο ταχυδρομικός κώδικας πρέπει να έχει ακριβώς 5 ψηφία.',
            'city.required' => 'Η πόλη είναι υποχρεωτική.',
            'city.min' => 'Η πόλη πρέπει να έχει τουλάχιστον 2 χαρακτήρες.',
            'city.max' => 'Το όνομα της πόλης είναι πολύ μεγάλο.',
            'city.regex' => 'Η πόλη περιέχει μη έγκυρους χαρακτήρες.',
            
            // Optional fields
            'notes.max' => 'Οι παρατηρήσεις δεν μπορούν να υπερβαίνουν τους 500 χαρακτήρες.',
        ];
    }
}