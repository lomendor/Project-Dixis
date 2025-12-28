<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pass 55: Idempotency tracking for producer weekly digests.
 * Prevents double-sends for the same period.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('producer_digests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producer_id')->constrained()->onDelete('cascade');
            $table->date('period_start'); // First day of digest period
            $table->date('period_end');   // Last day of digest period
            $table->string('recipient_email');
            $table->integer('orders_count')->default(0);
            $table->decimal('gross_revenue', 10, 2)->default(0);
            $table->timestamp('sent_at');
            $table->timestamps();

            // Unique constraint: one digest per producer per period
            $table->unique(['producer_id', 'period_start'], 'producer_digests_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('producer_digests');
    }
};
