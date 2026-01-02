'use client';

import { useEffect, useState } from 'react';

const LOADING_EMOJIS = ['🏠', '🧹', '🍽️', '📚', '🎮', '🛏️', '🦷', '👕'];

export function LoadingSpinner() {
  const [currentEmoji, setCurrentEmoji] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEmoji((prev) => (prev + 1) % LOADING_EMOJIS.length);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-24 h-24 rounded-full border-4 border-purple-200 animate-pulse" />

        {/* Spinning ring */}
        <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />

        {/* Center emoji */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl animate-bounce">{LOADING_EMOJIS[currentEmoji]}</span>
        </div>
      </div>

      <p className="text-purple-600 font-medium animate-pulse">Carregando...</p>
    </div>
  );
}
