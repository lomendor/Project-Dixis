<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * B2B PIVOT: Create businesses table.
     *
     * Stores B2B buyer profiles (restaurants, hotels, delis).
     * Mirrors the Producer model pattern: User hasOne Business.
     * Admin must approve before business can browse wholesale products.
     */
    public function up(): void
    {
        Schema::create('businesses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Company details
            $table->string('company_name');
            $table->string('tax_id', 9)->nullable()->comment('ΑΦΜ — 9 digits');
            $table->string('tax_office')->nullable()->comment('ΔΟΥ');
            $table->string('business_type')->default('restaurant')
                ->comment('restaurant, hotel, deli, catering, other');

            // Contact
            $table->string('contact_person')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();

            // Delivery address
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('postal_code', 5)->nullable();
            $table->string('region')->nullable();

            // Approval workflow (same pattern as Producer)
            $table->enum('status', ['pending', 'active', 'inactive', 'rejected'])
                ->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->timestamp('approved_at')->nullable();

            // Admin notes
            $table->text('notes')->nullable();

            $table->timestamps();

            // One business profile per user
            $table->unique('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('businesses');
    }
};
