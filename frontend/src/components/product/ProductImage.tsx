import { FC } from 'react';
import Image from 'next/image';
import { useImageTimeout } from '@/hooks/useImageTimeout';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  'data-testid'?: string;
}

const Skeleton: FC<{ className?: string }> = ({ className }) => (
  <div className={`bg-neutral-200 animate-pulse flex items-center justify-center ${className}`} data-testid="product-image-skeleton">
    <div className="w-8 h-8 bg-neutral-300 rounded animate-spin" />
  </div>
);

const ErrorState: FC<{ onRetry: () => void; retryCount: number; className?: string; testId?: string }> = ({
  onRetry, retryCount, className, testId
}) => (
  <div className={`bg-neutral-100 flex flex-col items-center justify-center ${className}`} data-testid={testId}>
    <svg className="w-10 h-10 text-neutral-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
    <p className="text-xs text-neutral-500 mb-2">Σφάλμα φόρτωσης</p>
    {retryCount < 2 && (
      <button onClick={onRetry} className="px-2 py-1 text-xs bg-neutral-200 hover:bg-neutral-300 rounded transition-colors" data-testid="product-image-retry-btn">
        Ξαναδοκίμασε ({2 - retryCount})
      </button>
    )}
  </div>
);

const ProductImage: FC<ProductImageProps> = ({
  src, alt, className = "h-48", priority = false, 'data-testid': testId
}) => {
  const { state, retry, retryCount } = useImageTimeout(src || '/placeholder.jpg');
  const getTestId = (suffix: string) => testId ? `${testId}-${suffix}` : `product-image-${suffix}`;

  if (state === 'loading') return <Skeleton className={className} />;

  if (state === 'error' || state === 'timeout') {
    return <ErrorState onRetry={retry} retryCount={retryCount} className={className} testId={getTestId(state)} />;
  }

  return (
    <div className={`relative ${className}`} data-testid={getTestId('success')}>
      <Image
        src={src || '/placeholder.jpg'}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        priority={priority}
      />
    </div>
  );
};

export default ProductImage;
