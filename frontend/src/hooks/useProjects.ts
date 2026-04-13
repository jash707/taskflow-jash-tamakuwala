import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import type { Project } from '../types';

export function useProjects() {
  const queryClient = useQueryClient();

  // Fetch all projects
  const {
    data: projects = [],
    isPending: isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.get<{ projects: Project[] }>('/projects');
      return data.projects;
    },
  });

  // Create Project Mutation
  const createMutation = useMutation({
    mutationFn: async ({ name, description, code }: { name: string; description?: string; code?: string }) => {
      const { data } = await api.post<Project>('/projects', { name, description, code });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Update Project Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, name, description, code }: { id: string; name: string; description?: string; code?: string }) => {
      const { data } = await api.patch<Project>(`/projects/${id}`, { name, description, code });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Delete Project Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Backwards compatible return signature for existing UI components
  return {
    projects,
    isLoading,
    error: queryError ? 'Failed to load projects. Please try again.' : null,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
    createProject: async (name: string, description?: string, code?: string) => 
      createMutation.mutateAsync({ name, description, code }),
    updateProject: async (id: string, name: string, description?: string, code?: string) => 
      updateMutation.mutateAsync({ id, name, description, code }),
    deleteProject: async (id: string) => 
      deleteMutation.mutateAsync(id),
  };
}
