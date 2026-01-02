'use client';

import { useRouter } from 'next/navigation';
import { useProfile } from '@/contexts/ProfileContext';
import { PROFILES, ProfileName } from '@/types';

export function ProfileSelector() {
  const router = useRouter();
  const { selectProfile } = useProfile();

  const handleSelect = (name: ProfileName) => {
    selectProfile(name);
    router.push('/board');
  };

  return (
    <div className="grid grid-cols-2 gap-6 p-4 max-w-md mx-auto">
      {PROFILES.map((profile) => (
        <button
          key={profile.name}
          onClick={() => handleSelect(profile.name)}
          className="flex flex-col items-center justify-center p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          style={{ backgroundColor: profile.bgColor }}
        >
          <span className="text-7xl mb-4 animate-bounce">{profile.emoji}</span>
          <span
            className="text-2xl font-bold"
            style={{ color: profile.color }}
          >
            {profile.name}
          </span>
          {profile.isChild && (
            <span className="mt-2 text-sm px-3 py-1 rounded-full bg-white/50 text-gray-600">
              Crianca
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
