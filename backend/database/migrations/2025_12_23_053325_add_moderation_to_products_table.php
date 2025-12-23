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
        Schema::table('products', function (Blueprint $table) {
            // Add approval_status for admin moderation workflow
            // Default 'approved' for backwards compatibility (existing products assumed approved)
            // New products will be set to 'pending' programmatically in ProductController
            $table->enum('approval_status', ['pending', 'approved', 'rejected'])
                ->default('approved')
                ->after('is_active');

            // Rejection reason (nullable - only required when status=rejected)
            $table->text('rejection_reason')->nullable()->after('approval_status');

            // Moderated by (admin user_id who approved/rejected)
            $table->unsignedBigInteger('moderated_by')->nullable()->after('rejection_reason');
            $table->timestamp('moderated_at')->nullable()->after('moderated_by');

            // Index for admin moderation queue queries
            $table->index('approval_status');
            $table->index(['approval_status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['approval_status', 'created_at']);
            $table->dropIndex(['approval_status']);
            $table->dropColumn(['approval_status', 'rejection_reason', 'moderated_by', 'moderated_at']);
        });
    }
};
