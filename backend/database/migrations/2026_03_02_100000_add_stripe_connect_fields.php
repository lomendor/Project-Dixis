<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pass STRIPE-CONNECT-01: Add Stripe Connect fields to producers and orders.
 *
 * Producers: Stripe Connected Account ID and status fields.
 * Orders: Transfer ID for tracking funds sent to connected accounts.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('producers', function (Blueprint $table) {
            $table->string('stripe_connect_id', 50)->nullable()->after('bank_account_holder');
            $table->string('stripe_connect_status', 20)->nullable()->default('pending')->after('stripe_connect_id');
            $table->boolean('stripe_payouts_enabled')->default(false)->after('stripe_connect_status');
            $table->boolean('stripe_charges_enabled')->default(false)->after('stripe_payouts_enabled');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->string('stripe_transfer_id', 50)->nullable()->after('refunded_at');
            $table->string('stripe_transfer_status', 20)->nullable()->after('stripe_transfer_id');
        });
    }

    public function down(): void
    {
        Schema::table('producers', function (Blueprint $table) {
            $table->dropColumn([
                'stripe_connect_id',
                'stripe_connect_status',
                'stripe_payouts_enabled',
                'stripe_charges_enabled',
            ]);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'stripe_transfer_id',
                'stripe_transfer_status',
            ]);
        });
    }
};
