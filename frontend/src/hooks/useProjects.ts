import { useCallback, useEffect, useState } from 'react';
import api from '../lib/axios';
import type { Project } from '../types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ projects: Project[] }>('/projects');
      setProjects(data.projects);
    } catch {
      setError('Failed to load projects. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const createProject = useCallback(
    async (name: string, description?: string): Promise<Project> => {
      const { data } = await api.post<Project>('/projects', { name, description });
      setProjects((prev) => [data, ...prev]);
      return data;
    },
    [],
  );

  const updateProject = useCallback(
    async (id: string, name: string, description?: string): Promise<Project> => {
      const { data } = await api.patch<Project>(`/projects/${id}`, { name, description });
      setProjects((prev) => prev.map((p) => (p.id === id ? data : p)));
      return data;
    },
    [],
  );

  const deleteProject = useCallback(async (id: string) => {
    await api.delete(`/projects/${id}`);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { projects, isLoading, error, refetch: fetch, createProject, updateProject, deleteProject };
}
