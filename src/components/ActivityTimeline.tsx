'use client';

import { useState, useEffect } from 'react';
import { DailyActivity, FamilyMember, getWeekDates } from '@/types';
import { subscribeActivities } from '@/lib/firestore';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { Avatar } from './ui/Avatar';
import { LoadingSpinner } from './LoadingSpinner';

interface ActivityTimelineProps {
  isOpen: boolean;
  onClose: () => void;
  weekString: string;
}

const FUN_MESSAGES = [
  'Arrasou! 🔥',
  'Mandou bem! 💪',
  'Que crack! ⭐',
  'Show! 🎉',
  'Boa! 👏',
  'Incrivel! 🌟',
  'Top demais! 🏆',
  'Excelente! 💎',
];

const getRandomMessage = () => FUN_MESSAGES[Math.floor(Math.random() * FUN_MESSAGES.length)];

export function ActivityTimeline({ isOpen, onClose, weekString }: ActivityTimelineProps) {
  const { members, loading: loadingMembers, getAvatarUrl, getMemberBgColor, getMemberEmoji } = useFamilyMembers();
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [activities, setActivities] = useState<(DailyActivity & { profile: string })[]>([]);
  const [loading, setLoading] = useState(true);

  const weekDates = getWeekDates(weekString);

  // Auto-select first member when members load
  useEffect(() => {
    if (members.length > 0 && !selectedMember) {
      setSelectedMember(members[0]);
    }
  }, [members, selectedMember]);

  useEffect(() => {
    if (!isOpen || !selectedMember) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- Loading state before async subscription
    setLoading(true);

    // Calculate dates inside effect to avoid dependency issues
    const dates = getWeekDates(weekString);
    const startDate = dates.start.toISOString().split('T')[0];
    const endDate = dates.end.toISOString().split('T')[0];

    const unsubscribe = subscribeActivities(
      selectedMember.name,
      startDate,
      endDate,
      (fetchedActivities) => {
        setActivities(fetchedActivities);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen, selectedMember, weekString]);

  if (!isOpen) return null;

  // Group activities by date
  const groupedActivities = activities.reduce((acc, activity) => {
    const date = activity.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, (DailyActivity & { profile: string })[]>);

  // Get all dates in the week
  const getDatesInWeek = () => {
    const dates: string[] = [];
    const current = new Date(weekDates.start);
    while (current <= weekDates.end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates.reverse(); // Most recent first
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Hoje';
    }
    if (dateStr === yesterday.toISOString().split('T')[0]) {
      return 'Ontem';
    }

    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTime = (timestamp: { toDate: () => Date }) => {
    return timestamp.toDate().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-3xl">📊</span> Timeline de Atividades
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>

          {/* Profile Selector */}
          {loadingMembers ? (
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Nenhum membro cadastrado.</p>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {members.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className={`
                    flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-200 min-w-[80px]
                    ${selectedMember?.id === member.id
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 hover:bg-gray-200'
                    }
                  `}
                >
                  <Avatar
                    src={getAvatarUrl(member)}
                    alt={member.name}
                    fallback={getMemberEmoji(member)}
                    size="md"
                  />
                  <span className="font-medium text-sm">{member.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading || !selectedMember ? (
            <div className="flex items-center justify-center h-40">
              <LoadingSpinner />
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl block mb-4">😴</span>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                Nenhuma atividade ainda
              </h3>
              <p className="text-gray-500">
                {selectedMember.name} nao completou tarefas nesta semana.
                <br />
                Hora de comecar! 💪
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {getDatesInWeek().map((dateStr) => {
                const dayActivities = groupedActivities[dateStr] || [];
                const dayPoints = dayActivities.reduce((sum, a) => sum + a.points, 0);

                return (
                  <div key={dateStr} className="relative">
                    {/* Date Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                        style={{ backgroundColor: selectedMember.color || '#6366F1' }}
                      >
                        {new Date(dateStr + 'T12:00:00').getDate()}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 capitalize">
                          {formatDate(dateStr)}
                        </h3>
                        {dayActivities.length > 0 && (
                          <p className="text-sm text-gray-500">
                            {dayPoints} ponto{dayPoints !== 1 ? 's' : ''} • {dayActivities.length} tarefa{dayActivities.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Activities */}
                    {dayActivities.length > 0 ? (
                      <div className="ml-6 pl-6 border-l-2 border-gray-200 space-y-3">
                        {dayActivities.map((activity, idx) => {
                          const isPenalty = activity.type === 'penalty' || activity.points < 0;

                          return (
                            <div
                              key={`${activity.taskId || 'penalty'}-${idx}`}
                              className={`
                                rounded-2xl p-4 shadow-sm border hover:shadow-md transition-all duration-200 animate-fade-in
                                ${isPenalty
                                  ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'
                                  : 'bg-gradient-to-r from-gray-50 to-white border-gray-100'
                                }
                              `}
                              style={{
                                animationDelay: `${idx * 100}ms`,
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-3xl">{activity.taskEmoji}</span>
                                <div className="flex-1">
                                  <h4 className={`font-medium ${isPenalty ? 'text-red-800' : 'text-gray-800'}`}>
                                    {activity.taskTitle}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    {formatTime(activity.completedAt)}
                                    {isPenalty && <span className="ml-2 text-red-500">Penalidade</span>}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className={`text-lg font-bold ${isPenalty ? 'text-red-600' : ''}`} style={!isPenalty ? { color: selectedMember.color } : {}}>
                                    {activity.points > 0 ? '+' : ''}{activity.points}
                                  </span>
                                  <p className="text-xs text-gray-500">
                                    {isPenalty ? 'Ops! 😢' : getRandomMessage()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="ml-6 pl-6 border-l-2 border-gray-100">
                        <p className="text-gray-400 text-sm italic py-2">
                          Dia de descanso 😌
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {selectedMember && (
          <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 rounded-b-3xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar
                  src={getAvatarUrl(selectedMember)}
                  alt={selectedMember.name}
                  fallback={getMemberEmoji(selectedMember)}
                  size="lg"
                />
                <div>
                  <h4 className="font-bold text-gray-800">{selectedMember.name}</h4>
                  <p className="text-sm text-gray-500">Resumo da semana</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold" style={{ color: selectedMember.color }}>
                  {activities.reduce((sum, a) => sum + a.points, 0)}
                </span>
                <p className="text-sm text-gray-500">pontos totais</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
