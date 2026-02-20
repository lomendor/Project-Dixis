<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Pass CHECKOUT-TOKEN-FIX-01: Add public_token to checkout_sessions
 *
 * CheckoutSession needs a UUID public_token for safe public access,
 * same as orders table. Without this, the thank-you page breaks for
 * multi-producer orders because it redirects with an integer ID
 * but the showByToken endpoint expects a UUID.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('checkout_sessions', function (Blueprint $table) {
            $table->uuid('public_token')->nullable()->unique()->after('id');
        });

        // Backfill existing rows with UUIDs
        $sessions = \App\Models\CheckoutSession::whereNull('public_token')->get();
        foreach ($sessions as $session) {
            $session->update(['public_token' => (string) Str::uuid()]);
        }
    }

    public function down(): void
    {
        Schema::table('checkout_sessions', function (Blueprint $table) {
            $table->dropColumn('public_token');
        });
    }
};
