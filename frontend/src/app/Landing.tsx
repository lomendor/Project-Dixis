'use client';

import { useState } from 'react';

/**
 * Landing Page για το Dixis (EL-first)
 *
 * Χρησιμοποιείται όταν LANDING_MODE=true για soft launch.
 * Περιλαμβάνει hero section, value propositions, και φόρμα waitlist.
 */
export default function LandingPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'buyer' as 'buyer' | 'producer',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Αποτυχία καταχώρησης');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Παρουσιάστηκε σφάλμα');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-pale to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6" data-testid="landing-hero">
            Αυθεντικά Ελληνικά Προϊόντα από Έλληνες παραγωγούς
          </h1>
          <p className="text-xl md:text-2xl text-neutral-700 mb-8">
            Η νέα πλατφόρμα που συνδέει παραγωγούς με καταναλωτές για αυθεντικά,
            παραδοσιακά προϊόντα απευθείας στην πόρτα σας.
          </p>
          <div className="inline-block bg-primary-pale text-primary-dark px-6 py-3 rounded-full font-semibold">
            🚀 Σύντομα διαθέσιμο
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🌱</div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">
              Ποιότητα & Ιχνηλασιμότητα
            </h3>
            <p className="text-neutral-600">
              Γνωρίστε τον παραγωγό πίσω από κάθε προϊόν.
              Αυθεντικά, παραδοσιακά ελληνικά προϊόντα με πιστοποίηση.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">
              Δίκαιες Τιμές
            </h3>
            <p className="text-neutral-600">
              Καλύτερες τιμές για παραγωγούς, οικονομικές τιμές για καταναλωτές.
              Χωρίς μεσάζοντες.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🚚</div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">
              Γρήγορη Παράδοση
            </h3>
            <p className="text-neutral-600">
              Παραδόσεις εντός 24-48 ωρών.
              Τα προϊόντα έρχονται απευθείας από τον παραγωγό στην πόρτα σας.
            </p>
          </div>
        </div>
      </section>

      {/* Audience Sections */}
      <section className="bg-neutral-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Για Παραγωγούς */}
            <div className="bg-white p-4 sm:p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4">
                Είσαι παραγωγός;
              </h2>
              <ul className="space-y-3 text-neutral-700 mb-6">
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Πούλα απευθείας στους καταναλωτές</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Χωρίς προμήθειες από μεσάζοντες</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Δωρεάν εγγραφή και προβολή</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Διαχείριση παραγγελιών online</span>
                </li>
              </ul>
            </div>

            {/* Για Αγοραστές */}
            <div className="bg-white p-4 sm:p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4">
                Είσαι αγοραστής;
              </h2>
              <ul className="space-y-3 text-neutral-700 mb-6">
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Αυθεντικά προϊόντα απευθείας στην πόρτα σου</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Γνώρισε τους παραγωγούς σου</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Καλύτερες τιμές χωρίς μεσάζοντες</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Παραδοσιακά και χειροποίητα προϊόντα</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Form */}
      <section id="waitlist" className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white p-4 sm:p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4 text-center" data-testid="waitlist-heading">
            Εκδήλωση Ενδιαφέροντος
          </h2>
          <p className="text-neutral-600 mb-8 text-center">
            Γίνε από τους πρώτους που θα ενημερωθούν για την επίσημη έναρξη!
          </p>

          {submitted ? (
            <div className="bg-primary-pale border border-primary/20 text-primary-dark px-6 py-4 rounded-lg text-center">
              <div className="text-4xl mb-2">✓</div>
              <p className="font-semibold">Ευχαριστούμε!</p>
              <p className="text-sm mt-2">Θα επικοινωνήσουμε μαζί σας σύντομα.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                  Ονοματεπώνυμο *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                  placeholder="π.χ. Γιάννης Παπαδόπουλος"
                  data-testid="waitlist-name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                  placeholder="email@example.com"
                  data-testid="waitlist-email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  Ενδιαφέρομαι ως:
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center flex-1 p-4 border-2 border-neutral-300 rounded-lg cursor-pointer hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary-pale">
                    <input
                      type="radio"
                      name="role"
                      value="buyer"
                      checked={formData.role === 'buyer'}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'buyer' | 'producer' })}
                      className="mr-3"
                      data-testid="waitlist-role-buyer"
                    />
                    <span className="font-medium">Αγοραστής</span>
                  </label>
                  <label className="flex items-center flex-1 p-4 border-2 border-neutral-300 rounded-lg cursor-pointer hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary-pale">
                    <input
                      type="radio"
                      name="role"
                      value="producer"
                      checked={formData.role === 'producer'}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'buyer' | 'producer' })}
                      className="mr-3"
                      data-testid="waitlist-role-producer"
                    />
                    <span className="font-medium">Παραγωγός</span>
                  </label>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-accent-gold hover:bg-accent-gold/90 disabled:bg-neutral-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                data-testid="waitlist-submit"
              >
                {submitting ? 'Αποστολή...' : 'Εκδήλωση Ενδιαφέροντος'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-300 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Dixis. Όλα τα δικαιώματα κατοχυρωμένα.</p>
          <p className="text-sm mt-2">Συνδέοντας Έλληνες παραγωγούς με καταναλωτές.</p>
        </div>
      </footer>
    </div>
  );
}
