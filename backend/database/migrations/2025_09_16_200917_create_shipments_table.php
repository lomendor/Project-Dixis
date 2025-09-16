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
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('carrier_code', 10)->default('ELTA');
            $table->string('tracking_code', 50)->unique();
            $table->string('label_url')->nullable();
            $table->enum('status', ['pending', 'labeled', 'in_transit', 'delivered', 'failed'])->default('pending');
            $table->decimal('billable_weight_kg', 8, 2)->nullable();
            $table->string('zone_code', 20)->nullable();
            $table->decimal('shipping_cost_eur', 8, 2)->nullable();
            $table->json('tracking_events')->nullable(); // For future tracking timeline
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['tracking_code']);
            $table->index(['status']);
            $table->index(['order_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
