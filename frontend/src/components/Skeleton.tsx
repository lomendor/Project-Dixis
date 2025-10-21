import React from 'react';

type Props = { className?: string; style?: React.CSSProperties };
export default function Skeleton({ className, style }: Props) {
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        background: 'linear-gradient(90deg, #eee 25%, #f5f5f5 37%, #eee 63%)',
        backgroundSize: '400% 100%',
        animation: 'skeleton-shimmer 1.2s linear infinite',
        borderRadius: 6,
        height: 12,
        ...style,
      }}
      data-testid="skeleton"
    />
  );
}
