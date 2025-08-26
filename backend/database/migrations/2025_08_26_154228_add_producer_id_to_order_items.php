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
        Schema::table('order_items', function (Blueprint $table) {
            // Add producer_id field if it doesn't exist
            if (!Schema::hasColumn('order_items', 'producer_id')) {
                $table->unsignedBigInteger('producer_id')->nullable()->after('product_id');
                $table->index('producer_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            // Remove producer_id if it exists
            if (Schema::hasColumn('order_items', 'producer_id')) {
                $table->dropIndex(['producer_id']);
                $table->dropColumn('producer_id');
            }
        });
    }
};
