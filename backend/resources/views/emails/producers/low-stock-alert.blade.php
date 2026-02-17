<!DOCTYPE html>
<html lang="el">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Χαμηλό Απόθεμα - Dixis</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #d97706; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .alert-box { background: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 15px 0; text-align: center; }
        .stock-value { font-size: 36px; font-weight: bold; color: #d97706; }
        .stock-label { color: #92400e; font-size: 14px; margin-top: 4px; }
        .product-name { font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 4px; }
        .cta-button { display: inline-block; background: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0;">Ειδοποίηση Αποθέματος</h1>
        <p style="margin: 5px 0 0; opacity: 0.9;">{{ $producerName }}</p>
    </div>

    <div class="content">
        <p>Το απόθεμα ενός προϊόντος σας είναι χαμηλό:</p>

        <div class="alert-box">
            <div class="product-name">{{ $productName }}</div>
            <div class="stock-value">{{ $currentStock }}</div>
            <div class="stock-label">τεμάχια απομένουν</div>
        </div>

        <p>Ανανεώστε το απόθεμά σας για να αποφύγετε ελλείψεις.</p>

        <div style="text-align: center;">
            <a href="{{ config('app.url') }}/producer/products" class="cta-button">
                Διαχείριση Αποθέματος
            </a>
        </div>
    </div>

    <div class="footer">
        <p>Dixis - Φρέσκα προϊόντα από τοπικούς παραγωγούς</p>
        <p>&copy; {{ date('Y') }} Dixis. Με επιφύλαξη παντός δικαιώματος.</p>
    </div>
</body>
</html>
