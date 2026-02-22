<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Onboarding V2: document uploads, product categories, and category-specific fields.
 *
 * onboarding_completed_at: Set when producer first submits the complete onboarding form.
 * product_categories: JSON array of category slugs the producer intends to sell.
 * tax_registration_doc_url: Uploaded TAXIS printout (AFM + KAD proof).
 * efet_notification_doc_url: Uploaded EFET/NotifyBusiness notification.
 * haccp_declaration_doc_url: Optional uploaded HACCP certificate/document.
 * haccp_declaration_accepted: Checkbox — producer declares HACCP compliance.
 * beekeeper_registry_number: Required if product_categories includes honey-bee.
 * cpnp_notification_number: Required if product_categories includes cosmetics.
 * responsible_person_name: Required if product_categories includes cosmetics (EU 1223/2009).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('producers', function (Blueprint $table) {
            if (! Schema::hasColumn('producers', 'onboarding_completed_at')) {
                $table->timestamp('onboarding_completed_at')->nullable()->after('agreement_accepted_at');
            }
            if (! Schema::hasColumn('producers', 'product_categories')) {
                $table->json('product_categories')->nullable()->after('onboarding_completed_at');
            }
            if (! Schema::hasColumn('producers', 'tax_registration_doc_url')) {
                $table->string('tax_registration_doc_url', 500)->nullable()->after('product_categories');
            }
            if (! Schema::hasColumn('producers', 'efet_notification_doc_url')) {
                $table->string('efet_notification_doc_url', 500)->nullable()->after('tax_registration_doc_url');
            }
            if (! Schema::hasColumn('producers', 'haccp_declaration_doc_url')) {
                $table->string('haccp_declaration_doc_url', 500)->nullable()->after('efet_notification_doc_url');
            }
            if (! Schema::hasColumn('producers', 'haccp_declaration_accepted')) {
                $table->boolean('haccp_declaration_accepted')->default(false)->after('haccp_declaration_doc_url');
            }
            if (! Schema::hasColumn('producers', 'beekeeper_registry_number')) {
                $table->string('beekeeper_registry_number', 100)->nullable()->after('haccp_declaration_accepted');
            }
            if (! Schema::hasColumn('producers', 'cpnp_notification_number')) {
                $table->string('cpnp_notification_number', 100)->nullable()->after('beekeeper_registry_number');
            }
            if (! Schema::hasColumn('producers', 'responsible_person_name')) {
                $table->string('responsible_person_name', 255)->nullable()->after('cpnp_notification_number');
            }
        });
    }

    public function down(): void
    {
        Schema::table('producers', function (Blueprint $table) {
            $table->dropColumn([
                'onboarding_completed_at',
                'product_categories',
                'tax_registration_doc_url',
                'efet_notification_doc_url',
                'haccp_declaration_doc_url',
                'haccp_declaration_accepted',
                'beekeeper_registry_number',
                'cpnp_notification_number',
                'responsible_person_name',
            ]);
        });
    }
};
