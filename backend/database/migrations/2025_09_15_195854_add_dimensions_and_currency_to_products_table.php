<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Add currency (3-letter code)
            $table->string('currency', 3)->default('EUR')->after('price');

            // Add dimensions in centimeters
            $table->decimal('weight_grams', 8, 2)->nullable()->after('weight_per_unit');
            $table->decimal('length_cm', 8, 2)->nullable()->after('weight_grams');
            $table->decimal('width_cm', 8, 2)->nullable()->after('length_cm');
            $table->decimal('height_cm', 8, 2)->nullable()->after('width_cm');

            // Rename name to title for spec consistency (keeping both for compatibility)
            $table->string('title')->nullable()->after('name');
        });

        // Copy existing name values to title
        DB::statement('UPDATE products SET title = name WHERE title IS NULL');

        // Make title required
        Schema::table('products', function (Blueprint $table) {
            $table->string('title')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'currency',
                'weight_grams',
                'length_cm',
                'width_cm',
                'height_cm',
                'title'
            ]);
        });
    }
};
