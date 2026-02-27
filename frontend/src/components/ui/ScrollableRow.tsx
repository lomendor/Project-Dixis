'use client';

import { useRef, useState, useEffect, useCallback, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollableRowProps {
  children: ReactNode;
  className?: string;
  /** Extra classes on the scroll track (the flex container) */
  trackClassName?: string;
}

/**
 * ScrollableRow — Horizontal scroll container with elegant arrow buttons
 *
 * Features:
 * - Left/right arrow buttons appear on desktop (hover)
 * - Arrows auto-hide when at start/end
 * - Smooth scroll animation
 * - Touch-friendly on mobile (no arrows)
 * - Gradient fade hints on edges
 */
export default function ScrollableRow({
  children,
  className = '',
  trackClassName = '',
}: ScrollableRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;

    checkScroll();

    el.addEventListener('scroll', checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      ro.disconnect();
    };
  }, [checkScroll]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    // Scroll by ~80% of visible width for nice paging feel
    const amount = el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <div className={`group/scroll relative ${className}`}>
      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          aria-label="Scroll αριστερά"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm shadow-lg border border-neutral-200/60 flex items-center justify-center text-neutral-600 hover:text-primary hover:border-primary/30 hover:shadow-xl transition-all duration-300 hidden lg:flex opacity-0 group-hover/scroll:opacity-100"
        >
          <ChevronLeft className="size-5 shrink-0" />
        </button>
      )}

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          aria-label="Scroll δεξιά"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm shadow-lg border border-neutral-200/60 flex items-center justify-center text-neutral-600 hover:text-primary hover:border-primary/30 hover:shadow-xl transition-all duration-300 hidden lg:flex opacity-0 group-hover/scroll:opacity-100"
        >
          <ChevronRight className="size-5 shrink-0" />
        </button>
      )}

      {/* Left fade gradient */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-[5] pointer-events-none hidden lg:block" />
      )}

      {/* Right fade gradient */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-[5] pointer-events-none hidden lg:block" />
      )}

      {/* Scrollable track */}
      <div
        ref={scrollRef}
        className={`overflow-x-auto scrollbar-hide ${trackClassName}`}
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {children}
      </div>
    </div>
  );
}
