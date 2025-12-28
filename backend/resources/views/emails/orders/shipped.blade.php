<!DOCTYPE html>
<html lang="el">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Η παραγγελία σας στάλθηκε</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .info-box { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 15px 0; }
        .highlight { color: #10b981; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Η παραγγελία σας στάλθηκε!</h1>
    </div>

    <div class="content">
        <p>Αγαπητέ/ή πελάτη,</p>

        <p>Η παραγγελία σας <span class="highlight">#{{ $orderNumber }}</span> έχει αποσταλεί και είναι καθ' οδόν!</p>

        <div class="info-box">
            <h3>Στοιχεία Αποστολής</h3>
            <p><strong>Διεύθυνση:</strong> {{ $shippingAddress }}</p>
            <p><strong>Τρόπος Αποστολής:</strong> {{ $shippingMethod }}</p>
        </div>

        <p>Θα λάβετε ένα ακόμα email όταν η παραγγελία σας παραδοθεί.</p>

        <p>Ευχαριστούμε που επιλέξατε το Dixis!</p>
    </div>

    <div class="footer">
        <p>Dixis - Φρέσκα προϊόντα από τοπικούς παραγωγούς</p>
        <p>&copy; {{ date('Y') }} Dixis. Με επιφύλαξη παντός δικαιώματος.</p>
    </div>
</body>
</html>
