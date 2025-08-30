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
        Schema::table('products', function (Blueprint $table) {
            // Database-agnostic FK constraint guard
            if (DB::getDriverName() === 'pgsql') {
                // Postgres: use IF EXISTS
                DB::statement('ALTER TABLE products DROP CONSTRAINT IF EXISTS products_producer_id_foreign');
            } else {
                // SQLite/MySQL: use try-catch
                try {
                    $table->dropForeign(['producer_id']);
                } catch (\Exception $e) {
                    // Constraint doesn't exist, continue
                }
            }
            
            // Add FK constraint
            $table->foreign('producer_id')->references('id')->on('producers')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['producer_id']);
        });
    }
};
