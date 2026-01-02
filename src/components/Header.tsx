'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl mx-4 mt-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/board" className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span>🏠</span>
            <span className="hidden sm:inline">Tarefas da Familia</span>
          </Link>
        </div>

        <nav className="flex items-center gap-2">
          <Link
            href="/board"
            className={`
              px-4 py-2 rounded-xl font-medium transition-all duration-200
              ${pathname === '/board'
                ? 'bg-purple-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            <span className="text-xl mr-1">📋</span>
            <span className="hidden sm:inline">Tarefas</span>
          </Link>

          <Link
            href="/pontuacao"
            className={`
              px-4 py-2 rounded-xl font-medium transition-all duration-200
              ${pathname === '/pontuacao'
                ? 'bg-purple-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            <span className="text-xl mr-1">🏆</span>
            <span className="hidden sm:inline">Placar</span>
          </Link>

          <Link
            href="/tarefas"
            className={`
              px-4 py-2 rounded-xl font-medium transition-all duration-200
              ${pathname === '/tarefas'
                ? 'bg-purple-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            <span className="text-xl mr-1">⚙️</span>
            <span className="hidden sm:inline">Gerenciar</span>
          </Link>

          <Link
            href="/calendario"
            className={`
              px-4 py-2 rounded-xl font-medium transition-all duration-200
              ${pathname === '/calendario'
                ? 'bg-purple-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            <span className="text-xl mr-1">📅</span>
            <span className="hidden sm:inline">Calendario</span>
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="p-2 rounded-xl text-gray-500 hover:bg-red-100 hover:text-red-500 transition-colors"
          title="Sair"
        >
          <span className="text-xl">🚪</span>
        </button>
      </div>
    </header>
  );
}
