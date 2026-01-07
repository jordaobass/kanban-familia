'use client';

import { useState } from 'react';
import { PROFILES, ProfileName } from '@/types';

interface CompletedByModalProps {
  isOpen: boolean;
  taskTitle: string;
  onSelect: (profile: ProfileName) => Promise<void>;
  onCancel: () => void;
}

export function CompletedByModal({ isOpen, taskTitle, onSelect, onCancel }: CompletedByModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<ProfileName | null>(null);

  if (!isOpen) return null;

  const handleSelect = async (profile: ProfileName) => {
    if (loading) return; // Prevent double clicks

    setLoading(true);
    setSelectedProfile(profile);

    try {
      await onSelect(profile);
    } catch (error) {
      console.error('Error completing task:', error);
      setLoading(false);
      setSelectedProfile(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-bounce-in">
        <h2 className="text-xl font-bold text-center text-gray-800 mb-2">
          {loading ? 'Registrando...' : 'Quem completou?'}
        </h2>
        <p className="text-center text-gray-500 mb-6 truncate">
          {taskTitle}
        </p>

        {loading ? (
          <div className="flex flex-col items-center py-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse flex items-center justify-center">
                <span className="text-4xl">{PROFILES.find(p => p.name === selectedProfile)?.emoji}</span>
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-purple-300 border-t-purple-600 animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">
              Salvando ponto para {selectedProfile}...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {PROFILES.map((profile) => (
              <button
                key={profile.name}
                onClick={() => handleSelect(profile.name)}
                disabled={loading}
                className="flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: profile.bgColor }}
              >
                <span className="text-5xl mb-2">{profile.emoji}</span>
                <span className="font-bold" style={{ color: profile.color }}>
                  {profile.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {!loading && (
          <button
            onClick={onCancel}
            className="w-full mt-4 py-3 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
