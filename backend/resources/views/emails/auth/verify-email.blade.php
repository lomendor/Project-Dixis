<!DOCTYPE html>
<html lang="el">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Επιβεβαίωση Email - Dixis</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .button-container { text-align: center; margin: 30px 0; }
        .button { display: inline-block; background: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 0.9em; }
        .warning { background: #dbeafe; border: 1px solid #3b82f6; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .link-fallback { word-break: break-all; font-size: 0.85em; color: #6b7280; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Επιβεβαίωση Email</h1>
    </div>

    <div class="content">
        <p>Γεια σας{{ $user->name ? ' ' . $user->name : '' }},</p>

        <p>Σας ευχαριστούμε που εγγραφήκατε στο Dixis! Παρακαλούμε επιβεβαιώστε τη διεύθυνση email σας κάνοντας κλικ στο παρακάτω κουμπί.</p>

        <div class="button-container">
            <a href="{{ $verifyUrl }}" class="button">Επιβεβαίωση Email</a>
        </div>

        <div class="warning">
            <strong>Σημείωση:</strong> Αυτός ο σύνδεσμος λήγει σε 24 ώρες. Αν δεν δημιουργήσατε λογαριασμό στο Dixis, αγνοήστε αυτό το email.
        </div>

        <p class="link-fallback">
            Αν το κουμπί δεν λειτουργεί, αντιγράψτε τον παρακάτω σύνδεσμο στον browser σας:<br>
            {{ $verifyUrl }}
        </p>
    </div>

    <div class="footer">
        <p>Dixis - Τοπικά Προϊόντα, Άμεσα στην Πόρτα σας</p>
        <p><a href="https://dixis.gr">dixis.gr</a></p>
    </div>
</body>
</html>
