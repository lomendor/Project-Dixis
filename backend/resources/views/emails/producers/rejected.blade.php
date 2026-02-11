<!DOCTYPE html>
<html lang="el">
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">

<div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #16a34a; font-size: 24px; margin: 0;">Dixis</h1>
</div>

<h2 style="color: #991b1b;">Ενημέρωση Αίτησης</h2>

<p>Αγαπητέ/ή <strong>{{ $producerName }}</strong>,</p>

<p>Δυστυχώς, η αίτηση εγγραφής σας ως παραγωγός στο Dixis δεν εγκρίθηκε.</p>

@if($rejectionReason)
<div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 16px; margin: 20px 0;">
    <strong>Λόγος:</strong>
    <p style="margin: 8px 0 0;">{{ $rejectionReason }}</p>
</div>
@endif

<p>
    Αν πιστεύετε ότι υπήρξε κάποιο λάθος ή θέλετε περισσότερες πληροφορίες,
    επικοινωνήστε μαζί μας στο
    <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a>.
</p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
<p style="color: #999; font-size: 12px; text-align: center;">Dixis - Marketplace</p>

</body>
</html>
