'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Task } from '@/types';
import { TaskCard } from './TaskCard';

interface TaskColumnProps {
  id: string;
  title: string;
  emoji: string;
  tasks: Task[];
  color: string;
  onCompleteTask?: (task: Task) => void;
}

export function TaskColumn({ id, title, emoji, tasks, color, onCompleteTask }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col h-full rounded-3xl p-4 transition-all duration-300
        ${isOver ? 'ring-4 ring-offset-2 scale-[1.02]' : ''}
      `}
      style={{
        backgroundColor: `${color}15`,
        borderColor: color,
        borderWidth: '3px',
        ...(isOver ? { ringColor: color } : {}),
      }}
    >
      <div className="flex items-center justify-center gap-2 mb-4 pb-3 border-b-2" style={{ borderColor: `${color}40` }}>
        <span className="text-3xl">{emoji}</span>
        <h2 className="text-xl font-bold" style={{ color }}>
          {title}
        </h2>
        <span
          className="ml-2 px-3 py-1 rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-3 overflow-y-auto pr-1 min-h-[200px]">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
              <span className="text-5xl mb-2">
                {id === 'todo' ? '📋' : '🎉'}
              </span>
              <p className="text-center">
                {id === 'todo' ? 'Nenhuma tarefa pendente!' : 'Arraste tarefas para ca!'}
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={onCompleteTask ? () => onCompleteTask(task) : undefined}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
