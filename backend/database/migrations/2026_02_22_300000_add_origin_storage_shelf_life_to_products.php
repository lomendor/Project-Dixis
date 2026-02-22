<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('origin', 255)->nullable()->after('ingredients');
            $table->string('storage_instructions', 500)->nullable()->after('origin');
            $table->string('shelf_life', 255)->nullable()->after('storage_instructions');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['origin', 'storage_instructions', 'shelf_life']);
        });
    }
};
