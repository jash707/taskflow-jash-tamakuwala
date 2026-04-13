import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import type { Task, Status } from '../types';

interface Filters {
  status?: Status;
  assignee?: string;
  label?: string;
}

export function useTasks(projectId: string, filters: Filters = {}) {
  const queryClient = useQueryClient();
  const queryKey = ['tasks', projectId, filters];

  const {
    data: tasks = [],
    isPending: isLoading,
    error: queryError,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.assignee) params.set('assignee', filters.assignee);
      if (filters.label) params.set('label', filters.label);

      const { data } = await api.get<{ tasks: Task[] }>(
        `/projects/${projectId}/tasks?${params.toString()}`
      );
      return data.tasks;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: Partial<Task>) => {
      const { data } = await api.post<Task>(`/projects/${projectId}/tasks`, payload);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', projectId] }),
  });

  /** Optimistic update using React Query's onMutate */
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<Task> }) => {
      const { data } = await api.patch<Task>(`/tasks/${id}`, payload);
      return data;
    },
    onMutate: async ({ id, payload }) => {
      // Cancel any outgoing refetches so they don't overwrite optimistic UI
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey);

      // Optimistically update to the new value
      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          queryKey,
          previousTasks.map((t) => (t.id === id ? { ...t, ...payload } : t))
        );
      }

      // Return a context with the previous tasks for rollback
      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKey, context.previousTasks);
      }
    },
    onSettled: () => {
      // Sync on success or failure
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tasks/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', projectId] }),
  });

  return {
    tasks,
    setTasks: (t: Task[]) => queryClient.setQueryData(queryKey, t),
    isLoading,
    error: queryError ? 'Failed to load tasks.' : null,
    refetch: () => queryClient.invalidateQueries({ queryKey }),
    createTask: async (payload: Partial<Task>) => createMutation.mutateAsync(payload),
    updateTask: async (id: string, payload: Partial<Task>) => updateMutation.mutateAsync({ id, payload }),
    deleteTask: async (id: string) => deleteMutation.mutateAsync(id),
  };
}
