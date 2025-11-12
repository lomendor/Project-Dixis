export default function CTA() {
  return (
    <section className="mt-10 rounded-xl border bg-gradient-to-r from-white to-neutral-50">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Είσαι παραγωγός;</h2>
          <p className="text-sm text-neutral-600 mt-1">Κάνε τα προϊόντα σου διαθέσιμα σε όλη την Ελλάδα.</p>
        </div>
        <a href="/producer/onboarding" className="inline-flex h-10 px-4 items-center rounded-md bg-brand text-white text-sm hover:bg-brand/90 transition">
          Γίνε συνεργάτης
        </a>
      </div>
    </section>
  );
}
