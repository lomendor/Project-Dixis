<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * B2B PIVOT: Add wholesale visibility flag to products.
     *
     * When is_b2b_only = true, product is hidden from regular consumers
     * and only visible to approved business buyers (and admins/producers).
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('is_b2b_only')->default(false)
                ->after('is_active')
                ->comment('If true, only visible to approved business buyers');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('is_b2b_only');
        });
    }
};
