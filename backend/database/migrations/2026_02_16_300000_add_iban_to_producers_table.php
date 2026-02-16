<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pass PAYOUT-01: Add IBAN + bank account holder to producers for payout settlements.
 * Greek IBAN: GR + 25 digits = 27 chars total. Max 34 chars covers all EU IBANs.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('producers', function (Blueprint $table) {
            if (! Schema::hasColumn('producers', 'iban')) {
                $table->string('iban', 34)->nullable()->after('tax_office');
            }
            if (! Schema::hasColumn('producers', 'bank_account_holder')) {
                $table->string('bank_account_holder', 255)->nullable()->after('iban');
            }
        });
    }

    public function down(): void
    {
        Schema::table('producers', function (Blueprint $table) {
            $table->dropColumn(['iban', 'bank_account_holder']);
        });
    }
};
