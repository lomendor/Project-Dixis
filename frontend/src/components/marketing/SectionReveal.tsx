'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * SectionReveal — Scroll-triggered fade-in-up animation wrapper
 *
 * Uses Intersection Observer to add .visible class when element enters viewport.
 * Pairs with .section-reveal CSS class in globals.css.
 * Respects prefers-reduced-motion.
 */
export default function SectionReveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      el.classList.add('visible');
      return undefined;
    }

    if (delay > 0) {
      el.style.transitionDelay = `${delay}ms`;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`section-reveal ${className}`}>
      {children}
    </div>
  );
}
