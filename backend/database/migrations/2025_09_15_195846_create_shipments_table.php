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
            $table->string('courier_code')->nullable();
            $table->string('tracking_number')->nullable();
            $table->integer('cost_cents')->nullable();
            $table->enum('status', ['pending', 'picked_up', 'in_transit', 'delivered', 'failed'])->nullable();
            $table->timestamps();

            // Indexes
            $table->index('order_id');
            $table->index('tracking_number');
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
