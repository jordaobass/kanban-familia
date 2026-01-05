'use client';

import { useState } from 'react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-lg',
  lg: 'w-16 h-16 text-2xl',
  xl: 'w-24 h-24 text-4xl',
};

export function Avatar({ src, alt, fallback, size = 'md', className = '' }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const showFallback = !src || imageError;

  return (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-full overflow-hidden
        bg-gradient-to-br from-purple-400 to-pink-400
        flex items-center justify-center
        text-white font-bold
        ring-2 ring-white shadow-lg
        ${className}
      `}
    >
      {showFallback ? (
        <span>{fallback || '?'}</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt || 'Avatar'}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
}

// Placeholder images for family members (using UI Avatars API)
export const PLACEHOLDER_AVATARS = {
  Prin: 'https://ui-avatars.com/api/?name=Prin&background=EC4899&color=fff&size=200',
  Jon: 'https://ui-avatars.com/api/?name=Jon&background=3B82F6&color=fff&size=200',
  Benicio: 'https://ui-avatars.com/api/?name=Benicio&background=10B981&color=fff&size=200',
  Louise: 'https://ui-avatars.com/api/?name=Louise&background=F59E0B&color=fff&size=200',
};
