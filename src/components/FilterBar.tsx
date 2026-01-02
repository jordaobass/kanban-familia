'use client';

import { TaskCategory, ProfileName, PROFILES } from '@/types';

interface FilterBarProps {
  filter: TaskCategory | 'all';
  setFilter: (filter: TaskCategory | 'all') => void;
  personFilter: ProfileName | 'all';
  setPersonFilter: (filter: ProfileName | 'all') => void;
  onCreateTask: () => void;
}

export function FilterBar({ filter, setFilter, personFilter, setPersonFilter, onCreateTask }: FilterBarProps) {
  const categoryFilters: { value: TaskCategory | 'all'; label: string; emoji: string }[] = [
    { value: 'all', label: 'Todos', emoji: '👨‍👩‍👧‍👦' },
    { value: 'adult', label: 'Adultos', emoji: '👨' },
    { value: 'child', label: 'Criancas', emoji: '🧒' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
      <div className="flex flex-wrap items-center gap-3">
        {/* Category Filter */}
        <div className="flex gap-2">
          {categoryFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200
                ${filter === f.value
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <span className="text-xl">{f.emoji}</span>
              <span className="hidden sm:inline">{f.label}</span>
            </button>
          ))}
        </div>

        {/* Person Filter */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400">|</span>
          <div className="flex gap-1">
            <button
              onClick={() => setPersonFilter('all')}
              className={`
                p-2 rounded-xl transition-all duration-200
                ${personFilter === 'all'
                  ? 'bg-purple-100 ring-2 ring-purple-500'
                  : 'bg-gray-100 hover:bg-gray-200'
                }
              `}
              title="Todas as pessoas"
            >
              <span className="text-lg">👥</span>
            </button>
            {PROFILES.map((profile) => (
              <button
                key={profile.name}
                onClick={() => setPersonFilter(profile.name)}
                className={`
                  p-2 rounded-xl transition-all duration-200
                  ${personFilter === profile.name
                    ? 'ring-2 scale-110'
                    : 'hover:bg-gray-200'
                  }
                `}
                style={{
                  backgroundColor: personFilter === profile.name ? profile.bgColor : undefined,
                  ['--tw-ring-color' as string]: personFilter === profile.name ? profile.color : undefined,
                }}
                title={profile.name}
              >
                <span className="text-lg">{profile.emoji}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onCreateTask}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <span className="text-2xl">+</span>
        <span className="hidden sm:inline">Nova Tarefa</span>
      </button>
    </div>
  );
}
