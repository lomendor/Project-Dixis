<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('commission_rules', function (Blueprint $t) {
            $t->id();
            $t->string('scope_channel', 10)->default('ALL'); // 'B2B'|'B2C'|'ALL'
            $t->unsignedBigInteger('scope_category_id')->nullable(); // no FK yet
            $t->unsignedBigInteger('scope_producer_id')->nullable(); // no FK yet
            $t->decimal('percent', 5, 2)->default(0);
            $t->integer('fixed_fee_cents')->nullable();
            $t->integer('tier_min_amount_cents')->default(0);
            $t->integer('tier_max_amount_cents')->nullable();
            $t->string('vat_mode', 12)->default('EXCLUDE'); // INCLUDE|EXCLUDE|NONE
            $t->string('rounding_mode', 12)->default('NEAREST'); // UP|DOWN|NEAREST
            $t->dateTime('effective_from');
            $t->dateTime('effective_to')->nullable();
            $t->integer('priority')->default(0);
            $t->boolean('active')->default(true);
            $t->timestamps();

            $t->index(['active','effective_from']);
            $t->index(['scope_channel','active']);
            $t->index(['scope_producer_id','active']);
            $t->index(['scope_category_id','active']);
            $t->index(['tier_min_amount_cents','tier_max_amount_cents']);
        });

        Schema::create('commission_rule_audits', function (Blueprint $t) {
            $t->id();
            $t->unsignedBigInteger('rule_id');
            $t->unsignedBigInteger('changed_by')->nullable();
            $t->json('changes');
            $t->string('action', 20);
            $t->timestamps();
            $t->index('rule_id');
            $t->index('created_at');
        });

        Schema::create('commission_settlements', function (Blueprint $t) {
            $t->id();
            $t->unsignedBigInteger('producer_id');
            $t->date('period_start');
            $t->date('period_end');
            $t->bigInteger('total_sales_cents');
            $t->bigInteger('commission_cents');
            $t->string('status', 12)->default('PENDING'); // PENDING|PAID|CANCELLED
            $t->timestamps();
            $t->unique(['producer_id','period_start','period_end']);
            $t->index(['status','period_start']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('commission_settlements');
        Schema::dropIfExists('commission_rule_audits');
        Schema::dropIfExists('commission_rules');
    }
};
