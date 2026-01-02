'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoginButton } from '@/components/LoginButton';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, error } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      router.push('/board');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-transparent bg-clip-text">
          Tarefas da Familia
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          Organize as tarefas de casa de forma divertida!
        </p>
        <div className="flex justify-center gap-4 text-5xl mt-6">
          <span className="animate-bounce" style={{ animationDelay: '0ms' }}>👩</span>
          <span className="animate-bounce" style={{ animationDelay: '100ms' }}>👨</span>
          <span className="animate-bounce" style={{ animationDelay: '200ms' }}>🧒</span>
          <span className="animate-bounce" style={{ animationDelay: '300ms' }}>👧</span>
        </div>
      </div>

      <LoginButton />

      {error && (
        <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-xl text-red-700 max-w-md text-center">
          <span className="text-2xl mr-2">⚠️</span>
          {error}
        </div>
      )}

      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>Somente emails autorizados podem acessar</p>
      </div>
    </main>
  );
}
