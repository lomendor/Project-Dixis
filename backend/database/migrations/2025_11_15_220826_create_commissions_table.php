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
        Schema::create('commissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id')->index();
            $table->unsignedBigInteger('producer_id')->nullable()->index();
            $table->enum('channel', ['b2c','b2b'])->default('b2c');
            $table->decimal('order_gross', 10, 2)->default(0.00);
            $table->decimal('platform_fee', 10, 2)->default(0.00);
            $table->decimal('platform_fee_vat', 10, 2)->default(0.00);
            $table->decimal('producer_payout', 10, 2)->default(0.00);
            $table->string('currency', 3)->default('EUR');
            $table->timestamps();

            $table->unique(['order_id', 'producer_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commissions');
    }
};
