'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { ProfileSelector } from '@/components/ProfileSelector';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function SelectProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { currentProfile } = useProfile();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (currentProfile) {
      router.push('/board');
    }
  }, [currentProfile, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Quem esta jogando?
        </h1>
        <p className="text-gray-600">
          Escolha seu perfil para comecar
        </p>
      </div>

      <ProfileSelector />

      <button
        onClick={logout}
        className="mt-8 px-6 py-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-2"
      >
        <span>🚪</span>
        Sair
      </button>
    </main>
  );
}
