<!DOCTYPE html>
<html lang="el">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $isDelivered ? 'Παραγγελία Παραδόθηκε' : 'Παραγγελία Στάλθηκε' }} - Dixis</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: {{ $isDelivered ? '#059669' : '#2563eb' }}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .order-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .item { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .item:last-child { border-bottom: none; }
        .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .highlight { color: #2563eb; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0;">{{ $isDelivered ? 'Παραγγελία Παραδόθηκε' : 'Παραγγελία Στάλθηκε' }}</h1>
    </div>

    <div class="content">
        <p>Γεια σας <strong>{{ $producer->name }}</strong>,</p>

        @if($isDelivered)
            <p>Η παραγγελία <span class="highlight">#{{ $orderNumber }}</span> παραδόθηκε στον/στην <strong>{{ $customerName }}</strong>.</p>
        @else
            <p>Η παραγγελία <span class="highlight">#{{ $orderNumber }}</span> στάλθηκε στον/στην <strong>{{ $customerName }}</strong>.</p>
        @endif

        <div class="order-details">
            <h3>Τα Προϊόντα σας ({{ $itemCount }})</h3>

            @foreach($items as $item)
            <div class="item">
                <strong>{{ $item->product_name }}</strong><br>
                Ποσότητα: {{ $item->quantity }} {{ $item->product_unit ?? 'τεμ.' }}<br>
                Τιμή: &euro;{{ number_format($item->total_price, 2) }}
            </div>
            @endforeach

            <div class="total-row">
                <span>Σύνολο:</span>
                <span>&euro;{{ $producerSubtotal }}</span>
            </div>
        </div>
    </div>

    <div class="footer">
        <p>Dixis - Φρέσκα προϊόντα από τοπικούς παραγωγούς</p>
        <p>&copy; {{ date('Y') }} Dixis. Με επιφύλαξη παντός δικαιώματος.</p>
    </div>
</body>
</html>
