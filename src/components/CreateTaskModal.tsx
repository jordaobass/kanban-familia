'use client';

import { useState } from 'react';
import { TaskFormData, TaskCategory, RecurrenceType, TimeOfDay, TASK_EMOJIS, WEEKDAYS, TIME_OF_DAY } from '@/types';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { Avatar } from './ui/Avatar';
import { LoadingSpinner } from './LoadingSpinner';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
}

export function CreateTaskModal({ isOpen, onClose, onSubmit }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState(TASK_EMOJIS[0]);
  const [category, setCategory] = useState<TaskCategory>('child');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('daily');
  const [dayOfWeek, setDayOfWeek] = useState(1); // Monday
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const { members, loading: loadingMembers, getAvatarUrl, getMemberBgColor, getMemberEmoji } = useFamilyMembers();

  const toggleMember = (name: string) => {
    setSelectedMembers(prev =>
      prev.includes(name)
        ? prev.filter(p => p !== name)
        : [...prev, name]
    );
  };

  const selectAllMembers = () => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(members.map(m => m.name));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (selectedMembers.length === 0) {
      alert('Selecione pelo menos uma pessoa!');
      return;
    }

    setLoading(true);
    try {
      // Cast selectedMembers to the expected type for TaskFormData
      await onSubmit({
        title: title.trim(),
        emoji,
        category,
        assignedTo: selectedMembers as TaskFormData['assignedTo'],
        recurrence: {
          type: recurrenceType,
          ...(recurrenceType === 'weekly' ? { dayOfWeek } : {}),
        },
        timeOfDay,
      });
      // Reset form
      setTitle('');
      setEmoji(TASK_EMOJIS[0]);
      setCategory('child');
      setSelectedMembers([]);
      setRecurrenceType('daily');
      setDayOfWeek(1);
      setTimeOfDay(undefined);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const allSelected = members.length > 0 && selectedMembers.length === members.length;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span>✨</span> Nova Tarefa
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Emoji Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Escolha um emoji
            </label>
            <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto">
              {TASK_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`
                    text-3xl p-2 rounded-xl transition-all duration-200
                    ${emoji === e ? 'bg-purple-100 scale-110 shadow-lg' : 'hover:bg-gray-100'}
                  `}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da tarefa
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Escovar os dentes"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-lg"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCategory('child')}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2
                  ${category === 'child'
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <span className="text-2xl">🧒</span>
                <span className="font-medium">Crianca</span>
              </button>
              <button
                type="button"
                onClick={() => setCategory('adult')}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2
                  ${category === 'adult'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <span className="text-2xl">👨</span>
                <span className="font-medium">Adulto</span>
              </button>
            </div>
          </div>

          {/* Assigned To - Multiple Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Atribuir para (selecione um ou mais)
            </label>
            {loadingMembers ? (
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner />
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-4 bg-gray-50 rounded-xl">
                <span className="text-3xl block mb-2">👨‍👩‍👧‍👦</span>
                <p className="text-gray-600">Nenhum membro cadastrado.</p>
                <p className="text-sm text-gray-500">Cadastre membros em Família.</p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={selectAllMembers}
                    className={`
                      p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center
                      ${allSelected
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <span className="text-2xl">👨‍👩‍👧‍👦</span>
                    <span className="text-xs mt-1">Todos</span>
                  </button>
                  {members.map((member) => {
                    const isSelected = selectedMembers.includes(member.name);
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => toggleMember(member.name)}
                        className={`
                          p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center relative
                          ${isSelected ? 'scale-105' : 'hover:border-gray-300'}
                        `}
                        style={{
                          borderColor: isSelected ? member.color : undefined,
                          backgroundColor: isSelected ? getMemberBgColor(member) : undefined,
                        }}
                      >
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                            ✓
                          </span>
                        )}
                        <Avatar
                          src={getAvatarUrl(member)}
                          alt={member.name}
                          fallback={getMemberEmoji(member)}
                          size="md"
                        />
                        <span className="text-xs mt-1">{member.name}</span>
                      </button>
                    );
                  })}
                </div>
                {selectedMembers.length > 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    {selectedMembers.length} pessoa(s) selecionada(s) - sera criada 1 tarefa para cada
                  </p>
                )}
              </>
            )}
          </div>

          {/* Recurrence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recorrencia
            </label>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <button
                type="button"
                onClick={() => setRecurrenceType('none')}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2
                  ${recurrenceType === 'none'
                    ? 'border-gray-500 bg-gray-50 text-gray-700'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <span className="text-2xl">1️⃣</span>
                <span className="font-medium text-sm">Unica</span>
              </button>
              <button
                type="button"
                onClick={() => setRecurrenceType('daily')}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2
                  ${recurrenceType === 'daily'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <span className="text-2xl">📅</span>
                <span className="font-medium text-sm">Diaria</span>
              </button>
              <button
                type="button"
                onClick={() => setRecurrenceType('weekly')}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2
                  ${recurrenceType === 'weekly'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <span className="text-2xl">🗓️</span>
                <span className="font-medium text-sm">Semanal</span>
              </button>
            </div>

            {recurrenceType === 'weekly' && (
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-lg"
              >
                {WEEKDAYS.map((day, index) => (
                  <option key={index} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Time of Day */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Periodo do dia (opcional)
            </label>
            <div className="grid grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setTimeOfDay(undefined)}
                className={`
                  p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1
                  ${timeOfDay === undefined
                    ? 'border-gray-500 bg-gray-50 text-gray-700'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <span className="text-xl">⏰</span>
                <span className="font-medium text-xs">Qualquer</span>
              </button>
              {TIME_OF_DAY.map((tod) => (
                <button
                  key={tod.value}
                  type="button"
                  onClick={() => setTimeOfDay(tod.value)}
                  className={`
                    p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1
                    ${timeOfDay === tod.value
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <span className="text-xl">{tod.emoji}</span>
                  <span className="font-medium text-xs">{tod.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !title.trim() || selectedMembers.length === 0}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> Criando...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>✨</span> Criar {selectedMembers.length > 1 ? `${selectedMembers.length} Tarefas` : 'Tarefa'}
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
