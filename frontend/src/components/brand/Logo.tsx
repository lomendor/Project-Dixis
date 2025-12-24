'use client';
import * as React from 'react';

type Props = { className?: string; height?: number; title?: string };

export default function Logo({ className, height = 40, title = "Dixis" }: Props) {
  const [hasImg, setHasImg] = React.useState(true);
  const src = '/logo.png'; // Dixis icon (512x512, optimized)

  return (
    <div
      data-testid="logo"
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center' }}
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
    </div>
  );
}
