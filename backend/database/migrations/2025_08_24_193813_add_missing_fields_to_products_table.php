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
        Schema::table('products', function (Blueprint $table) {
            // Guard: check if columns don't exist
            if (! Schema::hasColumn('products', 'weight_per_unit')) {
                $table->decimal('weight_per_unit', 10, 3)->nullable()->after('price');
            }
            if (! Schema::hasColumn('products', 'is_organic')) {
                $table->boolean('is_organic')->default(false)->after('category');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'weight_per_unit')) {
                $table->dropColumn('weight_per_unit');
            }
            if (Schema::hasColumn('products', 'is_organic')) {
                $table->dropColumn('is_organic');
            }
        });
    }
};
