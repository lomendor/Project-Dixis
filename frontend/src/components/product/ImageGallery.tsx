'use client';

import { useState } from 'react';
import Image from 'next/image';

type GalleryImage = {
  id: number;
  url: string;
  altText?: string | null;
  isPrimary?: boolean;
};

/**
 * Pass IMAGE-GALLERY-01: Multi-image gallery for product detail page.
 *
 * - Main image with aspect-square container
 * - Thumbnail strip below (scrollable on mobile)
 * - Click thumbnail to switch main image
 * - Falls back to single-image or placeholder when no images
 */
export default function ImageGallery({
  images,
  fallbackUrl,
  alt,
}: {
  images: GalleryImage[];
  fallbackUrl?: string | null;
  alt: string;
}) {
  // Build the list: use images array, or fallback to a single fallbackUrl
  const allImages: GalleryImage[] =
    images.length > 0
      ? images
      : fallbackUrl
        ? [{ id: 0, url: fallbackUrl, altText: alt, isPrimary: true }]
        : [];

  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = allImages[selectedIdx] || null;

  // No images at all — show placeholder
  if (allImages.length === 0) {
    return (
      <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100">
        <div className="w-full h-full flex items-center justify-center text-neutral-400">
          <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="image-gallery">
      {/* Main Image */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100">
        {selected && (
          <Image
            src={selected.url}
            alt={selected.altText || alt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            data-testid="product-image"
          />
        )}
      </div>

      {/* Thumbnail Strip — only shown when >1 image */}
      {allImages.length > 1 && (
        <div
          className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-thin"
          role="list"
          aria-label="Εικόνες προϊόντος"
          data-testid="image-gallery-thumbs"
        >
          {allImages.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              role="listitem"
              onClick={() => setSelectedIdx(idx)}
              className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all touch-manipulation ${
                idx === selectedIdx
                  ? 'border-primary ring-1 ring-primary/30'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
              aria-label={`Εικόνα ${idx + 1}`}
              aria-current={idx === selectedIdx ? 'true' : undefined}
            >
              <Image
                src={img.url}
                alt={img.altText || `${alt} - ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
