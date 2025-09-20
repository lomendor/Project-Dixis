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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('refund_id')->nullable()->after('payment_intent_id');
            $table->integer('refunded_amount_cents')->nullable()->after('refund_id');
            $table->timestamp('refunded_at')->nullable()->after('refunded_amount_cents');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['refund_id', 'refunded_amount_cents', 'refunded_at']);
        });
    }
};
