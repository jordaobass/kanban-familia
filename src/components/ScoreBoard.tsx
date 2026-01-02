'use client';

import { useState } from 'react';
import { useScores } from '@/hooks/useScores';
import { LoadingSpinner } from './LoadingSpinner';
import { getWeekDates, getWeeksOfMonth, getWeekString } from '@/types';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function ScoreBoard() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());

  const weeksInMonth = getWeeksOfMonth(selectedYear, selectedMonth);
  const currentWeekStr = getWeekString(now);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(() => {
    const idx = weeksInMonth.findIndex(w => w === currentWeekStr);
    return idx >= 0 ? idx : 0;
  });

  const selectedWeek = weeksInMonth[selectedWeekIndex] || weeksInMonth[0];
  const { scores, loading, setCurrentWeek } = useScores(selectedWeek);

  // Update currentWeek when selection changes
  const handleWeekChange = (index: number) => {
    setSelectedWeekIndex(index);
    setCurrentWeek(weeksInMonth[index]);
  };

  const handleMonthChange = (delta: number) => {
    let newMonth = selectedMonth + delta;
    let newYear = selectedYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }

    setSelectedYear(newYear);
    setSelectedMonth(newMonth);
    setSelectedWeekIndex(0);

    const newWeeks = getWeeksOfMonth(newYear, newMonth);
    setCurrentWeek(newWeeks[0]);
  };

  const weekDates = getWeekDates(selectedWeek);
  const formatDate = (date: Date) => {
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  // Calculate ranks considering ties
  const getRank = (index: number): number => {
    if (index === 0) return 1;
    // If current score equals previous score, same rank
    if (scores[index].points === scores[index - 1].points) {
      return getRank(index - 1);
    }
    // Otherwise, rank is index + 1
    return index + 1;
  };

  const getMedal = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '⭐';
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-400';
      case 2:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 border-2 border-gray-300';
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300';
      default:
        return 'bg-white';
    }
  };

  // Check if there are any ties
  const hasTies = scores.some((score, index) =>
    index > 0 && score.points === scores[index - 1].points && score.points > 0
  );

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          🏆 Placar da Semana 🏆
        </h2>
        <p className="text-gray-600">Quem completou mais tarefas?</p>
      </div>

      {/* Month/Week Selector */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border-2 border-gray-100">
        {/* Month Navigation */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={() => handleMonthChange(-1)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <span className="text-xl">◀️</span>
          </button>
          <span className="text-lg font-bold text-gray-800 min-w-[150px] text-center">
            {MONTHS[selectedMonth]} {selectedYear}
          </span>
          <button
            onClick={() => handleMonthChange(1)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <span className="text-xl">▶️</span>
          </button>
        </div>

        {/* Week Selector */}
        <div className="flex flex-wrap justify-center gap-2">
          {weeksInMonth.map((week, index) => {
            const dates = getWeekDates(week);
            const isCurrentWeek = week === currentWeekStr;
            const isSelected = index === selectedWeekIndex;

            return (
              <button
                key={week}
                onClick={() => handleWeekChange(index)}
                className={`
                  px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${isSelected
                    ? 'bg-purple-500 text-white shadow-lg scale-105'
                    : isCurrentWeek
                      ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <div className="flex flex-col items-center">
                  <span>Sem {index + 1}</span>
                  <span className="text-xs opacity-75">
                    {formatDate(dates.start)} - {formatDate(dates.end)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Current selection info */}
        <p className="text-center text-sm text-gray-500 mt-3">
          📅 {formatDate(weekDates.start)} a {formatDate(weekDates.end)}
          {selectedWeek === currentWeekStr && (
            <span className="ml-2 text-green-600 font-medium">(Semana atual)</span>
          )}
        </p>
      </div>

      {hasTies && (
        <p className="text-purple-600 text-sm mb-4 flex items-center justify-center gap-1">
          <span>🤝</span> Empate detectado!
        </p>
      )}

      <div className="space-y-4">
        {scores.map((score, index) => {
          const rank = getRank(index);
          const isTied = index > 0 && score.points === scores[index - 1].points && score.points > 0;

          return (
            <div
              key={score.profile.name}
              className={`
                flex items-center gap-4 p-6 rounded-2xl shadow-lg transition-all duration-300 hover:scale-[1.02]
                ${getRankStyle(rank)}
              `}
            >
              <div className="flex flex-col items-center">
                <span className="text-4xl">{getMedal(rank)}</span>
                {isTied && (
                  <span className="text-xs text-purple-600 font-medium">🤝</span>
                )}
              </div>

              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-4xl"
                style={{ backgroundColor: score.profile.bgColor }}
              >
                {score.profile.emoji}
              </div>

              <div className="flex-1">
                <h3
                  className="text-xl font-bold"
                  style={{ color: score.profile.color }}
                >
                  {score.profile.name}
                </h3>
                <p className="text-gray-500 text-sm">
                  {score.tasksCompleted} tarefa{score.tasksCompleted !== 1 ? 's' : ''} completada{score.tasksCompleted !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="text-right">
                <span className="text-4xl font-bold text-gray-800">{score.points}</span>
                <p className="text-gray-500 text-sm">pontos</p>
              </div>
            </div>
          );
        })}
      </div>

      {scores.every((s) => s.points === 0) && (
        <div className="text-center py-12 text-gray-500">
          <span className="text-6xl block mb-4">🎯</span>
          <p className="text-xl">Nenhum ponto ainda este mes!</p>
          <p>Complete tarefas para ganhar pontos.</p>
        </div>
      )}
    </div>
  );
}
