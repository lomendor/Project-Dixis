'use client';

import { useState } from 'react';

/* ── Expandable Description ──────────────────────────── */
export function ExpandableDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  // Only truncate if text is long enough to warrant it (~200 chars ≈ 3 lines)
  const shouldTruncate = text.length > 200;

  return (
    <div className="border-l-[3px] border-primary/25 pl-5 py-1">
      <p
        className={`text-base sm:text-lg text-neutral-600 leading-relaxed italic ${
          !expanded && shouldTruncate ? 'line-clamp-3' : ''
        }`}
      >
        {text}
      </p>
      {shouldTruncate && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {expanded ? 'Λιγότερα' : 'Περισσότερα...'}
        </button>
      )}
    </div>
  );
}

/* ── CTA Scroll to Products ──────────────────────────── */
export function ScrollToProductsCTA({ count }: { count: number }) {
  const handleScroll = () => {
    const el = document.getElementById('producer-products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <button
      onClick={handleScroll}
      className="mt-8 inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98]"
    >
      Δείτε {count === 1 ? 'το προϊόν' : `τα ${count} προϊόντα`}
      <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </button>
  );
}
