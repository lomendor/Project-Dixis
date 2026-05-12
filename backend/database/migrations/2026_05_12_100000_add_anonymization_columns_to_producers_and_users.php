<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * ADMIN-PRODUCER-DELETE-01: Add anonymization columns to producers + users.
 *
 * Public producer queries (storefront + admin list) must filter
 * WHERE anonymized_at IS NULL to hide soft-deleted producers from the UI
 * while keeping the row for DAC7/DSA traceability on historical orders.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('producers', function (Blueprint $table) {
            $table->timestamp('anonymized_at')->nullable()->index();
            $table->string('deletion_reason', 500)->nullable();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('anonymized_at')->nullable()->index();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['anonymized_at']);
            $table->dropColumn('anonymized_at');
        });

        Schema::table('producers', function (Blueprint $table) {
            $table->dropIndex(['anonymized_at']);
            $table->dropColumn(['anonymized_at', 'deletion_reason']);
        });
    }
};
