<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('commission_rules', function (Blueprint $table) {
            $table->id();
            $table->enum('scope_channel', ['B2B','B2C','ALL'])->default('ALL');
            $table->unsignedBigInteger('scope_category_id')->nullable(); // FK optional
            $table->unsignedBigInteger('scope_producer_id')->nullable(); // FK optional
            $table->decimal('percent',5,2)->default(0);         // π.χ. 12.00
            $table->integer('fixed_fee_cents')->nullable();     // προμήθεια σε cents, αν υπάρχει
            $table->integer('tier_min_amount_cents')->default(0);
            $table->integer('tier_max_amount_cents')->nullable();
            $table->enum('vat_mode',['INCLUDE','EXCLUDE','NONE'])->default('EXCLUDE');
            $table->enum('rounding_mode',['UP','DOWN','NEAREST'])->default('NEAREST');
            $table->dateTime('effective_from')->default(now());
            $table->dateTime('effective_to')->nullable();
            $table->integer('priority')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->index(['active','scope_channel','priority']);
            $table->index(['scope_producer_id','active']);
            $table->index(['scope_category_id','active']);
            $table->index(['tier_min_amount_cents','tier_max_amount_cents']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('commission_rules');
    }
};
