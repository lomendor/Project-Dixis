'use client';
import * as React from 'react';

type Props = { className?: string; height?: number; title?: string };

export default function Logo({ className, height = 22, title = "Dixis" }: Props) {
  const [hasImg, setHasImg] = React.useState(true);
  const src = '/logo.png'; // Dixis logo (clean transparent)

  return (
    <div
      data-testid="logo"
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
    >
      {hasImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={title}
          height={height}
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
