'use client';

import { Howl } from 'howler';

let coinSound: Howl | null = null;
let audioContext: AudioContext | null = null;

export const initSounds = () => {
  if (typeof window !== 'undefined' && !coinSound) {
    // Try to load the mp3 file first
    coinSound = new Howl({
      src: ['/sounds/coin.mp3'],
      volume: 0.5,
      onloaderror: () => {
        // If mp3 fails, we'll use Web Audio API fallback
        coinSound = null;
      },
    });
  }
};

// Web Audio API fallback for coin sound (Mario-style)
const playWebAudioCoin = () => {
  if (typeof window === 'undefined') return;

  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }

  const now = audioContext.currentTime;

  // Create oscillator for the coin sound
  const oscillator1 = audioContext.createOscillator();
  const oscillator2 = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  // Connect nodes
  oscillator1.connect(gainNode);
  oscillator2.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // First tone (B5)
  oscillator1.type = 'square';
  oscillator1.frequency.setValueAtTime(988, now);
  oscillator1.frequency.setValueAtTime(1319, now + 0.08); // E6

  // Second tone (E6)
  oscillator2.type = 'square';
  oscillator2.frequency.setValueAtTime(1319, now + 0.08);

  // Gain envelope
  gainNode.gain.setValueAtTime(0.3, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

  // Start and stop
  oscillator1.start(now);
  oscillator1.stop(now + 0.1);
  oscillator2.start(now + 0.08);
  oscillator2.stop(now + 0.2);
};

export const playCoinSound = () => {
  if (coinSound) {
    coinSound.play();
  } else {
    playWebAudioCoin();
  }
};
