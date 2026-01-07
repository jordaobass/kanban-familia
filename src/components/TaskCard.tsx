'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, PROFILES, TIME_OF_DAY } from '@/types';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onComplete?: () => void;
}

export function TaskCard({ task, isDragging, onComplete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isChildTask = task.category === 'child';
  const assignedProfile = task.assignedTo
    ? PROFILES.find((p) => p.name === task.assignedTo)
    : null;
  const timeOfDayInfo = task.timeOfDay
    ? TIME_OF_DAY.find((t) => t.value === task.timeOfDay)
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        flex items-center gap-4 p-4 rounded-2xl shadow-md cursor-grab active:cursor-grabbing
        transition-all duration-200 touch-manipulation select-none
        ${isDragging ? 'opacity-50 scale-105 shadow-xl rotate-2' : 'hover:shadow-lg hover:scale-[1.02]'}
        ${isChildTask ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200' : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200'}
      `}
    >
      <span className="text-4xl flex-shrink-0">{task.emoji}</span>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-800 text-lg truncate">
          {task.title}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              isChildTask
                ? 'bg-amber-200 text-amber-800'
                : 'bg-blue-200 text-blue-800'
            }`}
          >
            {isChildTask ? 'Crianca' : 'Adulto'}
          </span>
          {timeOfDayInfo && (
            <span className="text-xs px-2 py-1 rounded-full font-medium bg-orange-100 text-orange-700">
              {timeOfDayInfo.emoji}
            </span>
          )}
          {assignedProfile && (
            <span
              className="text-xs px-2 py-1 rounded-full font-medium"
              style={{
                backgroundColor: assignedProfile.bgColor,
                color: assignedProfile.color,
              }}
            >
              {assignedProfile.emoji} {assignedProfile.name}
            </span>
          )}
        </div>
      </div>

      {task.status === 'done' && task.completedBy && (
        <div className="flex-shrink-0 flex flex-col items-center">
          <span className="text-2xl">{PROFILES.find((p) => p.name === task.completedBy)?.emoji}</span>
          {task.completedAt && (
            <span className="text-xs text-gray-500">
              {task.completedAt.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      )}

      {task.status === 'todo' && onComplete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onComplete();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="
            flex-shrink-0 relative group
            w-14 h-14 rounded-full
            bg-gradient-to-br from-green-400 via-emerald-500 to-green-600
            hover:from-green-500 hover:via-emerald-600 hover:to-green-700
            active:scale-90
            transition-all duration-200
            shadow-lg hover:shadow-xl hover:shadow-green-300/50
            flex items-center justify-center
            animate-pulse-slow
          "
          title="Finalizar tarefa"
        >
          {/* Glow ring */}
          <span className="absolute inset-0 rounded-full bg-green-400 opacity-0 group-hover:opacity-30 group-hover:animate-ping" />

          {/* Inner circle */}
          <span className="absolute inset-1 rounded-full bg-gradient-to-br from-white/30 to-transparent" />

          {/* Icon */}
          <span className="text-3xl text-white drop-shadow-md relative z-10 group-hover:scale-125 transition-transform font-bold">
            ✓
          </span>
        </button>
      )}
    </div>
  );
}
