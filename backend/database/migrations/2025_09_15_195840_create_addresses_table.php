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
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['shipping', 'billing']);
            $table->string('name');
            $table->string('line1');
            $table->string('line2')->nullable();
            $table->string('city');
            $table->string('postal_code');
            $table->string('country', 2)->default('GR');
            $table->string('phone')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['user_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('addresses');
    }
};
