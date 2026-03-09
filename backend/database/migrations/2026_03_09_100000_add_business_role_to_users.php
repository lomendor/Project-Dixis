<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * B2B PIVOT: Add 'business' to user role enum.
     *
     * Business users = restaurants, hotels, delis that buy wholesale.
     *
     * Laravel enum() uses CHECK constraints in PostgreSQL (not native ENUM types).
     * We modify the constraint in-place to preserve existing data.
     */
    public function up(): void
    {
        // Drop the existing CHECK constraint and add new one with 'business'
        // Laravel names check constraints as: {table}_{column}_check
        DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
        DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role::text = ANY (ARRAY['admin'::text, 'producer'::text, 'consumer'::text, 'business'::text]))");
    }

    /**
     * Reverse: remove 'business' from role enum.
     */
    public function down(): void
    {
        // Convert any business users back to consumer first
        DB::table('users')->where('role', 'business')->update(['role' => 'consumer']);

        DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
        DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role::text = ANY (ARRAY['admin'::text, 'producer'::text, 'consumer'::text]))");
    }
};
