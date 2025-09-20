<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Database-agnostic FK constraint handling
        $driver = DB::connection()->getDriverName();

        // Add FK to order_items table for producer_id
        Schema::table('order_items', function (Blueprint $table) use ($driver) {
            // Drop constraint if exists (database-agnostic)
            if ($driver === 'pgsql') {
                DB::statement('ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_producer_id_foreign');
            } else {
                // For SQLite and others, use try-catch
                try {
                    DB::statement('ALTER TABLE order_items DROP FOREIGN KEY order_items_producer_id_foreign');
                } catch (\Exception $e) {
                    // Constraint doesn't exist, continue
                }
            }

            // Add FK constraint if column exists
            if (Schema::hasColumn('order_items', 'producer_id')) {
                $table->foreign('producer_id')->references('id')->on('producers')->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Database-agnostic FK constraint handling
        $driver = DB::connection()->getDriverName();

        // Drop FK constraint from order_items table
        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_producer_id_foreign');
        } else {
            // For SQLite and others, use try-catch
            try {
                DB::statement('ALTER TABLE order_items DROP FOREIGN KEY order_items_producer_id_foreign');
            } catch (\Exception $e) {
                // Constraint doesn't exist, continue
            }
        }
    }
};
