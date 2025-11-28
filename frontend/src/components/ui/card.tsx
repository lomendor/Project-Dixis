import * as React from 'react';
import { cn } from '../../lib/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  variant?: 'default' | 'flat' | 'outlined';
}

export function Card({ className, hover = true, variant = 'default', ...props }: CardProps) {
  // Mobile-first: p-4 default, md:p-6 for larger screens
  const variants = {
    default: 'bg-white rounded-md p-4 md:p-6 shadow-card',
    flat: 'bg-white rounded-md p-4 md:p-6 border border-neutral-200',
    outlined: 'bg-transparent rounded-md p-4 md:p-6 border border-neutral-300',
  };

  // Mobile-first: no transform on mobile (causes issues), only on md:
  const hoverStyles = hover
    ? 'transition-all duration-200 hover:shadow-card-hover md:hover:-translate-y-1 active:scale-[0.99]'
    : '';

  return (
    <div
      className={cn(variants[variant], hoverStyles, className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-3 md:mb-4', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'text-base md:text-lg font-semibold leading-tight tracking-tight text-neutral-900',
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-neutral-600 mt-1', className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mt-3 md:mt-4 pt-3 md:pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4', className)}
      {...props}
    />
  );
}

// Product Card - Mobile-first
export interface ProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  image?: string;
  title: string;
  producer?: string;
  price: string;
  badge?: string;
}

export function ProductCard({
  className,
  image,
  title,
  producer,
  price,
  badge,
  ...props
}: ProductCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-md overflow-hidden shadow-card transition-all duration-200 hover:shadow-card-hover md:hover:-translate-y-1 active:scale-[0.99] cursor-pointer touch-manipulation',
        className
      )}
      {...props}
    >
      {/* Mobile: square aspect, Desktop: 4/3 */}
      <div className="aspect-square sm:aspect-[4/3] bg-neutral-100 relative overflow-hidden">
        {image && (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
        {badge && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-primary-pale text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>
      {/* Mobile-first padding */}
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-neutral-900 mb-1 line-clamp-2 text-sm sm:text-base leading-snug">{title}</h3>
        {producer && (
          <p className="text-xs sm:text-sm text-neutral-600 mb-2 sm:mb-3">{producer}</p>
        )}
        <p className="text-lg sm:text-xl font-bold text-primary">{price}</p>
      </div>
    </div>
  );
}

// Category Card (Wolt-style) - Mobile-first
export interface CategoryCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  label: string;
  category?: 'vegetables' | 'fruits' | 'dairy' | 'meat' | 'bakery' | 'honey' | 'wine' | 'olive';
}

export function CategoryCard({
  className,
  icon,
  label,
  category = 'vegetables',
  ...props
}: CategoryCardProps) {
  const categoryColors = {
    vegetables: 'bg-category-vegetables',
    fruits: 'bg-category-fruits',
    dairy: 'bg-category-dairy',
    meat: 'bg-category-meat',
    bakery: 'bg-category-bakery',
    honey: 'bg-category-honey',
    wine: 'bg-category-wine',
    olive: 'bg-category-olive',
  };

  return (
    <div
      className={cn(
        // Mobile-first: smaller padding, touch-friendly
        'flex flex-col items-center justify-center p-4 sm:p-6 rounded-lg min-h-[100px] sm:min-h-[140px] cursor-pointer transition-all duration-200 md:hover:-translate-y-1 md:hover:scale-[1.02] hover:shadow-md active:scale-[0.98] touch-manipulation',
        categoryColors[category],
        className
      )}
      {...props}
    >
      <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{icon}</div>
      <span className="text-xs sm:text-sm font-semibold text-neutral-800 text-center leading-tight">{label}</span>
    </div>
  );
}
