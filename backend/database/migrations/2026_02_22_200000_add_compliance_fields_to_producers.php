<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Producer compliance: food license number (EFET/HACCP) and agreement acceptance.
 *
 * food_license_number: EFET registration or HACCP certificate reference.
 * agreement_accepted_at: Timestamp when producer accepted the Producer Agreement in-platform.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('producers', function (Blueprint $table) {
            if (! Schema::hasColumn('producers', 'food_license_number')) {
                $table->string('food_license_number')->nullable()->after('tax_office');
            }
            if (! Schema::hasColumn('producers', 'agreement_accepted_at')) {
                $table->timestamp('agreement_accepted_at')->nullable()->after('food_license_number');
            }
        });
    }

    public function down(): void
    {
        Schema::table('producers', function (Blueprint $table) {
            $table->dropColumn(['food_license_number', 'agreement_accepted_at']);
        });
    }
};
