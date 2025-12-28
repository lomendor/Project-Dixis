<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pass 53: Idempotency table for order email notifications.
 * Prevents double-sends on retries or duplicate webhook events.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('recipient_type'); // 'consumer' or 'producer'
            $table->unsignedBigInteger('recipient_id')->nullable(); // producer_id for producer emails
            $table->string('recipient_email');
            $table->string('event'); // 'order_placed', 'order_shipped', etc.
            $table->timestamp('sent_at');
            $table->timestamps();

            // Unique constraint to prevent double-sends
            $table->unique(
                ['order_id', 'recipient_type', 'recipient_id', 'event'],
                'order_notifications_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_notifications');
    }
};
