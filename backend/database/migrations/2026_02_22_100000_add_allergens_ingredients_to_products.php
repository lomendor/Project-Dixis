<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * EU 1169/2011 Compliance: Add allergen declaration and ingredients fields.
 *
 * allergens: JSON array of EU-regulated allergen codes (14 mandatory allergens).
 * ingredients: Free-text ingredient list in descending order by weight.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (! Schema::hasColumn('products', 'allergens')) {
                $table->json('allergens')->nullable()->after('cultivation_description');
            }
            if (! Schema::hasColumn('products', 'ingredients')) {
                $table->text('ingredients')->nullable()->after('allergens');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['allergens', 'ingredients']);
        });
    }
};
