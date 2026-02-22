<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProducerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Pass PAYOUT-01: IBAN visible only to the producer themselves or admin
        $user = $request->user();
        $isOwnerOrAdmin = $user && (
            ($user->producer && $user->producer->id === $this->id) ||
            !empty($user->is_admin)
        );

        return array_merge([
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'business_name' => $this->business_name,
            'tax_id' => $this->tax_id,
            'tax_office' => $this->tax_office,
            'description' => $this->description,
            'location' => $this->location,
            'address' => $this->address,
            'city' => $this->city,
            'postal_code' => $this->postal_code,
            'region' => $this->region,
            'phone' => $this->phone,
            'email' => $this->email,
            'website' => $this->website,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'social_media' => $this->social_media,
            'verified' => $this->verified,
            'is_verified' => $this->is_verified,
            'uses_custom_shipping_rates' => $this->uses_custom_shipping_rates,
            // Pass PRODUCER-THRESHOLD-POSTALCODE-01: Per-producer free shipping threshold
            'free_shipping_threshold_eur' => $this->free_shipping_threshold_eur,
            'status' => $this->status,
            'is_active' => $this->is_active,
            // Onboarding V2: public fields
            'onboarding_completed_at' => $this->onboarding_completed_at?->toISOString(),
            'product_categories' => $this->product_categories,
            'haccp_declaration_accepted' => $this->haccp_declaration_accepted,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ], $isOwnerOrAdmin ? [
            // Pass PAYOUT-01: Banking details (owner/admin only)
            'iban' => $this->iban,
            'bank_account_holder' => $this->bank_account_holder,
            // Onboarding V2: sensitive fields (owner/admin only)
            'tax_registration_doc_url' => $this->tax_registration_doc_url,
            'efet_notification_doc_url' => $this->efet_notification_doc_url,
            'haccp_declaration_doc_url' => $this->haccp_declaration_doc_url,
            'beekeeper_registry_number' => $this->beekeeper_registry_number,
            'cpnp_notification_number' => $this->cpnp_notification_number,
            'responsible_person_name' => $this->responsible_person_name,
        ] : []);
    }
}
