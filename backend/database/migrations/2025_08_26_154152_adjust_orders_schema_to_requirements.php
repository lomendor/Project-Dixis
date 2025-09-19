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
            // Add new required fields if they don't exist
            if (! Schema::hasColumn('orders', 'payment_method')) {
                $table->string('payment_method')->nullable();
            }

            if (! Schema::hasColumn('orders', 'shipping_cost')) {
                $table->decimal('shipping_cost', 10, 2)->default(0);
            }

            if (! Schema::hasColumn('orders', 'total')) {
                $table->decimal('total', 10, 2)->default(0);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Remove the fields we added, but only if they exist
            if (Schema::hasColumn('orders', 'payment_method')) {
                $table->dropColumn('payment_method');
            }

            if (Schema::hasColumn('orders', 'shipping_cost')) {
                $table->dropColumn('shipping_cost');
            }

            if (Schema::hasColumn('orders', 'total')) {
                $table->dropColumn('total');
            }
        });
    }
};
