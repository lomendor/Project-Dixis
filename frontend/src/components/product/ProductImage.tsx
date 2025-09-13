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
  <div className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`} data-testid="product-image-skeleton">
    <div className="w-8 h-8 bg-gray-300 rounded animate-spin" />
  </div>
);

const ErrorState: FC<{ onRetry: () => void; retryCount: number; className?: string; testId?: string }> = ({ 
  onRetry, retryCount, className, testId 
}) => (
  <div className={`bg-gray-100 flex flex-col items-center justify-center ${className}`} data-testid={testId}>
    <div className="w-12 h-12 text-gray-400 mb-2">⚠️</div>
    <p className="text-xs text-gray-500 mb-2">Failed to load</p>
    {retryCount < 2 && (
      <button onClick={onRetry} className="px-2 py-1 text-xs bg-gray-200 rounded" data-testid="product-image-retry-btn">
        Retry ({2 - retryCount} left)
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