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
     * Get custom messages for validator errors (Greek).
     */
    public function messages(): array
    {
        return [
            'tax_id.unique' => 'Αυτό το ΑΦΜ είναι ήδη καταχωρημένο σε άλλον παραγωγό.',
            'tax_id.regex' => 'Το ΑΦΜ πρέπει να αποτελείται από 9 ψηφία.',
            'iban.regex' => 'Μη έγκυρη μορφή IBAN.',
            'email.email' => 'Μη έγκυρη διεύθυνση email.',
            'slug.unique' => 'Αυτό το slug χρησιμοποιείται ήδη.',
        ];
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Fix: For flat routes like PATCH /v1/producer/profile (no {producer} param),
        // resolve producer ID from the authenticated user instead of route binding.
        $producerId = $this->route('producer')
            ? ($this->route('producer')->id ?? $this->route('producer'))
            : ($this->user()?->producer?->id);

        return [
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:producers,slug,'.$producerId,
            'business_name' => 'nullable|string|max:255',
            'tax_id' => ['nullable', 'string', 'max:20', 'regex:/^\d{9}$/', 'unique:producers,tax_id,'.$producerId],
            'tax_office' => 'nullable|string|max:255',
            'food_license_number' => 'nullable|string|max:100',
            'agreement_accepted_at' => 'nullable|date',
            // Pass PAYOUT-01: IBAN for producer settlements (any EU IBAN format)
            'iban' => ['nullable', 'string', 'max:34', 'regex:/^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/'],
            'bank_account_holder' => 'nullable|string|max:255',
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
            // Onboarding V2
            'onboarding_completed_at' => 'nullable|date',
            'product_categories' => 'nullable|array',
            'product_categories.*' => 'string|max:50',
            'tax_registration_doc_url' => 'nullable|string|max:500',
            'efet_notification_doc_url' => 'nullable|string|max:500',
            'haccp_declaration_doc_url' => 'nullable|string|max:500',
            'haccp_declaration_accepted' => 'nullable|boolean',
            'beekeeper_registry_number' => 'nullable|string|max:100',
            'cpnp_notification_number' => 'nullable|string|max:100',
            'responsible_person_name' => 'nullable|string|max:255',
        ];
    }
}
