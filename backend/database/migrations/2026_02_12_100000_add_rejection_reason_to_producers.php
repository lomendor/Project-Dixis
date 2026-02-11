<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * PRODUCER-ONBOARD-01: Add rejection_reason for admin review workflow
     */
    public function up(): void
    {
        Schema::table('producers', function (Blueprint $table) {
            $table->text('rejection_reason')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('producers', function (Blueprint $table) {
            $table->dropColumn('rejection_reason');
        });
    }
};
