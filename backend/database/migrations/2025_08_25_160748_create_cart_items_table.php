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
        if (!Schema::hasTable('cart_items')) {
            Schema::create('cart_items', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id'); // NO FK inline - will add later
                $table->unsignedBigInteger('product_id'); // NO FK inline - will add later
                $table->integer('quantity');
                $table->timestamps();
                
                // Indexes
                $table->index('user_id');
                $table->index('product_id');
                $table->unique(['user_id', 'product_id']); // One cart item per product per user
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};
