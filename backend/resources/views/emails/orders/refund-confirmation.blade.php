<!DOCTYPE html>
<html lang="el">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Επιστροφή Χρημάτων - Dixis</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .refund-box { background: white; border: 1px solid #d1fae5; border-radius: 8px; padding: 20px; margin: 15px 0; text-align: center; }
        .refund-amount { font-size: 36px; font-weight: bold; color: #059669; }
        .refund-label { color: #065f46; font-size: 14px; margin-top: 4px; }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0;">Επιστροφή Χρημάτων</h1>
    </div>

    <div class="content">
        <p>Αγαπητέ/ή {{ $customerName }},</p>

        <p>Η επιστροφή χρημάτων για την παραγγελία σας <strong>#{{ $orderId }}</strong> ολοκληρώθηκε.</p>

        <div class="refund-box">
            <div class="refund-amount">&euro;{{ $refundedAmount }}</div>
            <div class="refund-label">Ποσό επιστροφής</div>
        </div>

        <p>Το ποσό θα εμφανιστεί στον λογαριασμό σας εντός <strong>3-5 εργάσιμων ημερών</strong>,
        ανάλογα με την τράπεζά σας.</p>

        <p>Αν έχετε οποιαδήποτε απορία, μην διστάσετε να επικοινωνήσετε μαζί μας.</p>
    </div>

    <div class="footer">
        <p>Dixis - Φρέσκα προϊόντα από τοπικούς παραγωγούς</p>
        <p>&copy; {{ date('Y') }} Dixis. Με επιφύλαξη παντός δικαιώματος.</p>
    </div>
</body>
</html>
