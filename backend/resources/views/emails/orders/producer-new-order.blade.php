<!DOCTYPE html>
<html lang="el">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Νέα Παραγγελία - Dixis</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .order-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .item { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .item:last-child { border-bottom: none; }
        .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 0.9em; }
        .highlight { color: #2563eb; font-weight: bold; }
        .alert { background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; border-radius: 4px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Νέα Παραγγελία!</h1>
    </div>

    <div class="content">
        <p>Γεια σας <strong>{{ $producer->name }}</strong>,</p>

        <p>Έχετε νέα παραγγελία με αριθμό <span class="highlight">#{{ $orderNumber }}</span> από τον/την <strong>{{ $customerName }}</strong>.</p>

        <div class="order-details">
            <h3>Τα Προϊόντα σας σε αυτή την Παραγγελία ({{ $itemCount }})</h3>

            @foreach($items as $item)
            <div class="item">
                <strong>{{ $item->product_name }}</strong><br>
                Ποσότητα: {{ $item->quantity }} {{ $item->product_unit ?? 'τεμ.' }}<br>
                Τιμή: €{{ number_format($item->total_price, 2) }}
            </div>
            @endforeach

            <div class="total-row">
                <span>Σύνολο προϊόντων σας:</span>
                <span>€{{ $producerSubtotal }}</span>
            </div>
        </div>

        <div class="order-details">
            <h3>Στοιχεία Αποστολής</h3>
            <p><strong>Διεύθυνση:</strong><br>{{ $shippingAddress }}</p>
            <p><strong>Τρόπος Αποστολής:</strong> {{ $shippingMethod }}</p>
        </div>

        <div class="alert">
            <strong>Υπενθύμιση:</strong> Παρακαλούμε ετοιμάστε τα προϊόντα για αποστολή.
        </div>
    </div>

    <div class="footer">
        <p>Dixis - Τοπικά Προϊόντα, Άμεσα στην Πόρτα σας</p>
        <p><a href="https://dixis.gr">dixis.gr</a></p>
    </div>
</body>
</html>
