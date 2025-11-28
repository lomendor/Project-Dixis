import { Button } from '@/components/ui/button';

export default function Hero(){
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10" aria-hidden>
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="leaf-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M30 10 Q40 20 30 30 Q20 20 30 10" fill="currentColor" className="text-white"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#leaf-pattern)" />
        </svg>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-sm text-white/90 mb-6">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Από τον παραγωγό στο τραπέζι σας</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Φρέσκα τοπικά προϊόντα,
          <br />
          <span className="text-amber-400">απευθείας από Έλληνες</span>
          <br />
          παραγωγούς
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-white/80 leading-relaxed">
          Ανακαλύψτε αυθεντικές γεύσεις και υποστηρίξτε τους τοπικούς μας παραγωγούς.
          Κάθε αγορά ενισχύει την ελληνική γη.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <a href="/products">
            <Button className="bg-white text-emerald-900 hover:bg-amber-50 font-semibold px-6 py-3 text-base shadow-lg hover:shadow-xl transition-all">
              Εξερεύνησε προϊόντα
            </Button>
          </a>
          <a href="/producers">
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-6 py-3 text-base backdrop-blur-sm">
              Γνώρισε τους παραγωγούς
            </Button>
          </a>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white">50+</div>
            <div className="text-sm text-white/70">Παραγωγοί</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white">200+</div>
            <div className="text-sm text-white/70">Προϊόντα</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white">100%</div>
            <div className="text-sm text-white/70">Ελληνικά</div>
          </div>
        </div>
      </div>
    </section>
  );
}
