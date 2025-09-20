<?php

namespace App\Console\Commands;

use App\Services\ShippingService;
use Illuminate\Console\Command;

class ShippingCalibrate extends Command
{
    protected $signature = 'shipping:calibrate {csvPath} {--out=}';
    protected $description = 'Calibrate shipping rates from CSV samples';

    public function handle(ShippingService $shippingService)
    {
        $csvPath = $this->argument('csvPath');
        if (!file_exists($csvPath)) {
            $this->error("CSV file not found: $csvPath");
            return 1;
        }

        $rows = $this->parseCsv($csvPath);
        $results = [];

        foreach ($rows as $row) {
            // Calculate volumetric and billable weight
            $volumetricWeight = $shippingService->computeVolumetricWeight(
                $row['length_cm'],
                $row['width_cm'],
                $row['height_cm']
            );
            $billableWeight = $shippingService->computeBillableWeight(
                $row['weight_kg'],
                $volumetricWeight
            );

            // Get zone from postal code
            $zone = $shippingService->getZoneByPostalCode($row['postal_code']);

            // Calculate shipping cost
            $quote = $shippingService->calculateShippingCost($billableWeight, $zone);

            $results[] = [
                'order_id' => $row['order_id'],
                'postal_code' => $row['postal_code'],
                'zone_code' => $zone,
                'billable_kg' => $billableWeight,
                'predicted_eur' => $quote['cost'] ?? 0,
                'actual_eur' => $row['actual_receipt_eur'],
                'error_eur' => ($quote['cost'] ?? 0) - $row['actual_receipt_eur'],
                'error_pct' => $row['actual_receipt_eur'] > 0
                    ? abs((($quote['cost'] ?? 0) - $row['actual_receipt_eur']) / $row['actual_receipt_eur'] * 100)
                    : 0
            ];
        }

        $stats = $this->calculateStats($results);
        $reportPath = $this->generateReport($results, $stats);

        $this->printSummary($stats);
        $this->info("Report saved to: $reportPath");

        return 0;
    }

    private function parseCsv($path): array
    {
        $rows = [];
        if (($handle = fopen($path, 'r')) !== false) {
            $header = fgetcsv($handle);
            while (($data = fgetcsv($handle)) !== false) {
                $rows[] = [
                    'order_id' => $data[0],
                    'weight_kg' => (float)$data[1],
                    'length_cm' => (float)$data[2],
                    'width_cm' => (float)$data[3],
                    'height_cm' => (float)$data[4],
                    'postal_code' => $data[5],
                    'actual_receipt_eur' => (float)$data[6],
                ];
            }
            fclose($handle);
        }
        return $rows;
    }

    private function calculateStats($results): array
    {
        $overall = ['mae' => 0, 'mape' => 0, 'count' => 0];
        $perZone = [];

        foreach ($results as $r) {
            $zone = $r['zone_code'];
            if (!isset($perZone[$zone])) {
                $perZone[$zone] = ['mae' => 0, 'mape' => 0, 'count' => 0];
            }

            $overall['mae'] += abs($r['error_eur']);
            $overall['mape'] += $r['error_pct'];
            $overall['count']++;

            $perZone[$zone]['mae'] += abs($r['error_eur']);
            $perZone[$zone]['mape'] += $r['error_pct'];
            $perZone[$zone]['count']++;
        }

        if ($overall['count'] > 0) {
            $overall['mae'] /= $overall['count'];
            $overall['mape'] /= $overall['count'];
        }

        foreach ($perZone as &$zone) {
            if ($zone['count'] > 0) {
                $zone['mae'] /= $zone['count'];
                $zone['mape'] /= $zone['count'];
            }
        }

        return ['overall' => $overall, 'per_zone' => $perZone];
    }

    private function generateReport($results, $stats): string
    {
        $date = date('Y-m-d');
        $dir = base_path("docs/reports/$date");
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $path = $this->option('out') ?: "$dir/CALIBRATION-REPORT.md";

        $content = "# Shipping Calibration Report\n\n";
        $content .= "**Date**: $date\n\n";
        $content .= "## Sample Data (First 10)\n\n";
        $content .= "| Order ID | Postal | Zone | Billable (kg) | Predicted € | Actual € | Error € | Error % |\n";
        $content .= "|----------|--------|------|---------------|-------------|----------|---------|----------|\n";

        foreach (array_slice($results, 0, 10) as $r) {
            $content .= sprintf(
                "| %s | %s | %s | %.2f | %.2f | %.2f | %.2f | %.1f%% |\n",
                $r['order_id'], $r['postal_code'], $r['zone_code'],
                $r['billable_kg'], $r['predicted_eur'], $r['actual_eur'],
                $r['error_eur'], $r['error_pct']
            );
        }

        $content .= "\n## Summary\n\n";
        $content .= sprintf("- **Overall**: MAE=%.2f€, MAPE=%.1f%%, n=%d\n",
            $stats['overall']['mae'], $stats['overall']['mape'], $stats['overall']['count']);

        $content .= "\n### Per-Zone Metrics\n";
        foreach ($stats['per_zone'] as $zone => $s) {
            $content .= sprintf("- **%s**: MAE=%.2f€, MAPE=%.1f%%, n=%d\n",
                $zone, $s['mae'], $s['mape'], $s['count']);
        }

        $content .= "\n## Next Actions\n\n";
        foreach ($stats['per_zone'] as $zone => $s) {
            if ($s['mape'] > 10) {
                if ($zone === 'island') {
                    $content .= "- MAPE for islands >10% → Adjust `island_multiplier`\n";
                } elseif ($zone === 'remote') {
                    $content .= "- MAPE for remote >10% → Adjust `remote_surcharge`\n";
                }
            }
        }

        file_put_contents($path, $content);
        return $path;
    }

    private function printSummary($stats): void
    {
        $this->info("\n📊 Calibration Summary");
        $this->table(
            ['Metric', 'Value'],
            [
                ['Overall MAE', sprintf('%.2f€', $stats['overall']['mae'])],
                ['Overall MAPE', sprintf('%.1f%%', $stats['overall']['mape'])],
                ['Sample Count', $stats['overall']['count']],
            ]
        );
    }
}