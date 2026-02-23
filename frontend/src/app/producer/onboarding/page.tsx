'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import UploadDocument from '@/components/UploadDocument.client';
import { CATEGORIES } from '@/data/categories';

/** Categories excluded from MVP (need age verification in checkout) */
const EXCLUDED_CATEGORIES = ['beverages'];
const ONBOARDING_CATEGORIES = CATEGORIES.filter(
  (c) => !EXCLUDED_CATEGORIES.includes(c.slug)
);

interface ProducerProfile {
  id: number;
  status: string;
  business_name?: string;
  rejection_reason?: string | null;
  onboarding_completed_at?: string | null;
  product_categories?: string[] | null;
  // existing fields for pre-fill
  phone?: string;
  city?: string;
  region?: string;
  description?: string;
  tax_id?: string;
  tax_office?: string;
  email?: string;
  address?: string;
  postal_code?: string;
  food_license_number?: string;
  // Bank details for payouts
  iban?: string | null;
  bank_account_holder?: string | null;
  // Onboarding V2 document fields
  tax_registration_doc_url?: string | null;
  efet_notification_doc_url?: string | null;
  haccp_declaration_doc_url?: string | null;
  haccp_declaration_accepted?: boolean;
  beekeeper_registry_number?: string | null;
  cpnp_notification_number?: string | null;
  responsible_person_name?: string | null;
}

const REGIONS = [
  'Αττική',
  'Κεντρική Μακεδονία',
  'Δυτική Μακεδονία',
  'Ανατολική Μακεδονία και Θράκη',
  'Ήπειρος',
  'Θεσσαλία',
  'Ιόνια Νησιά',
  'Δυτική Ελλάδα',
  'Στερεά Ελλάδα',
  'Πελοπόννησος',
  'Βόρειο Αιγαίο',
  'Νότιο Αιγαίο',
  'Κρήτη',
];

export default function ProducerOnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState<ProducerProfile | null>(null);

  const [form, setForm] = useState({
    business_name: '',
    phone: '',
    email: '',
    tax_id: '',
    tax_office: '',
    address: '',
    city: '',
    postal_code: '',
    region: '',
    description: '',
    food_license_number: '',
    iban: '',
    bank_account_holder: '',
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [agreementAccepted, setAgreementAccepted] = useState(false);

  // Document uploads
  const [taxDocUrl, setTaxDocUrl] = useState<string | null>(null);
  const [efetDocUrl, setEfetDocUrl] = useState<string | null>(null);
  const [haccpDocUrl, setHaccpDocUrl] = useState<string | null>(null);
  const [haccpAccepted, setHaccpAccepted] = useState(false);

  // Category-specific fields
  const [beekeeperNumber, setBeekeeperNumber] = useState('');
  const [cpnpNumber, setCpnpNumber] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('');

  // Check auth + load existing profile
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (user?.role !== 'producer') {
      router.push('/');
      return;
    }
    loadProfile();
  }, [isAuthenticated, user]);

  const loadProfile = async () => {
    try {
      const data = await apiClient.getProducerMe();
      if (data.has_profile && data.producer) {
        const p = data.producer as ProducerProfile;
        setProfile(p);
        // If already active, go to dashboard
        if (p.status === 'active') {
          router.push('/producer/dashboard');
          return;
        }
        // If onboarding already completed, go to dashboard (pending state shown there)
        if (p.onboarding_completed_at) {
          router.push('/producer/dashboard');
          return;
        }
        // Pre-fill form with existing data
        setForm((prev) => ({
          ...prev,
          business_name: p.business_name || '',
          phone: p.phone || '',
          email: p.email || '',
          tax_id: p.tax_id || '',
          tax_office: p.tax_office || '',
          address: p.address || '',
          city: p.city || '',
          postal_code: p.postal_code || '',
          region: p.region || '',
          description: p.description || '',
          food_license_number: p.food_license_number || '',
          iban: p.iban || '',
          bank_account_holder: p.bank_account_holder || '',
        }));
        if (p.product_categories) setSelectedCategories(p.product_categories);
        // Pre-fill document uploads and category-specific fields
        if (p.tax_registration_doc_url) setTaxDocUrl(p.tax_registration_doc_url);
        if (p.efet_notification_doc_url) setEfetDocUrl(p.efet_notification_doc_url);
        if (p.haccp_declaration_doc_url) setHaccpDocUrl(p.haccp_declaration_doc_url);
        if (p.haccp_declaration_accepted) setHaccpAccepted(true);
        if (p.beekeeper_registry_number) setBeekeeperNumber(p.beekeeper_registry_number);
        if (p.cpnp_notification_number) setCpnpNumber(p.cpnp_notification_number);
        if (p.responsible_person_name) setResponsiblePerson(p.responsible_person_name);
      }
    } catch {
      // No profile yet — show form (expected for new registrations)
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  /** Fire-and-forget admin email notification */
  const notifyAdmin = () => {
    fetch('/api/ops/notify-onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        business_name: form.business_name,
        phone: form.phone,
        email: form.email,
        city: form.city,
        product_categories: selectedCategories,
      }),
    }).catch(() => {}); // silent — non-blocking
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate required fields
    if (!form.business_name || !form.phone || !form.city || !form.tax_id) {
      setError('Συμπληρώστε τα υποχρεωτικά πεδία (Επωνυμία, Τηλέφωνο, Πόλη, ΑΦΜ)');
      return;
    }
    if (!/^\d{9}$/.test(form.tax_id)) {
      setError('Το ΑΦΜ πρέπει να είναι ακριβώς 9 ψηφία');
      return;
    }
    if (selectedCategories.length === 0) {
      setError('Επιλέξτε τουλάχιστον μία κατηγορία προϊόντων');
      return;
    }
    if (!taxDocUrl) {
      setError('Ανεβάστε την εκτύπωση TAXIS (ΑΦΜ + ΚΑΔ)');
      return;
    }
    if (!efetDocUrl) {
      setError('Ανεβάστε τη γνωστοποίηση ΕΦΕΤ / NotifyBusiness');
      return;
    }
    if (!form.iban.trim() || !form.bank_account_holder.trim()) {
      setError('Συμπληρώστε τα τραπεζικά στοιχεία (IBAN και Δικαιούχος)');
      return;
    }
    const ibanClean = form.iban.replace(/\s/g, '').toUpperCase();
    if (!/^GR\d{2}\d{23}$/.test(ibanClean)) {
      setError('Το IBAN πρέπει να είναι ελληνικό (GR + 25 ψηφία)');
      return;
    }
    if (selectedCategories.includes('honey-bee') && !beekeeperNumber.trim()) {
      setError('Συμπληρώστε τον αριθμό μητρώου μελισσοκόμου');
      return;
    }
    if (selectedCategories.includes('cosmetics') && (!cpnpNumber.trim() || !responsiblePerson.trim())) {
      setError('Συμπληρώστε τον αριθμό CPNP και το υπεύθυνο πρόσωπο για καλλυντικά');
      return;
    }
    if (!agreementAccepted) {
      setError('Πρέπει να αποδεχτείτε τη Συμφωνία Συνεργασίας Παραγωγού');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await apiClient.updateProducerProfile({
        ...form,
        iban: form.iban.replace(/\s/g, '').toUpperCase(),
        product_categories: selectedCategories,
        tax_registration_doc_url: taxDocUrl,
        efet_notification_doc_url: efetDocUrl,
        haccp_declaration_doc_url: haccpDocUrl,
        haccp_declaration_accepted: haccpAccepted,
        ...(selectedCategories.includes('honey-bee') ? { beekeeper_registry_number: beekeeperNumber } : {}),
        ...(selectedCategories.includes('cosmetics') ? {
          cpnp_notification_number: cpnpNumber,
          responsible_person_name: responsiblePerson,
        } : {}),
        agreement_accepted_at: new Date().toISOString(),
        onboarding_completed_at: new Date().toISOString(),
      });
      setSuccess(true);
      // Fire-and-forget: notify admin via email
      notifyAdmin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Κάτι πήγε στραβά. Δοκιμάστε ξανά.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Rejected state — show form again with rejection reason
  if (profile?.status === 'inactive' && profile.rejection_reason) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-2xl font-bold text-neutral-900 mb-4" data-testid="page-title">
              Ενημέρωση Αίτησης
            </h1>
            <div className="border rounded-lg p-6 bg-red-50 border-red-200 text-red-800 mb-6">
              <h3 className="font-semibold text-lg mb-2">Η αίτησή σας δεν εγκρίθηκε</h3>
              <p className="mb-2">
                <strong>Λόγος:</strong> {profile.rejection_reason}
              </p>
              <p>
                Διορθώστε τα στοιχεία σας και υποβάλετε ξανά, ή επικοινωνήστε μαζί μας στο{' '}
                <a href="mailto:info@dixis.gr" className="underline font-medium">
                  info@dixis.gr
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success just submitted
  if (success) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-2xl font-bold text-neutral-900 mb-4" data-testid="page-title">
              Ολοκλήρωση Εγγραφής
            </h1>
            <div
              className="border rounded-lg p-6 bg-green-50 border-green-200 text-green-800"
              data-testid="success-banner"
            >
              <h3 className="font-semibold text-lg mb-2">Τα στοιχεία σας καταχωρήθηκαν!</h3>
              <p>
                Τα στοιχεία σας ελέγχονται. Ετοιμάστε τα προϊόντα σας — θα εμφανιστούν μόλις
                εγκριθείτε.
              </p>
            </div>
            <button
              onClick={() => router.push('/producer/dashboard')}
              className="mt-6 w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary-light transition-colors font-medium"
            >
              Μετάβαση στο Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form state — show onboarding form
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2" data-testid="page-title">
            Εγγραφή Παραγωγού
          </h1>
          <p className="text-neutral-600 mb-6">
            Συμπληρώστε τα στοιχεία σας και ανεβάστε τα απαραίτητα έγγραφα για να ξεκινήσετε να
            πουλάτε στο Dixis.
          </p>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6" data-testid="form-error">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="onboarding-form">
            {/* Section 1: Business Info */}
            <fieldset>
              <legend className="text-lg font-semibold text-neutral-800 mb-4">
                Στοιχεία Επιχείρησης
              </legend>
              <div className="space-y-4">
                <div>
                  <label htmlFor="business_name" className="block text-sm font-medium text-neutral-700">
                    Επωνυμία Επιχείρησης <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="business_name"
                    name="business_name"
                    type="text"
                    required
                    value={form.business_name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="π.χ. Αγρόκτημα Παπαδόπουλου"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="tax_id" className="block text-sm font-medium text-neutral-700">
                      ΑΦΜ <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="tax_id"
                      name="tax_id"
                      type="text"
                      required
                      maxLength={9}
                      pattern="\d{9}"
                      value={form.tax_id}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder="9 ψηφία"
                    />
                  </div>
                  <div>
                    <label htmlFor="tax_office" className="block text-sm font-medium text-neutral-700">
                      ΔΟΥ
                    </label>
                    <input
                      id="tax_office"
                      name="tax_office"
                      type="text"
                      value={form.tax_office}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder="π.χ. Α' Ηρακλείου"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-neutral-700">
                      Τηλέφωνο <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder="69XXXXXXXX"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                      Email Επιχείρησης
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder="info@example.gr"
                    />
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Section 2: Address */}
            <fieldset>
              <legend className="text-lg font-semibold text-neutral-800 mb-4">
                Διεύθυνση Έδρας
              </legend>
              <div className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-neutral-700">
                    Οδός & Αριθμός
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={form.address}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="π.χ. Λεωφ. Κνωσού 42"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-neutral-700">
                      Πόλη <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      required
                      value={form.city}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder="π.χ. Ηράκλειο"
                    />
                  </div>
                  <div>
                    <label htmlFor="postal_code" className="block text-sm font-medium text-neutral-700">
                      Τ.Κ.
                    </label>
                    <input
                      id="postal_code"
                      name="postal_code"
                      type="text"
                      maxLength={5}
                      value={form.postal_code}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder="71201"
                    />
                  </div>
                  <div>
                    <label htmlFor="region" className="block text-sm font-medium text-neutral-700">
                      Περιφέρεια
                    </label>
                    <select
                      id="region"
                      name="region"
                      value={form.region}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    >
                      <option value="">Επιλέξτε...</option>
                      {REGIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Section 3: Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-700">
                Περιγραφή Επιχείρησης
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Πείτε μας λίγα λόγια για την επιχείρησή σας..."
              />
            </div>

            {/* Section 4: Bank Details */}
            <fieldset>
              <legend className="text-lg font-semibold text-neutral-800 mb-2">
                Τραπεζικά Στοιχεία
              </legend>
              <p className="text-sm text-neutral-500 mb-3">
                Απαραίτητα για την πληρωμή σας. Το IBAN σας δεν εμφανίζεται δημόσια.
              </p>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="iban" className="block text-sm font-medium text-neutral-700">
                    IBAN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="iban"
                    name="iban"
                    value={form.iban}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary uppercase"
                    placeholder="GR00 0000 0000 0000 0000 0000 000"
                    maxLength={34}
                  />
                  <p className="mt-1 text-xs text-neutral-400">Ελληνικό IBAN (ξεκινά με GR)</p>
                </div>
                <div>
                  <label htmlFor="bank_account_holder" className="block text-sm font-medium text-neutral-700">
                    Δικαιούχος Λογαριασμού <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="bank_account_holder"
                    name="bank_account_holder"
                    value={form.bank_account_holder}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Ονοματεπώνυμο ή Επωνυμία Εταιρείας"
                  />
                </div>
              </div>
            </fieldset>

            {/* Section 5: Product Categories */}
            <fieldset>
              <legend className="text-lg font-semibold text-neutral-800 mb-2">
                Κατηγορίες Προϊόντων <span className="text-red-500">*</span>
              </legend>
              <p className="text-sm text-neutral-500 mb-3">
                Επιλέξτε τις κατηγορίες στις οποίες σκοπεύετε να πουλήσετε.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ONBOARDING_CATEGORIES.map((cat) => (
                  <label
                    key={cat.slug}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedCategories.includes(cat.slug)
                        ? 'border-primary bg-primary/5'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.slug)}
                      onChange={() => toggleCategory(cat.slug)}
                      className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-neutral-700">{cat.labelEl}</span>
                  </label>
                ))}
              </div>
              {selectedCategories.includes('honey-bee') && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                  Για μέλι & προϊόντα μέλισσας θα χρειαστεί ο αριθμός μητρώου μελισσοκόμου.
                </div>
              )}
              {selectedCategories.includes('cosmetics') && (
                <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-800">
                  Για καλλυντικά θα χρειαστεί ο αριθμός κοινοποίησης CPNP και τα στοιχεία
                  υπεύθυνου προσώπου (Κανονισμός ΕΕ 1223/2009).
                </div>
              )}
            </fieldset>

            {/* Section 5: Document Uploads */}
            <fieldset>
              <legend className="text-lg font-semibold text-neutral-800 mb-2">
                Έγγραφα
              </legend>
              <p className="text-sm text-neutral-500 mb-4">
                Ανεβάστε τα απαραίτητα έγγραφα σε μορφή PDF ή εικόνας.
              </p>
              <div className="space-y-4">
                <UploadDocument
                  label="Εκτύπωση TAXIS (ΑΦΜ + ΚΑΔ)"
                  hint="Εκτύπωση από TAXISnet που δείχνει ΑΦΜ και Κωδικό Αριθμό Δραστηριότητας"
                  required
                  value={taxDocUrl}
                  onChange={setTaxDocUrl}
                />
                <UploadDocument
                  label="Γνωστοποίηση ΕΦΕΤ / NotifyBusiness"
                  hint="Βεβαίωση γνωστοποίησης από τον ΕΦΕΤ ή το NotifyBusiness"
                  required
                  value={efetDocUrl}
                  onChange={setEfetDocUrl}
                />
                <UploadDocument
                  label="Πιστοποιητικό HACCP (προαιρετικό)"
                  hint="Αν διαθέτετε πιστοποίηση HACCP, ανεβάστε το εδώ"
                  value={haccpDocUrl}
                  onChange={setHaccpDocUrl}
                />
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={haccpAccepted}
                    onChange={(e) => setHaccpAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-neutral-700">
                    Δηλώνω ότι τηρώ τις αρχές HACCP στην παραγωγή μου
                    (Κανονισμός ΕΕ 852/2004)
                  </span>
                </label>
              </div>
            </fieldset>

            {/* Section 6: Category-specific fields */}
            {selectedCategories.includes('honey-bee') && (
              <fieldset className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <legend className="text-base font-semibold text-amber-900 mb-3">
                  Μέλι & Προϊόντα Μέλισσας
                </legend>
                <div>
                  <label htmlFor="beekeeper_number" className="block text-sm font-medium text-amber-800">
                    Αριθμός Μητρώου Μελισσοκόμου <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="beekeeper_number"
                    type="text"
                    value={beekeeperNumber}
                    onChange={(e) => setBeekeeperNumber(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-amber-300 rounded-md bg-white focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="π.χ. ΕΛ-12345"
                  />
                  <p className="mt-1 text-xs text-amber-700">
                    Αριθμός εγγραφής στο μητρώο μελισσοκόμων του ΥΠΑΑΤ
                  </p>
                </div>
              </fieldset>
            )}

            {selectedCategories.includes('cosmetics') && (
              <fieldset className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <legend className="text-base font-semibold text-purple-900 mb-3">
                  Φυσικά Καλλυντικά (Κανονισμός ΕΕ 1223/2009)
                </legend>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cpnp_number" className="block text-sm font-medium text-purple-800">
                      Αριθμός Κοινοποίησης CPNP <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="cpnp_number"
                      type="text"
                      value={cpnpNumber}
                      onChange={(e) => setCpnpNumber(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-purple-300 rounded-md bg-white focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder="Αριθμός από την πλατφόρμα CPNP"
                    />
                  </div>
                  <div>
                    <label htmlFor="responsible_person" className="block text-sm font-medium text-purple-800">
                      Υπεύθυνο Πρόσωπο (Responsible Person) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="responsible_person"
                      type="text"
                      value={responsiblePerson}
                      onChange={(e) => setResponsiblePerson(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-purple-300 rounded-md bg-white focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder="Ονοματεπώνυμο υπεύθυνου προσώπου"
                    />
                    <p className="mt-1 text-xs text-purple-700">
                      Το υπεύθυνο πρόσωπο για τα καλλυντικά προϊόντα στην ΕΕ
                    </p>
                  </div>
                </div>
              </fieldset>
            )}

            {/* Section 7: Agreement */}
            <div className="border-t pt-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreementAccepted}
                  onChange={(e) => setAgreementAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-neutral-700">
                  Διάβασα και αποδέχομαι τη{' '}
                  <a
                    href="/policies/producer-agreement"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:text-primary-light"
                  >
                    Συμφωνία Συνεργασίας Παραγωγού
                  </a>{' '}
                  <span className="text-red-500">*</span>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              data-testid="onboarding-submit"
              className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary-light transition-colors font-medium disabled:bg-neutral-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Υποβολή...' : 'Υποβολή Αίτησης'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
