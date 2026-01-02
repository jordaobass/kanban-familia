'use client';

import { PROFILES, ProfileName } from '@/types';

interface CompletedByModalProps {
  isOpen: boolean;
  taskTitle: string;
  onSelect: (profile: ProfileName) => void;
  onCancel: () => void;
}

export function CompletedByModal({ isOpen, taskTitle, onSelect, onCancel }: CompletedByModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-bounce-in">
        <h2 className="text-xl font-bold text-center text-gray-800 mb-2">
          Quem completou?
        </h2>
        <p className="text-center text-gray-500 mb-6 truncate">
          {taskTitle}
        </p>

        <div className="grid grid-cols-2 gap-4">
          {PROFILES.map((profile) => (
            <button
              key={profile.name}
              onClick={() => onSelect(profile.name)}
              className="flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ backgroundColor: profile.bgColor }}
            >
              <span className="text-5xl mb-2">{profile.emoji}</span>
              <span className="font-bold" style={{ color: profile.color }}>
                {profile.name}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="w-full mt-4 py-3 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
