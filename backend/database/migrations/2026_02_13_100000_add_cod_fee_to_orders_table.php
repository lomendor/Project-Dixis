<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pass COD-FEE-FIX-01: Add cod_fee column to orders table.
 *
 * Previously the frontend displayed the COD surcharge but it was never
 * persisted in the order — subtotal + shipping was stored as total,
 * omitting the 4 € COD fee. This migration adds a dedicated column
 * so the total in DB equals subtotal + shipping + cod_fee.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('cod_fee', 10, 2)->default(0)->after('shipping_cost');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('cod_fee');
        });
    }
};
