'use client';

import { useState } from 'react';
import { Task, PROFILES, WEEKDAYS, ProfileName, TaskCategory, RecurrenceType, TimeOfDay } from '@/types';
import { useTasks } from '@/hooks/useTasks';
import { deleteTask, updateTask } from '@/lib/firestore';
import { EditTaskModal } from './EditTaskModal';
import { LoadingSpinner } from './LoadingSpinner';

type FilterCategory = 'all' | TaskCategory;
type FilterPerson = 'all' | ProfileName;
type FilterRecurrence = 'all' | RecurrenceType;

export function TaskManager() {
  const { tasks, loading } = useTasks();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<{ task: Task; instances: Task[] } | null>(null);

  // Filter states
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [filterPerson, setFilterPerson] = useState<FilterPerson>('all');
  const [filterRecurrence, setFilterRecurrence] = useState<FilterRecurrence>('all');

  // Apply filters
  const filteredTasks = tasks.filter(task => {
    if (filterCategory !== 'all' && task.category !== filterCategory) return false;
    if (filterPerson !== 'all' && task.assignedTo !== filterPerson) return false;
    if (filterRecurrence !== 'all' && task.recurrence.type !== filterRecurrence) return false;
    return true;
  });

  // Group tasks by title and recurrence (to show unique task types)
  const uniqueTasks = filteredTasks.reduce((acc, task) => {
    const key = `${task.title}-${task.emoji}-${task.recurrence.type}-${task.recurrence.dayOfWeek || ''}`;
    if (!acc[key]) {
      acc[key] = {
        ...task,
        instances: [task],
      };
    } else {
      acc[key].instances.push(task);
    }
    return acc;
  }, {} as Record<string, Task & { instances: Task[] }>);

  const taskGroups = Object.values(uniqueTasks);

  const clearFilters = () => {
    setFilterCategory('all');
    setFilterPerson('all');
    setFilterRecurrence('all');
  };

  const hasActiveFilters = filterCategory !== 'all' || filterPerson !== 'all' || filterRecurrence !== 'all';

  const handleDeleteGroup = async (instances: Task[]) => {
    setDeletingId(instances[0].id);
    try {
      await Promise.all(instances.map(t => deleteTask(t.id)));
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const handleDeleteSingle = async (taskId: string) => {
    setDeletingId(taskId);
    try {
      await deleteTask(taskId);
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const handleEditGroup = async (
    taskId: string,
    data: {
      title: string;
      emoji: string;
      category: TaskCategory;
      recurrence: {
        type: RecurrenceType;
        dayOfWeek?: number;
      };
      timeOfDay?: TimeOfDay | null;
    }
  ) => {
    if (!editingTask) return;

    // Update all instances of this task group
    await Promise.all(
      editingTask.instances.map((t) =>
        updateTask(t.id, data)
      )
    );
    setEditingTask(null);
  };

  const getRecurrenceLabel = (task: Task) => {
    switch (task.recurrence.type) {
      case 'none':
        return 'Unica';
      case 'daily':
        return 'Diaria';
      case 'weekly':
        return WEEKDAYS[task.recurrence.dayOfWeek || 0];
      default:
        return '';
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
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          ⚙️ Gerenciar Tarefas
        </h2>
        <p className="text-gray-600">
          {taskGroups.length} tipo(s) de tarefa | {filteredTasks.length} tarefa(s) {hasActiveFilters && `(filtradas de ${tasks.length})`}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border-2 border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🔍</span>
          <span className="font-medium text-gray-700">Filtros</span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
            >
              <span>✕</span> Limpar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Category Filter */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Categoria</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as FilterCategory)}
              className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-sm"
            >
              <option value="all">Todas</option>
              <option value="child">🧒 Crianca</option>
              <option value="adult">👨 Adulto</option>
            </select>
          </div>

          {/* Person Filter */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Pessoa</label>
            <select
              value={filterPerson}
              onChange={(e) => setFilterPerson(e.target.value as FilterPerson)}
              className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-sm"
            >
              <option value="all">Todas</option>
              {PROFILES.map(profile => (
                <option key={profile.name} value={profile.name}>
                  {profile.emoji} {profile.name}
                </option>
              ))}
            </select>
          </div>

          {/* Recurrence Filter */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Recorrencia</label>
            <select
              value={filterRecurrence}
              onChange={(e) => setFilterRecurrence(e.target.value as FilterRecurrence)}
              className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-sm"
            >
              <option value="all">Todas</option>
              <option value="none">1️⃣ Unica</option>
              <option value="daily">📅 Diaria</option>
              <option value="weekly">🗓️ Semanal</option>
            </select>
          </div>
        </div>
      </div>

      {taskGroups.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <span className="text-6xl block mb-4">{hasActiveFilters ? '🔍' : '📝'}</span>
          <p className="text-xl">
            {hasActiveFilters ? 'Nenhuma tarefa encontrada' : 'Nenhuma tarefa cadastrada'}
          </p>
          <p>
            {hasActiveFilters ? (
              <button onClick={clearFilters} className="text-purple-600 hover:text-purple-800 underline">
                Limpar filtros
              </button>
            ) : (
              'Crie tarefas no quadro principal'
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {taskGroups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-2xl shadow-lg p-4 border-2 border-gray-100"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{group.emoji}</span>

                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800">{group.title}</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      group.category === 'child'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {group.category === 'child' ? '🧒 Crianca' : '👨 Adulto'}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                      {getRecurrenceLabel(group)}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                      {group.instances.length} pessoa(s)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Show assigned profiles */}
                  <div className="flex -space-x-2">
                    {group.instances.map((inst) => {
                      const profile = PROFILES.find(p => p.name === inst.assignedTo);
                      return profile ? (
                        <span
                          key={inst.id}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-lg border-2 border-white"
                          style={{ backgroundColor: profile.bgColor }}
                          title={profile.name}
                        >
                          {profile.emoji}
                        </span>
                      ) : null;
                    })}
                  </div>

                  {/* Edit button */}
                  <button
                    onClick={() => setEditingTask({ task: group, instances: group.instances })}
                    className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-xl transition-colors"
                    title="Editar"
                  >
                    <span className="text-xl">✏️</span>
                  </button>

                  {/* Delete button */}
                  {confirmDelete === group.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteGroup(group.instances)}
                        disabled={deletingId === group.id}
                        className="px-3 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 disabled:opacity-50"
                      >
                        {deletingId === group.id ? '...' : 'Confirmar'}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-300"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(group.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      title="Excluir"
                    >
                      <span className="text-xl">🗑️</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Expandable detail showing each person's task */}
              {group.instances.length > 1 && (
                <details className="mt-3">
                  <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                    Ver detalhes por pessoa
                  </summary>
                  <div className="mt-2 pl-14 space-y-2">
                    {group.instances.map((inst) => {
                      const profile = PROFILES.find(p => p.name === inst.assignedTo);
                      return (
                        <div key={inst.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                          <div className="flex items-center gap-2">
                            <span>{profile?.emoji}</span>
                            <span className="font-medium" style={{ color: profile?.color }}>
                              {inst.assignedTo}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              inst.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {inst.status === 'done' ? 'Feito' : 'Pendente'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteSingle(inst.id)}
                            disabled={deletingId === inst.id}
                            className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                          >
                            {deletingId === inst.id ? '...' : 'Excluir'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      <EditTaskModal
        isOpen={!!editingTask}
        task={editingTask?.task || null}
        onClose={() => setEditingTask(null)}
        onSubmit={handleEditGroup}
      />
    </div>
  );
}
