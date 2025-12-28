<!DOCTYPE html>
<html lang="el">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Εβδομαδιαία Αναφορά - Dixis</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .stat-box { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 10px 0; text-align: center; }
        .stat-value { font-size: 28px; font-weight: bold; color: #059669; }
        .stat-label { color: #6b7280; font-size: 14px; }
        .stats-grid { display: flex; flex-wrap: wrap; gap: 10px; }
        .stats-grid .stat-box { flex: 1; min-width: 120px; }
        .products-list { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 15px 0; }
        .product-item { padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
        .product-item:last-child { border-bottom: none; }
        .period { color: #6b7280; font-size: 14px; margin-bottom: 15px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Εβδομαδιαία Αναφορά</h1>
        <p style="margin: 0; opacity: 0.9;">{{ $producerName }}</p>
    </div>

    <div class="content">
        <p class="period">Περίοδος: {{ $periodStart }} - {{ $periodEnd }}</p>

        <div class="stats-grid">
            <div class="stat-box">
                <div class="stat-value">{{ $ordersCount }}</div>
                <div class="stat-label">Παραγγελίες</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">€{{ $grossRevenue }}</div>
                <div class="stat-label">Έσοδα</div>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-box">
                <div class="stat-value">{{ $pendingCount }}</div>
                <div class="stat-label">Σε αναμονή</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">{{ $deliveredCount }}</div>
                <div class="stat-label">Παραδοθέντα</div>
            </div>
        </div>

        @if(count($topProducts) > 0)
        <div class="products-list">
            <h3 style="margin-top: 0;">Κορυφαία Προϊόντα</h3>
            @foreach($topProducts as $product)
            <div class="product-item">
                <strong>{{ $product['name'] }}</strong>
                <span style="float: right; color: #059669;">{{ $product['quantity'] }} τεμ.</span>
            </div>
            @endforeach
        </div>
        @endif

        @if($ordersCount == 0)
        <p style="text-align: center; color: #6b7280; margin-top: 20px;">
            Δεν υπάρχουν παραγγελίες αυτή την εβδομάδα.
        </p>
        @endif
    </div>

    <div class="footer">
        <p>Dixis - Φρέσκα προϊόντα από τοπικούς παραγωγούς</p>
        <p>&copy; {{ date('Y') }} Dixis. Με επιφύλαξη παντός δικαιώματος.</p>
    </div>
</body>
</html>
