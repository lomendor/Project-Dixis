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
        // Database-agnostic enum modification
        $driver = DB::connection()->getDriverName();

        if ($driver === 'pgsql') {
            // PostgreSQL: use temporary column approach to preserve data
            Schema::table('orders', function (Blueprint $table) {
                $table->enum('status_new', ['pending', 'paid', 'shipped', 'completed', 'cancelled'])->default('pending')->after('status');
            });

            // Copy data, converting 'processing' to 'paid'
            DB::statement("UPDATE orders SET status_new = CASE WHEN status = 'processing' THEN 'paid' ELSE status END");

            // Drop old column and rename new one
            Schema::table('orders', function (Blueprint $table) {
                $table->dropColumn('status');
            });
            Schema::table('orders', function (Blueprint $table) {
                $table->renameColumn('status_new', 'status');
            });
        } else {
            // For SQLite, we just update the data - SQLite doesn't enforce ENUM constraints
            // Update existing 'processing' status to 'paid' in existing records
            DB::statement("UPDATE orders SET status = 'paid' WHERE status = 'processing'");

            // For MySQL: use MODIFY COLUMN
            if ($driver === 'mysql') {
                DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending','paid','shipped','completed','cancelled') DEFAULT 'pending'");
            }
            // SQLite: no action needed as it doesn't enforce ENUM constraints
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Database-agnostic enum reversion
        $driver = DB::connection()->getDriverName();

        if ($driver === 'pgsql') {
            // PostgreSQL: use temporary column approach to preserve data
            Schema::table('orders', function (Blueprint $table) {
                $table->enum('status_old', ['pending', 'processing', 'shipped', 'completed', 'cancelled'])->default('pending')->after('status');
            });

            // Copy data, converting 'paid' to 'processing'
            DB::statement("UPDATE orders SET status_old = CASE WHEN status = 'paid' THEN 'processing' ELSE status END");

            // Drop old column and rename new one
            Schema::table('orders', function (Blueprint $table) {
                $table->dropColumn('status');
            });
            Schema::table('orders', function (Blueprint $table) {
                $table->renameColumn('status_old', 'status');
            });
        } else {
            // For SQLite, we just update the data - SQLite doesn't enforce ENUM constraints
            // Revert 'paid' status to 'processing' in existing records
            DB::statement("UPDATE orders SET status = 'processing' WHERE status = 'paid'");

            // For MySQL: use MODIFY COLUMN
            if ($driver === 'mysql') {
                DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending','processing','shipped','completed','cancelled') DEFAULT 'pending'");
            }
            // SQLite: no action needed as it doesn't enforce ENUM constraints
        }
    }
};
