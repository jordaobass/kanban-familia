'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { ScoreBoard } from '@/components/ScoreBoard';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function PontuacaoPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-4">
      <Header />
      <main className="flex-1 p-4">
        <ScoreBoard />
      </main>
    </div>
  );
}
