import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  count?: number;
}

export default function StarRating({ rating, max = 5, size = 'sm', showCount, count }: StarRatingProps) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < Math.floor(rating);
          const partial = !filled && i < rating;
          return (
            <div key={i} className="relative">
              <Star
                className={`${sizes[size]} text-beige-dark fill-beige-dark`}
              />
              {(filled || partial) && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: filled ? '100%' : `${(rating % 1) * 100}%` }}
                >
                  <Star className={`${sizes[size]} text-amber-400 fill-amber-400`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showCount && count !== undefined && (
        <span className="text-xs text-charcoal/50 font-sans ml-1">({count})</span>
      )}
    </div>
  );
}
