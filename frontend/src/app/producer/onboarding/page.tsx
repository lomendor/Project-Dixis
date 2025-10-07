import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/client';
import { getSessionPhone } from '@/lib/auth/session';
import { completeOnboardingAction } from './actions/onboarding';

export default async function OnboardingPage() {
  // Check if user has session
  const phone = await getSessionPhone();
  if (!phone) {
    return redirect('/auth/login');
  }

  // Check if producer already exists
  const existingProducer = await prisma.producer.findFirst({
    where: { phone, isActive: true }
  });

  if (existingProducer) {
    // Producer already onboarded, redirect to dashboard
    return redirect('/my/products');
  }

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: 24, display: 'grid', gap: 24 }}>
      <div>
        <h1>Onboarding παραγωγού</h1>
        <p style={{ color: '#666', marginTop: 8 }}>
          Ολοκληρώστε το προφίλ σας για να ξεκινήσετε τη δημοσίευση προϊόντων.
        </p>
      </div>

      <form action={completeOnboardingAction} style={{ display: 'grid', gap: 16 }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <label htmlFor="name" style={{ fontWeight: 500 }}>
            Επωνυμία παραγωγού *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="π.χ. Μελισσοκομία Δήμου"
            style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
          />
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          <label htmlFor="region" style={{ fontWeight: 500 }}>
            Περιοχή *
          </label>
          <input
            id="region"
            name="region"
            type="text"
            required
            placeholder="π.χ. Αττική"
            style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
          />
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          <label htmlFor="category" style={{ fontWeight: 500 }}>
            Κατηγορία προϊόντων *
          </label>
          <select
            id="category"
            name="category"
            required
            style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
          >
            <option value="">Επιλέξτε κατηγορία...</option>
            <option value="Μέλι">Μέλι</option>
            <option value="Ελαιόλαδο">Ελαιόλαδο</option>
            <option value="Τυροκομικά">Τυροκομικά</option>
            <option value="Οπωροκηπευτικά">Οπωροκηπευτικά</option>
            <option value="Κρέατα">Κρέατα</option>
            <option value="Άλλο">Άλλο</option>
          </select>
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          <label htmlFor="description" style={{ fontWeight: 500 }}>
            Περιγραφή (προαιρετικό)
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Πείτε μας λίγα λόγια για την παραγωγή σας..."
            style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4, resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          <label htmlFor="contactPhone" style={{ fontWeight: 500 }}>
            Τηλέφωνο επικοινωνίας
          </label>
          <input
            id="contactPhone"
            name="contactPhone"
            type="tel"
            defaultValue={phone}
            placeholder="+30 6XX XXX XXXX"
            style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
          />
          <small style={{ color: '#666', fontSize: 14 }}>
            Το τηλέφωνο που θα χρησιμοποιείται για επικοινωνία με πελάτες
          </small>
        </div>

        <button
          type="submit"
          style={{
            padding: '12px 24px',
            backgroundColor: '#16a34a',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            fontWeight: 500,
            cursor: 'pointer',
            marginTop: 8
          }}
        >
          Ολοκλήρωση Onboarding
        </button>
      </form>
    </main>
  );
}
