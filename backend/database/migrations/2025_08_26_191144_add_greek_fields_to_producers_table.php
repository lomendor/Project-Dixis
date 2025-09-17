<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('producers', function (Blueprint $table) {
            // Greek tax compliance fields
            if (! Schema::hasColumn('producers', 'tax_id')) {
                $table->string('tax_id')->nullable()->comment('Greek AFM (Tax ID)');
            }
            if (! Schema::hasColumn('producers', 'tax_office')) {
                $table->string('tax_office')->nullable()->comment('Greek DOY (Tax Office)');
            }

            // Location details
            if (! Schema::hasColumn('producers', 'address')) {
                $table->string('address')->nullable();
            }
            if (! Schema::hasColumn('producers', 'city')) {
                $table->string('city')->nullable();
            }
            if (! Schema::hasColumn('producers', 'postal_code')) {
                $table->string('postal_code')->nullable();
            }
            if (! Schema::hasColumn('producers', 'region')) {
                $table->string('region')->nullable()->comment('Prefecture/Region');
            }

            // GPS coordinates
            if (! Schema::hasColumn('producers', 'latitude')) {
                $table->decimal('latitude', 10, 7)->nullable();
            }
            if (! Schema::hasColumn('producers', 'longitude')) {
                $table->decimal('longitude', 10, 7)->nullable();
            }

            // Social media and verification
            if (! Schema::hasColumn('producers', 'social_media')) {
                $table->json('social_media')->nullable();
            }
            if (! Schema::hasColumn('producers', 'verified')) {
                $table->boolean('verified')->default(false);
            }
            if (! Schema::hasColumn('producers', 'uses_custom_shipping_rates')) {
                $table->boolean('uses_custom_shipping_rates')->default(false);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('producers', function (Blueprint $table) {
            // Drop fields in reverse order
            if (Schema::hasColumn('producers', 'uses_custom_shipping_rates')) {
                $table->dropColumn('uses_custom_shipping_rates');
            }
            if (Schema::hasColumn('producers', 'verified')) {
                $table->dropColumn('verified');
            }
            if (Schema::hasColumn('producers', 'social_media')) {
                $table->dropColumn('social_media');
            }
            if (Schema::hasColumn('producers', 'longitude')) {
                $table->dropColumn('longitude');
            }
            if (Schema::hasColumn('producers', 'latitude')) {
                $table->dropColumn('latitude');
            }
            if (Schema::hasColumn('producers', 'region')) {
                $table->dropColumn('region');
            }
            if (Schema::hasColumn('producers', 'postal_code')) {
                $table->dropColumn('postal_code');
            }
            if (Schema::hasColumn('producers', 'city')) {
                $table->dropColumn('city');
            }
            if (Schema::hasColumn('producers', 'address')) {
                $table->dropColumn('address');
            }
            if (Schema::hasColumn('producers', 'tax_office')) {
                $table->dropColumn('tax_office');
            }
            if (Schema::hasColumn('producers', 'tax_id')) {
                $table->dropColumn('tax_id');
            }
        });
    }
};
