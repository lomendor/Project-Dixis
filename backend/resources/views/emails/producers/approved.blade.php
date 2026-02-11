<!DOCTYPE html>
<html lang="el">
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">

<div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #16a34a; font-size: 24px; margin: 0;">Dixis</h1>
</div>

<h2 style="color: #166534;">Η αίτησή σας εγκρίθηκε!</h2>

<p>Αγαπητέ/ή <strong>{{ $producerName }}</strong>,</p>

<p>Με χαρά σας ενημερώνουμε ότι η αίτηση εγγραφής σας ως παραγωγός στο Dixis <strong>εγκρίθηκε</strong>.</p>

<p>Μπορείτε τώρα να:</p>
<ul>
    <li>Προσθέσετε τα προϊόντα σας</li>
    <li>Διαχειριστείτε τις παραγγελίες σας</li>
    <li>Δείτε τα στατιστικά πωλήσεών σας</li>
</ul>

<div style="text-align: center; margin: 30px 0;">
    <a href="{{ $dashboardUrl }}" style="background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Μετάβαση στο Dashboard
    </a>
</div>

<p style="color: #666; font-size: 14px;">
    Αν έχετε ερωτήσεις, επικοινωνήστε μαζί μας στο
    <a href="mailto:info@dixis.gr">info@dixis.gr</a>
</p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
<p style="color: #999; font-size: 12px; text-align: center;">Dixis - Marketplace</p>

</body>
</html>
