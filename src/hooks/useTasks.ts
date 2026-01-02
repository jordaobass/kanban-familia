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

  const filteredTasks = tasks.filter((task) => {
    if (filter !== 'all' && task.category !== filter) return false;
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
