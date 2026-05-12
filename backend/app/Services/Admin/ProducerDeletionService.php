<?php

namespace App\Services\Admin;

use App\Models\Producer;
use App\Models\User;
use App\Services\Payment\StripeConnectService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * ADMIN-PRODUCER-DELETE-01: Owns the two-mode producer deletion flow.
 *
 * Mode is chosen automatically from commerce activity, NOT from admin input:
 *   - "hard"  : zero references in order_items / order_shipping_lines /
 *               commission_settlements. Producer row is destroyed, cascade
 *               rules clean up products/messages/digests, and the linked User
 *               row is destroyed too — UNLESS the user has customer orders,
 *               in which case the user is anonymized instead (cascading
 *               orders.user_id would otherwise wipe a customer's history).
 *   - "soft"  : at least one reference exists. Producer PII is cleared and
 *               `anonymized_at` is set so DAC7/DSA traceability is preserved
 *               on the historical orders. Linked user is anonymized.
 *
 * External cleanup (Stripe Connect, S3 docs) runs after the DB transaction.
 * Failures are logged but never roll back the DB change.
 */
class ProducerDeletionService
{
    public function __construct(private StripeConnectService $stripe) {}

    /**
     * Inspect a producer and return the deletion plan without mutating anything.
     *
     * @return array{
     *     mode: 'hard'|'soft',
     *     references: array{order_items:int, order_shipping_lines:int, commission_settlements:int},
     *     user_will_be_deleted: bool,
     *     has_stripe_connect: bool,
     *     doc_urls: list<string>,
     * }
     */
    public function previewDeletion(Producer $producer): array
    {
        $orderItems = DB::table('order_items')->where('producer_id', $producer->id)->count();
        $shippingLines = DB::table('order_shipping_lines')->where('producer_id', $producer->id)->count();
        $settlements = DB::table('commission_settlements')->where('producer_id', $producer->id)->count();

        $mode = ($orderItems > 0 || $shippingLines > 0 || $settlements > 0) ? 'soft' : 'hard';

        $userWillBeDeleted = false;
        if ($mode === 'hard' && $producer->user_id) {
            $customerOrderCount = DB::table('orders')->where('user_id', $producer->user_id)->count();
            $userWillBeDeleted = $customerOrderCount === 0;
        }

        return [
            'mode' => $mode,
            'references' => [
                'order_items' => $orderItems,
                'order_shipping_lines' => $shippingLines,
                'commission_settlements' => $settlements,
            ],
            'user_will_be_deleted' => $userWillBeDeleted,
            'has_stripe_connect' => !empty($producer->stripe_connect_id),
            'doc_urls' => array_values(array_filter([
                $producer->image_url,
                $producer->tax_registration_doc_url,
                $producer->efet_notification_doc_url,
                $producer->haccp_declaration_doc_url,
            ])),
        ];
    }

    /**
     * Execute the deletion. DB mutations run inside a transaction. External
     * cleanup (Stripe/S3) is deferred to the caller via the return value so
     * it stays best-effort and visible in the admin audit response.
     *
     * @return array{
     *     mode: 'hard'|'soft',
     *     producer_id: int,
     *     user_id: int|null,
     *     user_anonymized: bool,
     *     references: array<string,int>,
     *     doc_urls_to_clean: list<string>,
     *     stripe_disconnect_ok: bool,
     *     snapshot: array<string,mixed>,
     * }
     */
    public function executeDeletion(Producer $producer, ?string $reason = null): array
    {
        $plan = $this->previewDeletion($producer);
        $snapshot = $this->buildAuditSnapshot($producer);
        $userId = $producer->user_id;
        $userAnonymized = false;
        $stripeOk = $this->stripe->disconnectProducer($producer);

        DB::transaction(function () use ($producer, $plan, $reason, &$userAnonymized) {
            if ($plan['mode'] === 'hard') {
                $producer->delete();
                if ($plan['user_will_be_deleted']) {
                    $this->deleteUser($producer->user_id);
                } elseif ($producer->user_id) {
                    $this->anonymizeUser($producer->user_id);
                    $userAnonymized = true;
                }
                return;
            }
            // soft mode
            $this->anonymizeProducer($producer, $reason);
            if ($producer->user_id) {
                $this->anonymizeUser($producer->user_id);
                $userAnonymized = true;
            }
        });

        Log::info('[Admin] Producer deletion executed', [
            'producer_id' => $snapshot['id'],
            'mode' => $plan['mode'],
            'user_id' => $userId,
            'stripe_disconnect_ok' => $stripeOk,
            'doc_urls_count' => count($plan['doc_urls']),
        ]);

        return [
            'mode' => $plan['mode'],
            'producer_id' => (int) $snapshot['id'],
            'user_id' => $userId,
            'user_anonymized' => $userAnonymized,
            'references' => $plan['references'],
            'doc_urls_to_clean' => $plan['doc_urls'],
            'stripe_disconnect_ok' => $stripeOk,
            'snapshot' => $snapshot,
        ];
    }

    private function anonymizeProducer(Producer $producer, ?string $reason): void
    {
        $producer->update([
            'name' => 'Διαγραφημένος Παραγωγός',
            'business_name' => null,
            'description' => null,
            'email' => null,
            'phone' => null,
            'address' => null,
            'city' => null,
            'postal_code' => null,
            'region' => null,
            'location' => null,
            'website' => null,
            'tax_id' => null,
            'tax_office' => null,
            'food_license_number' => null,
            'iban' => null,
            'bank_account_holder' => null,
            'social_media' => null,
            'image_url' => null,
            'latitude' => null,
            'longitude' => null,
            'tax_registration_doc_url' => null,
            'efet_notification_doc_url' => null,
            'haccp_declaration_doc_url' => null,
            'beekeeper_registry_number' => null,
            'cpnp_notification_number' => null,
            'responsible_person_name' => null,
            'stripe_connect_id' => null,
            'stripe_connect_status' => null,
            'stripe_charges_enabled' => false,
            'stripe_payouts_enabled' => false,
            'is_active' => false,
            'anonymized_at' => now(),
            'deletion_reason' => $reason,
        ]);
    }

    private function anonymizeUser(int $userId): void
    {
        $user = User::find($userId);
        if (! $user || $user->isAnonymized()) {
            return;
        }
        $user->tokens()->delete();
        $user->update([
            'name' => 'Διαγραφημένος Χρήστης',
            'email' => 'deleted-' . Str::uuid()->toString() . '@dixis.local',
            'password' => Hash::make(Str::random(64)),
            'email_verified_at' => null,
            'anonymized_at' => now(),
        ]);
    }

    private function deleteUser(int $userId): void
    {
        $user = User::find($userId);
        if (! $user) {
            return;
        }
        $user->tokens()->delete();
        $user->delete();
    }

    /**
     * Snapshot used for the AdminAuditLog row. PII-safe — never includes
     * password, IBAN, raw tax_id, or document URLs in plaintext.
     */
    private function buildAuditSnapshot(Producer $producer): array
    {
        return [
            'id' => $producer->id,
            'name' => $producer->name,
            'business_name' => $producer->business_name,
            'email_domain' => $producer->email ? substr(strrchr($producer->email, '@') ?: '', 1) : null,
            'has_email' => !empty($producer->email),
            'has_phone' => !empty($producer->phone),
            'has_iban' => !empty($producer->iban),
            'has_tax_id' => !empty($producer->tax_id),
            'has_stripe_connect' => !empty($producer->stripe_connect_id),
            'docs_count' => collect([
                $producer->image_url,
                $producer->tax_registration_doc_url,
                $producer->efet_notification_doc_url,
                $producer->haccp_declaration_doc_url,
            ])->filter()->count(),
            'created_at' => optional($producer->created_at)->toIso8601String(),
            'status' => $producer->status,
            'is_active' => (bool) $producer->is_active,
        ];
    }
}
