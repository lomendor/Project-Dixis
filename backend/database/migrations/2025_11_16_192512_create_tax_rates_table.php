<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('tax_rates', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('VAT');
            $table->decimal('rate_percent', 5, 2);   // π.χ. 24.00
            $table->boolean('is_default')->default(false);
            $table->date('valid_from')->nullable();
            $table->date('valid_to')->nullable();
            $table->timestamps();

            $table->index(['is_default', 'valid_from']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('tax_rates');
    }
};
