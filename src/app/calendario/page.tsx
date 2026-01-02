'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { FamilyCalendar } from '@/components/FamilyCalendar';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function CalendarioPage() {
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
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📅 Calendario da Familia
          </h1>
          <p className="text-gray-600">Organize os eventos e compromissos</p>
        </div>
        <FamilyCalendar />
      </main>
    </div>
  );
}
