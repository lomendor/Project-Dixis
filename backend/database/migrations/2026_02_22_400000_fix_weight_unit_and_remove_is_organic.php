<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Fix two data issues found in production:
 *
 * 1. weight_per_unit was seeded in kg (0.1, 0.5, etc.) but the form and
 *    display expect grams. Convert all existing non-null values × 1000.
 *
 * 2. is_organic was a separate boolean that conflicted with cultivation_type.
 *    Organic status is now derived solely from cultivation_type
 *    (organic_certified, organic_transitional). Drop the redundant column.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Step 1: Convert weight_per_unit from kg → grams
        // Only convert values that look like kg (< 10), skip already-gram values
        DB::statement('UPDATE products SET weight_per_unit = weight_per_unit * 1000 WHERE weight_per_unit IS NOT NULL AND weight_per_unit < 10');

        // Step 2: Drop is_organic column (organic info lives in cultivation_type)
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('is_organic');
        });
    }

    public function down(): void
    {
        // Re-add is_organic column
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('is_organic')->default(false)->after('is_seasonal');
        });

        // Convert grams back to kg
        DB::statement('UPDATE products SET weight_per_unit = weight_per_unit / 1000 WHERE weight_per_unit IS NOT NULL AND weight_per_unit >= 10');
    }
};
