'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import confetti from 'canvas-confetti';
import { Task, TaskFormData } from '@/types';
import { useTasks } from '@/hooks/useTasks';
import { updateTaskStatus, createTask } from '@/lib/firestore';
import { playCoinSound, initSounds } from '@/lib/sounds';
import { TaskColumn } from './TaskColumn';
import { TaskCard } from './TaskCard';
import { FilterBar } from './FilterBar';
import { CreateTaskModal } from './CreateTaskModal';
import { CompletedByModal } from './CompletedByModal';
import { LoadingSpinner } from './LoadingSpinner';

export function KanbanBoard() {
  const { todoTasks, doneTasks, loading, filter, setFilter, personFilter, setPersonFilter, checkAndResetTasks } = useTasks();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingCompleteTask, setPendingCompleteTask] = useState<Task | null>(null);
  const [resetting, setResetting] = useState(false);

  // Initialize sounds on mount
  useEffect(() => {
    initSounds();
  }, []);

  // Configure sensors for both mouse and touch
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = [...todoTasks, ...doneTasks].find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const task = [...todoTasks, ...doneTasks].find((t) => t.id === taskId);
    if (!task) return;

    const overId = over.id as string;
    const isOverTodo = overId === 'todo' || todoTasks.some((t) => t.id === overId);
    const isOverDone = overId === 'done' || doneTasks.some((t) => t.id === overId);

    // Determine new status based on where it was dropped
    if (isOverDone && task.status !== 'done') {
      // Show modal to ask who completed it
      setPendingCompleteTask(task);
    } else if (isOverTodo && task.status !== 'todo') {
      // Moving back to todo
      await updateTaskStatus(taskId, 'todo');
    }
  };

  const handleCompleteTask = async (memberName: string) => {
    if (!pendingCompleteTask) return;

    // Play sound and confetti!
    playCoinSound();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
    });

    await updateTaskStatus(
      pendingCompleteTask.id,
      'done',
      memberName,
      pendingCompleteTask.title,
      pendingCompleteTask.emoji
    );
    setPendingCompleteTask(null);
  };

  // Get today's date formatted
  const getTodayFormatted = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    };
    return today.toLocaleDateString('pt-BR', options);
  };

  const handleCreateTask = async (data: TaskFormData) => {
    await createTask(data, 'Sistema');
  };

  const handleResetTasks = async () => {
    setResetting(true);
    try {
      await checkAndResetTasks();
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Today Header */}
      <div className="bg-white rounded-2xl shadow-lg p-4 border-2 border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📅</span>
            <div>
              <h2 className="text-xl font-bold text-gray-800 capitalize">
                {getTodayFormatted()}
              </h2>
              <p className="text-sm text-gray-500">
                Mostrando tarefas de hoje
              </p>
            </div>
          </div>
          <button
            onClick={handleResetTasks}
            disabled={resetting}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
            title="Atualizar tarefas do dia"
          >
            <span className={`text-lg ${resetting ? 'animate-spin' : ''}`}>🔄</span>
            <span className="hidden sm:inline">{resetting ? 'Atualizando...' : 'Atualizar'}</span>
          </button>
        </div>
      </div>

      <FilterBar
        filter={filter}
        setFilter={setFilter}
        personFilter={personFilter}
        setPersonFilter={setPersonFilter}
        onCreateTask={() => setIsModalOpen(true)}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
          <TaskColumn
            id="todo"
            title="A Fazer"
            emoji="📋"
            tasks={todoTasks}
            color="#6366F1"
            onCompleteTask={(task) => setPendingCompleteTask(task)}
          />
          <TaskColumn
            id="done"
            title="Pronto!"
            emoji="✅"
            tasks={doneTasks}
            color="#10B981"
          />
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      <CompletedByModal
        isOpen={!!pendingCompleteTask}
        taskTitle={pendingCompleteTask?.title || ''}
        onSelect={handleCompleteTask}
        onCancel={() => setPendingCompleteTask(null)}
      />
    </div>
  );
}
