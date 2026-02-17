<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * T1-05: Order status history for tracking timestamps.
 * Stores every status transition with timestamp and admin/note metadata.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_status_history', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id');
            $table->string('old_status', 20)->nullable(); // null for initial status
            $table->string('new_status', 20);
            $table->unsignedBigInteger('changed_by')->nullable(); // admin user id
            $table->string('note', 500)->nullable();
            $table->timestamp('changed_at')->useCurrent();

            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
            $table->foreign('changed_by')->references('id')->on('users')->onDelete('set null');
            $table->index(['order_id', 'changed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_status_history');
    }
};
