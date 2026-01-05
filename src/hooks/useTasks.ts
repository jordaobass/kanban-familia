'use client';

import { useState, useEffect } from 'react';
import { Task, TaskCategory, ProfileName } from '@/types';
import { subscribeTasks, resetDailyTasks } from '@/lib/firestore';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TaskCategory | 'all'>('all');
  const [personFilter, setPersonFilter] = useState<ProfileName | 'all'>('all');

  useEffect(() => {
    const unsubscribe = subscribeTasks((fetchedTasks) => {
      setTasks(fetchedTasks);
      setLoading(false);
    });

    // Check for task reset on load
    resetDailyTasks().catch(console.error);

    // Set up interval to check for resets every hour
    const resetInterval = setInterval(() => {
      resetDailyTasks().catch(console.error);
    }, 60 * 60 * 1000);

    return () => {
      unsubscribe();
      clearInterval(resetInterval);
    };
  }, []);

  // Filter tasks that should appear today
  const isTaskForToday = (task: Task): boolean => {
    const today = new Date().getDay(); // 0-6 (Sunday = 0)

    switch (task.recurrence.type) {
      case 'daily':
        // Daily tasks always show
        return true;
      case 'weekly':
        // Weekly tasks show only on their designated day
        return task.recurrence.dayOfWeek === today;
      case 'none':
      default:
        // One-time tasks always show until done
        return true;
    }
  };

  const filteredTasks = tasks.filter((task) => {
    // First filter by "today" for Kanban view
    if (!isTaskForToday(task)) return false;
    // Then apply category filter
    if (filter !== 'all' && task.category !== filter) return false;
    // Then apply person filter
    if (personFilter !== 'all' && task.assignedTo !== personFilter) return false;
    return true;
  });

  const todoTasks = filteredTasks.filter((task) => task.status === 'todo');
  const doneTasks = filteredTasks.filter((task) => task.status === 'done');

  return {
    tasks: filteredTasks,
    todoTasks,
    doneTasks,
    loading,
    filter,
    setFilter,
    personFilter,
    setPersonFilter,
  };
}
