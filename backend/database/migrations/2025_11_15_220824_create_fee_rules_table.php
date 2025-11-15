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
        Schema::create('fee_rules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('producer_id')->nullable()->index(); // override per producer
            $table->unsignedBigInteger('category_id')->nullable()->index(); // override per category (no FK to avoid coupling)
            $table->enum('channel', ['b2c','b2b'])->nullable();             // null = applies to both
            $table->decimal('rate', 5, 4);           // e.g. 0.1200 = 12%
            $table->decimal('fee_vat_rate', 5, 4)->nullable(); // override VAT on fee; null -> use default
            $table->smallInteger('priority')->default(100);     // lower = higher priority
            $table->date('effective_from')->default(DB::raw('CURRENT_DATE'));
            $table->date('effective_to')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active','effective_from','effective_to']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fee_rules');
    }
};
