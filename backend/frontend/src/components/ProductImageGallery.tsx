import { useState } from 'react';
import { ProductImage } from '@/lib/api';

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
  className?: string;
}

export default function ProductImageGallery({ images, productName, className = '' }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageError, setImageError] = useState<Set<number>>(new Set());
  const [imageLoading, setImageLoading] = useState<Set<number>>(new Set());

  const handleImageError = (index: number) => {
    setImageError(prev => new Set([...prev, index]));
  };

  const handleImageLoad = (index: number) => {
    setImageLoading(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const handleImageLoadStart = (index: number) => {
    setImageLoading(prev => new Set([...prev, index]));
  };

  const getImageUrl = (image: ProductImage) => {
    return image.url || image.image_path || '';
  };

  const getImageAlt = (image: ProductImage, index: number) => {
    return image.alt_text || `${productName} - Image ${index + 1}`;
  };

  // No images state
  if (!images || images.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
          <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium">No Images Available</span>
          <span className="text-xs">Product images will appear here</span>
        </div>
      </div>
    );
  }

  const validImages = images.filter((_, index) => !imageError.has(index));
  const currentImage = validImages[selectedImage] || validImages[0];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Image */}
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
        {currentImage && !imageError.has(images.indexOf(currentImage)) ? (
          <>
            {imageLoading.has(images.indexOf(currentImage)) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            )}
            <img
              src={getImageUrl(currentImage)}
              alt={getImageAlt(currentImage, images.indexOf(currentImage))}
              className="w-full h-full object-cover"
              onLoad={() => handleImageLoad(images.indexOf(currentImage))}
              onLoadStart={() => handleImageLoadStart(images.indexOf(currentImage))}
              onError={() => handleImageError(images.indexOf(currentImage))}
              loading="eager"
            />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">Image unavailable</span>
          </div>
        )}
      </div>
      
      {/* Thumbnail Images */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 4).map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedImage(index)}
              className={`aspect-square bg-gray-100 rounded overflow-hidden border-2 transition-all ${
                selectedImage === index 
                  ? 'border-green-500 ring-2 ring-green-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              disabled={imageError.has(index)}
            >
              {!imageError.has(index) && getImageUrl(image) ? (
                <img
                  src={getImageUrl(image)}
                  alt={getImageAlt(image, index)}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(index)}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
            </button>
          ))}
          
          {/* More images indicator */}
          {images.length > 4 && (
            <div className="aspect-square bg-gray-100 rounded overflow-hidden border-2 border-gray-200 flex items-center justify-center">
              <span className="text-sm text-gray-500 font-medium">
                +{images.length - 4}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}