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
        if (! Schema::hasTable('producers')) {
            Schema::create('producers', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('business_name')->nullable();
                $table->text('description')->nullable();
                $table->string('location')->nullable();
                $table->string('phone')->nullable();
                $table->string('email')->nullable();
                $table->string('website')->nullable();
                $table->enum('status', ['active', 'inactive', 'pending'])->default('active');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('producers');
    }
};
