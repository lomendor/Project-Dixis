<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\CommissionService;
use App\Models\Order;

class CommissionPreview extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'dixis:commission-preview
        {--orderId= : Order ID to calculate commission for}
        {--amount= : Net amount if not using orderId}
        {--channel=b2c : b2c or b2b}
        {--producerId= : Optional producer ID for custom rules}
        {--categoryId= : Optional category ID for custom rules}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Preview commission calculation with dynamic rules';

    /**
     * Execute the console command.
     */
    public function handle(CommissionService $service)
    {
        $channel = $this->option('channel') === 'b2b' ? 'b2b' : 'b2c';
        $producerId = $this->option('producerId') ? (int)$this->option('producerId') : null;
        $categoryId = $this->option('categoryId') ? (int)$this->option('categoryId') : null;

        if ($orderId = $this->option('orderId')) {
            $order = Order::find((int)$orderId);
            if (!$order) {
                $this->error("Order {$orderId} not found");
                return 1;
            }

            $commission = $service->settleForOrder($order, $channel);

            $this->line(json_encode([
                'order_id' => $order->id,
                'channel' => $commission->channel,
                'order_gross' => $commission->order_gross,
                'platform_fee' => $commission->platform_fee,
                'platform_fee_vat' => $commission->platform_fee_vat,
                'producer_payout' => $commission->producer_payout,
                'currency' => $commission->currency,
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

            return 0;
        }

        if ($amount = $this->option('amount')) {
            $amount = (float)$amount;

            // Use FeeResolver directly for preview without Order
            $resolved = app(\App\Services\FeeResolver::class)->resolve(
                $producerId,
                $categoryId,
                $channel
            );

            $platformFee = round($amount * (float)$resolved['rate'], 2);
            $platformFeeVat = round($platformFee * (float)$resolved['fee_vat_rate'], 2);
            $producerPayout = round($amount - $platformFee - $platformFeeVat, 2);

            $this->line(json_encode([
                'amount' => $amount,
                'channel' => $channel,
                'rate' => $resolved['rate'],
                'fee_vat_rate' => $resolved['fee_vat_rate'],
                'platform_fee' => $platformFee,
                'platform_fee_vat' => $platformFeeVat,
                'producer_payout' => $producerPayout,
                'source' => $resolved['source'],
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

            return 0;
        }

        $this->error('Provide --orderId or --amount');
        return 1;
    }
}
