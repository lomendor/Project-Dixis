'use client';
import * as React from 'react';

type Props = {
  className?: string;
  height?: number;
  title?: string;
  /** Show "DIXIS" wordmark next to icon */
  showWordmark?: boolean;
  /** Light mode — white wordmark for dark/transparent backgrounds */
  light?: boolean;
};

/**
 * Logo — Brand icon + optional serif wordmark
 *
 * Premium redesign: icon + "DIXIS" in Noto Serif Display
 * for editorial feel. Wordmark hidden on mobile by default.
 */
export default function Logo({
  className,
  height = 40,
  title = "Dixis",
  showWordmark = false,
  light = false,
}: Props) {
  const [hasImg, setHasImg] = React.useState(true);
  const src = '/logo.png'; // Dixis icon (512x512, optimized)

  return (
    <div
      data-testid="logo"
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: showWordmark ? height * 0.25 : 0 }}
    >
      {hasImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`${title} logo`}
          width={height}
          height={height}
          style={{
            objectFit: 'contain',
            display: 'block'
          }}
          onError={() => setHasImg(false)}
        />
      ) : (
        <div
          style={{
            height,
            display: 'inline-flex',
            alignItems: 'center',
            fontWeight: 600,
            fontSize: height * 0.7,
            color: 'var(--brand-primary)'
          }}
        >
          {title}
        </div>
      )}
      {showWordmark && hasImg && (
        <span
          style={{
            fontFamily: 'var(--font-logo), Nunito, sans-serif',
            fontSize: height * 0.50,
            fontWeight: 900,
            letterSpacing: '0.04em',
            color: light ? '#ffffff' : '#000000',
            transition: 'color 0.3s',
          }}
        >
          DIXIS
        </span>
      )}
    </div>
  );
}
