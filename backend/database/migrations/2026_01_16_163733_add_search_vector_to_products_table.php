<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Pass SEARCH-FTS-01: Add full-text search vector to products table.
     * PostgreSQL-only: tsvector generated column + GIN index for ranked search.
     */
    public function up(): void
    {
        // Only apply FTS on PostgreSQL
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        // Add tsvector column as stored generated column
        // Combines name and description for full-text search
        DB::statement("
            ALTER TABLE products
            ADD COLUMN IF NOT EXISTS search_vector tsvector
            GENERATED ALWAYS AS (
                to_tsvector('simple', COALESCE(name, '') || ' ' || COALESCE(description, ''))
            ) STORED
        ");

        // Add GIN index for fast full-text search queries
        DB::statement("
            CREATE INDEX IF NOT EXISTS products_search_vector_idx
            ON products USING GIN (search_vector)
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Only revert on PostgreSQL
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement("DROP INDEX IF EXISTS products_search_vector_idx");
        DB::statement("ALTER TABLE products DROP COLUMN IF EXISTS search_vector");
    }
};
