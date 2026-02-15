<!DOCTYPE html>
<html lang="el">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Νέα Παραγγελία - Dixis Admin</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a7a3e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 1.3em; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .summary-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #1a7a3e; }
        .summary-row { display: flex; justify-content: space-between; padding: 6px 0; }
        .summary-label { color: #6b7280; font-size: 0.9em; }
        .summary-value { font-weight: 600; }
        .total-highlight { font-size: 1.4em; color: #1a7a3e; font-weight: bold; text-align: center; padding: 12px 0; }
        .btn { display: inline-block; background: #1a7a3e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 10px; }
        .btn:hover { background: #0f5c2e; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 0.85em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Νέα Παραγγελία #{{ $orderNumber }}</h1>
    </div>

    <div class="content">
        <div class="total-highlight">
            €{{ $total }}
        </div>

        <div class="summary-box">
            <div class="summary-row">
                <span class="summary-label">Πελάτης:</span>
                <span class="summary-value">{{ $customerName }}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Email:</span>
                <span class="summary-value">{{ $customerEmail }}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Προϊόντα:</span>
                <span class="summary-value">{{ $itemCount }} {{ $itemCount === 1 ? 'τεμάχιο' : 'τεμάχια' }}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Πληρωμή:</span>
                <span class="summary-value">{{ $paymentMethod }}</span>
            </div>
        </div>

        <div style="text-align: center; padding: 10px 0;">
            <a href="{{ $adminUrl }}" class="btn">Δες την Παραγγελία →</a>
        </div>
    </div>

    <div class="footer">
        <p>Dixis Admin — Αυτόματη ειδοποίηση</p>
    </div>
</body>
</html>
