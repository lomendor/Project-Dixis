"use client";
import { useState } from "react";

export default function ContactPage() {
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState("sending");
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setState(res.ok ? "ok" : "error");
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Επικοινωνία</h1>
          <p className="mt-2 text-sm text-gray-600">
            Έχετε ερωτήσεις ή σχόλια; Συμπληρώστε τη φόρμα και θα σας απαντήσουμε σύντομα.
          </p>
        </div>

        {state === "ok" && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
            <span className="font-medium">Ευχαριστούμε!</span> Θα επικοινωνήσουμε σύντομα.
          </div>
        )}
        {state === "error" && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
            <span className="font-medium">Κάτι πήγε στραβά.</span> Δοκιμάστε ξανά ή στείλτε email στο info@dixis.gr.
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">
                Ονοματεπώνυμο
              </label>
              <input
                id="contact-name"
                name="name"
                placeholder="π.χ. Μαρία Παπαδοπούλου"
                required
                minLength={2}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1">
                Μήνυμα
              </label>
              <textarea
                id="contact-message"
                name="message"
                placeholder="Πείτε μας πώς μπορούμε να βοηθήσουμε..."
                required
                minLength={10}
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-y"
              />
            </div>

            {/* Honeypot for bots */}
            <input name="hp" className="hidden" tabIndex={-1} autoComplete="off" />

            <button
              type="submit"
              disabled={state === "sending"}
              className="w-full rounded-lg bg-green-700 hover:bg-green-800 text-white font-medium px-6 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state === "sending" ? "Αποστολή..." : "Αποστολή"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
