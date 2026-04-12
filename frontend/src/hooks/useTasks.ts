import { useCallback, useEffect, useState } from 'react';
import api from '../lib/axios';
import type { Task, Status } from '../types';

interface Filters {
  status?: Status;
  assignee?: string;
}

export function useTasks(projectId: string, filters: Filters = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.assignee) params.set('assignee', filters.assignee);

      const { data } = await api.get<{ tasks: Task[] }>(
        `/projects/${projectId}/tasks?${params.toString()}`,
      );
      setTasks(data.tasks);
    } catch {
      setError('Failed to load tasks.');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, filters.status, filters.assignee]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const createTask = useCallback(
    async (payload: Partial<Task>): Promise<Task> => {
      const { data } = await api.post<Task>(`/projects/${projectId}/tasks`, payload);
      setTasks((prev) => [data, ...prev]);
      return data;
    },
    [projectId],
  );

  /** Optimistic update */
  const updateTask = useCallback(async (id: string, payload: Partial<Task>): Promise<Task> => {
    // Optimistically update
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...payload } : t)));
    try {
      const { data } = await api.patch<Task>(`/tasks/${id}`, payload);
      setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
      return data;
    } catch (err) {
      // Revert on failure by refetching
      fetch();
      throw err;
    }
  }, [fetch]);

  const deleteTask = useCallback(async (id: string) => {
    await api.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { tasks, setTasks, isLoading, error, refetch: fetch, createTask, updateTask, deleteTask };
}
