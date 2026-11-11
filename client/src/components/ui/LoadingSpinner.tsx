import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} border-2 border-beige border-t-forest rounded-full animate-spin`}
      />
    </div>
  );
}

export default LoadingSpinner;

export function PageLoader() {
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-beige border-t-forest rounded-full animate-spin" />
        <p className="font-serif text-forest text-lg">Loading...</p>
      </div>
    </div>
  );
}
