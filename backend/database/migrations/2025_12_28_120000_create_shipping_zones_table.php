<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Pass 50: Shipping zones for Greek market pricing
     */
    public function up(): void
    {
        Schema::create('shipping_zones', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. "Athens Metro", "Thessaloniki", "Rest of Greece"
            $table->json('postal_prefixes'); // e.g. ["10", "11", "12", "13", "14", "15", "16", "17", "18", "19"]
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipping_zones');
    }
};
