<!DOCTYPE html>
<html lang="el">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Παραγγελία σε αναμονή - Dixis Admin</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 1.2em; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .alert-box { background: #fef2f2; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #dc2626; }
        .producer-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b; }
        .phone-highlight { font-size: 1.3em; font-weight: bold; color: #1a7a3e; letter-spacing: 1px; }
        .summary-row { padding: 6px 0; }
        .summary-label { color: #6b7280; font-size: 0.9em; }
        .summary-value { font-weight: 600; }
        .btn { display: inline-block; background: #1a7a3e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 10px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 0.85em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>⚠️ Παραγγελία #{{ $orderNumber }} — Δεν αποδέχτηκε ο παραγωγός</h1>
    </div>

    <div class="content">
        <div class="alert-box">
            <strong>Η παραγγελία περιμένει {{ $minutesPending }} λεπτά</strong> χωρίς ο παραγωγός να την αποδεχτεί.
            Πάρε τηλέφωνο τον παραγωγό για επιβεβαίωση.
        </div>

        <div class="producer-box">
            <div class="summary-row">
                <span class="summary-label">Παραγωγός:</span>
                <span class="summary-value">{{ $producerName }}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Τηλέφωνο:</span>
                <span class="phone-highlight">{{ $producerPhone }}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Email:</span>
                <span class="summary-value">{{ $producerEmail }}</span>
            </div>
        </div>

        <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <div class="summary-row">
                <span class="summary-label">Πελάτης:</span>
                <span class="summary-value">{{ $customerName }}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Ποσό:</span>
                <span class="summary-value">€{{ $total }}</span>
            </div>
        </div>

        <div style="text-align: center; padding: 10px 0;">
            <a href="{{ $adminUrl }}" class="btn">Δες τις Παραγγελίες →</a>
        </div>
    </div>

    <div class="footer">
        <p>Dixis Admin — Αυτόματη ειδοποίηση εκκρεμών παραγγελιών</p>
    </div>
</body>
</html>
