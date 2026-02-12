import React from 'react';

type Props = { className?: string; style?: React.CSSProperties };
export default function Skeleton({ className = '', style }: Props) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-gray-200 rounded-md ${className}`}
      style={{ height: 12, ...style }}
      data-testid="skeleton"
    />
  );
}
