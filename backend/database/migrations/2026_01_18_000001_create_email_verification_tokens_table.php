<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pass EMAIL-VERIFY-01: Email verification tokens table.
 *
 * Stores hashed tokens for email verification with expiry.
 * Compatible with both PostgreSQL and SQLite.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_verification_tokens', function (Blueprint $table) {
            $table->id();
            $table->string('email')->index();
            $table->string('token'); // hashed
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_verification_tokens');
    }
};
