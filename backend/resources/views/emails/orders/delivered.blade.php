<!DOCTYPE html>
<html lang="el">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Η παραγγελία σας παραδόθηκε</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .highlight { color: #3b82f6; font-weight: bold; }
        .cta { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Η παραγγελία σας παραδόθηκε!</h1>
    </div>

    <div class="content">
        <p>Αγαπητέ/ή πελάτη,</p>

        <p>Η παραγγελία σας <span class="highlight">#{{ $orderNumber }}</span> έχει παραδοθεί με επιτυχία!</p>

        <p>Ελπίζουμε να απολαύσετε τα προϊόντα σας. Αν έχετε οποιαδήποτε ερώτηση ή σχόλιο, μη διστάσετε να επικοινωνήσετε μαζί μας.</p>

        <p>Ευχαριστούμε που επιλέξατε το Dixis!</p>
    </div>

    <div class="footer">
        <p>Dixis - Φρέσκα προϊόντα από τοπικούς παραγωγούς</p>
        <p>&copy; {{ date('Y') }} Dixis. Με επιφύλαξη παντός δικαιώματος.</p>
    </div>
</body>
</html>
