<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pass PAYOUT-02: Add settlement linking + extra fields.
 *
 * 1. commissions.settlement_id — FK to link commission records to settlements
 * 2. commission_settlements.net_payout_cents — explicit payout amount
 * 3. commission_settlements.order_count — number of orders in settlement
 * 4. commission_settlements.paid_at — timestamp when marked as paid
 * 5. commission_settlements.notes — admin notes (e.g., bank transfer ref)
 */
return new class extends Migration
{
    public function up(): void
    {
        // Add settlement_id to commissions (links each commission to a settlement batch)
        Schema::table('commissions', function (Blueprint $table) {
            if (! Schema::hasColumn('commissions', 'settlement_id')) {
                $table->unsignedBigInteger('settlement_id')->nullable()->after('currency');
                $table->index('settlement_id');
            }
        });

        // Add extra fields to commission_settlements
        Schema::table('commission_settlements', function (Blueprint $table) {
            if (! Schema::hasColumn('commission_settlements', 'net_payout_cents')) {
                $table->bigInteger('net_payout_cents')->default(0)->after('commission_cents');
            }
            if (! Schema::hasColumn('commission_settlements', 'order_count')) {
                $table->unsignedInteger('order_count')->default(0)->after('net_payout_cents');
            }
            if (! Schema::hasColumn('commission_settlements', 'paid_at')) {
                $table->timestamp('paid_at')->nullable()->after('status');
            }
            if (! Schema::hasColumn('commission_settlements', 'notes')) {
                $table->text('notes')->nullable()->after('paid_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('commissions', function (Blueprint $table) {
            $table->dropColumn('settlement_id');
        });

        Schema::table('commission_settlements', function (Blueprint $table) {
            $table->dropColumn(['net_payout_cents', 'order_count', 'paid_at', 'notes']);
        });
    }
};
