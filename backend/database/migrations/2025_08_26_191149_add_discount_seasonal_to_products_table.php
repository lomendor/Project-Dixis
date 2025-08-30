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
            // Discount pricing
            if (!Schema::hasColumn('products', 'discount_price')) {
                $table->decimal('discount_price', 8, 2)->nullable()->comment('Sale/discount price');
            }
            
            // Seasonal availability
            if (!Schema::hasColumn('products', 'is_seasonal')) {
                $table->boolean('is_seasonal')->default(false);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'is_seasonal')) {
                $table->dropColumn('is_seasonal');
            }
            if (Schema::hasColumn('products', 'discount_price')) {
                $table->dropColumn('discount_price');
            }
        });
    }
};
