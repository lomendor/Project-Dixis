<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * S1-01: Add cultivation type to products.
     * Tracks how the product was produced (organic, conventional, etc.)
     * This is a core Dixis differentiator per the PRD.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (! Schema::hasColumn('products', 'cultivation_type')) {
                $table->string('cultivation_type', 50)->nullable()->default(null)->after('is_seasonal');
            }
            if (! Schema::hasColumn('products', 'cultivation_description')) {
                $table->text('cultivation_description')->nullable()->after('cultivation_type');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'cultivation_type')) {
                $table->dropColumn('cultivation_type');
            }
            if (Schema::hasColumn('products', 'cultivation_description')) {
                $table->dropColumn('cultivation_description');
            }
        });
    }
};
