<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Pass 50: Shipping rates per zone/method/weight
     */
    public function up(): void
    {
        Schema::create('shipping_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('zone_id')->constrained('shipping_zones')->onDelete('cascade');
            $table->string('method'); // HOME, COURIER (PICKUP is always free)
            $table->decimal('weight_min_kg', 5, 2)->default(0);
            $table->decimal('weight_max_kg', 5, 2)->default(999.99);
            $table->decimal('price_eur', 8, 2);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['zone_id', 'method', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipping_rates');
    }
};
