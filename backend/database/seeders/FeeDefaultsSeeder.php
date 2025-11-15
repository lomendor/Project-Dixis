<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\DixisSetting;

class FeeDefaultsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $defaults = [
            'fee.b2c.rate' => (float)config('dixis.fees.b2c', 0.12),
            'fee.b2b.rate' => (float)config('dixis.fees.b2b', 0.07),
            'fee.vat.rate' => (float)config('dixis.fees.fee_vat_rate', 0.24),
        ];

        foreach ($defaults as $key => $value) {
            $setting = DixisSetting::firstOrCreate(['key' => $key], ['value' => ['v' => $value]]);

            // Update if value changed
            if (!isset($setting->value['v']) || $setting->value['v'] !== $value) {
                $setting->value = ['v' => $value];
                $setting->save();
            }
        }

        $this->command->info('✅ Fee defaults seeded: B2C='.$defaults['fee.b2c.rate'].' B2B='.$defaults['fee.b2b.rate'].' VAT='.$defaults['fee.vat.rate']);
    }
}
