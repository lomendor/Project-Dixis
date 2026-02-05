'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

function AdminLoginContent() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/admin';

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Παρακαλώ εισάγετε τον αριθμό κινητού');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Αποτυχία αποστολής κωδικού');
        return;
      }

      // Dev mode: show bypass code
      if (data.devCode) {
        setDevCode(data.devCode);
      }

      setStep('otp');
    } catch {
      setError('Σφάλμα δικτύου. Δοκιμάστε ξανά.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!otp.trim() || otp.length !== 6) {
      setError('Παρακαλώ εισάγετε έγκυρο 6ψήφιο κωδικό');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), code: otp.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Αποτυχία επαλήθευσης');
        return;
      }

      // Success - redirect to admin
      router.push(from);
    } catch {
      setError('Σφάλμα δικτύου. Δοκιμάστε ξανά.');
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    setStep('phone');
    setOtp('');
    setError(null);
    setDevCode(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold text-green-600">
            Dixis
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Είσοδος Διαχειριστή
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Χρησιμοποιήστε το κινητό σας για να συνδεθείτε
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6" role="alert">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {devCode && (
            <div className="rounded-md bg-yellow-50 p-4 mb-6">
              <div className="text-sm text-yellow-800">
                Dev Mode - OTP: <code className="font-mono font-bold">{devCode}</code>
              </div>
            </div>
          )}

          {step === 'phone' ? (
            <form className="space-y-6" onSubmit={handleRequestOtp}>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Αριθμός Κινητού
                </label>
                <div className="mt-1">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="+30 69X XXX XXXX"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Εισάγετε τον αριθμό που έχει εγκριθεί για διαχείριση
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading && <LoadingSpinner />}
                {loading ? 'Αποστολή...' : 'Αποστολή Κωδικού'}
              </button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Κωδικός Επαλήθευσης
                </label>
                <div className="mt-1">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoComplete="one-time-code"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 text-center text-2xl tracking-[0.5em] font-mono"
                    placeholder="000000"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Εισάγετε τον 6ψήφιο κωδικό που λάβατε
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading && <LoadingSpinner />}
                {loading ? 'Επαλήθευση...' : 'Επαλήθευση'}
              </button>

              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="w-full text-sm text-gray-600 hover:text-green-600"
              >
                ← Αλλαγή αριθμού
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <Link href="/auth/login" className="text-sm text-gray-600 hover:text-green-600">
                Είσοδος με email/κωδικό
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><LoadingSpinner /></div>}>
      <AdminLoginContent />
    </Suspense>
  );
}
