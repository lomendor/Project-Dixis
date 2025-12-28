<!DOCTYPE html>
<html lang="el">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Επιβεβαίωση Παραγγελίας - Dixis</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .order-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .item { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .item:last-child { border-bottom: none; }
        .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
        .total-final { font-weight: bold; font-size: 1.1em; border-top: 2px solid #16a34a; padding-top: 10px; margin-top: 10px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 0.9em; }
        .highlight { color: #16a34a; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Ευχαριστούμε για την παραγγελία σας!</h1>
    </div>

    <div class="content">
        <p>Η παραγγελία σας με αριθμό <span class="highlight">#{{ $orderNumber }}</span> καταχωρήθηκε επιτυχώς.</p>

        <div class="order-details">
            <h3>Στοιχεία Παραγγελίας</h3>

            <p><strong>Διεύθυνση Αποστολής:</strong><br>{{ $shippingAddress }}</p>
            <p><strong>Τρόπος Αποστολής:</strong> {{ $shippingMethod }}</p>
            <p><strong>Τρόπος Πληρωμής:</strong> {{ $paymentMethod }}</p>
        </div>

        <div class="order-details">
            <h3>Προϊόντα</h3>

            @foreach($items as $item)
            <div class="item">
                <strong>{{ $item->product_name }}</strong><br>
                {{ $item->quantity }} x €{{ number_format($item->unit_price, 2) }} = €{{ number_format($item->total_price, 2) }}
            </div>
            @endforeach

            <div class="total-row">
                <span>Υποσύνολο:</span>
                <span>€{{ $subtotal }}</span>
            </div>
            <div class="total-row">
                <span>Μεταφορικά:</span>
                <span>€{{ $shippingCost }}</span>
            </div>
            <div class="total-row total-final">
                <span>Σύνολο:</span>
                <span>€{{ $total }}</span>
            </div>
        </div>

        <p>Θα λάβετε ειδοποίηση όταν η παραγγελία σας αποσταλεί.</p>
    </div>

    <div class="footer">
        <p>Dixis - Τοπικά Προϊόντα, Άμεσα στην Πόρτα σας</p>
        <p><a href="https://dixis.gr">dixis.gr</a></p>
    </div>
</body>
</html>
