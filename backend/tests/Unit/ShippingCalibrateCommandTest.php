<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Console\Commands\ShippingCalibrate;

class ShippingCalibrateCommandTest extends TestCase
{
    public function test_csv_parser_skips_header_and_computes_stats()
    {
        // Create temp CSV
        $csv = tempnam(sys_get_temp_dir(), 'test_');
        file_put_contents($csv, "order_id,weight_kg,length_cm,width_cm,height_cm,postal_code,actual_receipt_eur\n");
        file_put_contents($csv, "TEST-1,1.0,20,15,10,10671,5.50\n", FILE_APPEND);
        file_put_contents($csv, "TEST-2,2.5,30,25,20,49100,8.00\n", FILE_APPEND);

        $command = new ShippingCalibrate();
        $reflection = new \ReflectionClass($command);

        $parseMethod = $reflection->getMethod('parseCsv');
        $parseMethod->setAccessible(true);
        $rows = $parseMethod->invoke($command, $csv);

        $this->assertCount(2, $rows);
        $this->assertEquals('TEST-1', $rows[0]['order_id']);
        $this->assertEquals(1.0, $rows[0]['weight_kg']);
        $this->assertEquals('10671', $rows[0]['postal_code']);

        $statsMethod = $reflection->getMethod('calculateStats');
        $statsMethod->setAccessible(true);
        $results = [
            ['zone_code' => 'mainland', 'error_eur' => 0.5, 'error_pct' => 9.0],
            ['zone_code' => 'island', 'error_eur' => -1.0, 'error_pct' => 12.5],
        ];
        $stats = $statsMethod->invoke($command, $results);

        $this->assertEquals(0.75, $stats['overall']['mae']);
        $this->assertEquals(10.75, $stats['overall']['mape']);
        $this->assertEquals(2, $stats['overall']['count']);

        unlink($csv);
    }
}