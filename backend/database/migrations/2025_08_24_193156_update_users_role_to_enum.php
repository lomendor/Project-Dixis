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
        Schema::table('users', function (Blueprint $table) {
            // Guard: check if role column exists
            if (Schema::hasColumn('users', 'role')) {
                // Drop existing string role column
                $table->dropColumn('role');
            }
        });

        // Add enum role column
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'producer', 'consumer'])->default('consumer')->after('email_verified_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'role')) {
                $table->dropColumn('role');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('consumer')->after('email_verified_at');
        });
    }
};
