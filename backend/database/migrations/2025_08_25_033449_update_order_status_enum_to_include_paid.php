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
        // Update existing 'processing' status to 'paid' in existing records
        DB::statement("UPDATE orders SET status = 'paid' WHERE status = 'processing'");
        
        // Update the enum definition
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending','paid','shipped','completed','cancelled') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert 'paid' status to 'processing' in existing records  
        DB::statement("UPDATE orders SET status = 'processing' WHERE status = 'paid'");
        
        // Revert the enum definition
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending','processing','shipped','completed','cancelled') DEFAULT 'pending'");
    }
};
