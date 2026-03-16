import Image from 'next/image';

const ICON_MAP: Record<string, { src: string; fallbackEmoji: string }> = {
  all: { src: '/icons/farming/all.png', fallbackEmoji: '🔲' },
  organic_certified: { src: '/icons/farming/organic.png', fallbackEmoji: '🌿' },
  organic_transitional: {
    src: '/icons/farming/transitional.png',
    fallbackEmoji: '🌱',
  },
  biodynamic: { src: '/icons/farming/biodynamic.png', fallbackEmoji: '✨' },
  traditional_natural: {
    src: '/icons/farming/traditional.png',
    fallbackEmoji: '🌾',
  },
  conventional: { src: '/icons/farming/conventional.png', fallbackEmoji: '🚜' },
};

interface FarmingMethodIconProps {
  method: string;
  size?: number;
  className?: string;
}

export function FarmingMethodIcon({
  method,
  size = 24,
  className,
}: FarmingMethodIconProps) {
  const icon = ICON_MAP[method];
  if (!icon) return null;

  return (
    <Image
      src={icon.src}
      alt=""
      width={size}
      height={size}
      className={className}
      unoptimized
    />
  );
}
